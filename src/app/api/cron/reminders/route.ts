import { getSql } from '@/lib/db';
import { sendReminderEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Daily cron (see vercel.json): nudge partner B when partner A finished more
// than 24h ago and B still hasn't completed. Each session is reminded at most
// once (reminder_sent_at). Vercel Cron authenticates via the Authorization
// header when CRON_SECRET is set; we enforce it when configured.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;

  // Partner A finished 24h–7d ago and B still hasn't. The 7d lower bound keeps
  // long-abandoned sessions from being resurrected. Email is null for anonymous
  // partner B.
  let candidates;
  try {
    candidates = await getSql()`
      select s.id, s.partner_b_access_token, u.email
      from sessions s
      join users u on u.id = s.partner_b_user_id
      where s.partner_a_completed_at < now() - interval '24 hours'
        and s.partner_a_completed_at > now() - interval '7 days'
        and s.partner_b_completed_at is null
        and s.status <> 'completed'
        and s.reminder_sent_at is null
      limit 200`;
  } catch (error) {
    console.error('[cron/reminders] query failed', error);
    return Response.json({ error: 'query_failed' }, { status: 500 });
  }

  let sent = 0;
  for (const s of candidates) {
    if (s.email) {
      await sendReminderEmail(s.email, `${baseUrl}/session/${s.id}?token=${s.partner_b_access_token}`);
      sent++;
    }
    // Mark processed regardless so anonymous (no-email) partner B sessions aren't
    // rescanned on every run.
    await getSql()`update sessions set reminder_sent_at = now() where id = ${s.id}`;
  }

  return Response.json({ processed: candidates.length, sent });
}
