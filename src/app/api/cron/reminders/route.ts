import { getSql } from '@/lib/db';
import { sendReminderEmail } from '@/lib/mail';
import { DEFAULT_LOCALE, isLocale, localePath } from '@/lib/i18n';

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
      select s.id, s.partner_b_access_token, s.locale, u.email
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
      const locale = isLocale(s.locale) ? s.locale : DEFAULT_LOCALE;
      await sendReminderEmail(s.email, `${baseUrl}${localePath(locale, `/session/${s.id}?token=${s.partner_b_access_token}`)}`, locale);
      sent++;
    }
    // Mark processed regardless so anonymous (no-email) partner B sessions aren't
    // rescanned on every run.
    await getSql()`update sessions set reminder_sent_at = now() where id = ${s.id}`;
  }

  // Retention promised in the privacy policy: nothing older than 24 months.
  // Each quiz session is judged by its own age — a couple can be years old and
  // still be playing a round today. Couples and users go only once nothing of
  // theirs is left.
  let purged = 0;
  try {
    const sql = getSql();
    const profiles = await sql`delete from kink_profiles where created_at < now() - interval '24 months' returning id`;
    const sessions = await sql`delete from sessions where created_at < now() - interval '24 months' returning id`;
    await sql`
      delete from couples c where c.created_at < now() - interval '24 months'
        and not exists (select 1 from sessions s where s.couple_id = c.id)`;
    await sql`
      delete from users u where u.created_at < now() - interval '24 months'
        and not exists (select 1 from couple_members m where m.user_id = u.id)
        and not exists (select 1 from sessions s where u.id in (s.created_by_user_id, s.partner_a_user_id, s.partner_b_user_id))
        and not exists (select 1 from couples c where c.created_by_user_id = u.id)
        and not exists (select 1 from entitlements e where e.user_id = u.id)`;
    await sql`delete from mail_throttle where day < current_date - 7`;
    await sql`delete from purchase_confirmations where claimed_at < now() - interval '90 days'`;
    await sql`delete from stripe_events where received_at < now() - interval '90 days'`;
    purged = profiles.length + sessions.length;
  } catch (error) {
    console.error('[cron] retention purge failed', error);
  }

  return Response.json({ purged, processed: candidates.length, sent });
}
