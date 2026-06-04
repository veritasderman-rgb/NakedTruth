import { getSupabaseAdmin } from '@/lib/supabase';
import { sendReminderEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Hourly cron (see vercel.json): nudge partner B when partner A finished more
// than 24h ago and B still hasn't completed. Each session is reminded at most
// once (reminder_sent_at). Vercel Cron authenticates via the Authorization
// header when CRON_SECRET is set; we enforce it when configured.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const olderThan24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  // Lower bound: don't resurrect long-abandoned sessions (also avoids a flood of
  // stale reminders the first time this cron runs).
  const within7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;

  // partner_a_completed_at < cutoff also excludes nulls (a null is never < cutoff).
  const { data: candidates, error } = await supabase
    .from('sessions')
    .select('id, partner_b_user_id, partner_b_access_token')
    .lt('partner_a_completed_at', olderThan24h)
    .gt('partner_a_completed_at', within7d)
    .is('partner_b_completed_at', null)
    .neq('status', 'completed')
    .is('reminder_sent_at', null)
    .not('partner_b_user_id', 'is', null)
    .limit(200);

  if (error) {
    console.error('[cron/reminders] query failed', error);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }

  let sent = 0;
  for (const s of candidates ?? []) {
    const { data: u } = await supabase.from('users').select('email').eq('id', s.partner_b_user_id!).single();
    if (u?.email) {
      await sendReminderEmail(u.email, `${baseUrl}/session/${s.id}?token=${s.partner_b_access_token}`);
      sent++;
    }
    // Mark processed regardless so anonymous (no-email) partner B sessions aren't
    // rescanned every hour forever.
    await supabase.from('sessions').update({ reminder_sent_at: new Date().toISOString() }).eq('id', s.id);
  }

  return Response.json({ processed: candidates?.length ?? 0, sent });
}
