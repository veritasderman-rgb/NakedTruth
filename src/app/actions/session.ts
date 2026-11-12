'use server';

import { getSql, isUuid } from '@/lib/db';
import { sendInviteEmail, sendResultsReadyEmail } from '@/lib/mail';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { isLocale, localePath, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { getLocale } from '@/lib/locale';
import { consumeVip, rememberedVip } from '@/lib/vip';
import { countEvent } from '@/lib/events';

type Sql = ReturnType<typeof getSql>;

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  const host = (await headers()).get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

// Get the user for an email (creating it if needed), or create an anonymous one.
async function getOrCreateUser(sql: Sql, email?: string): Promise<string> {
  const normalizedEmail = email?.toLowerCase().trim();
  if (normalizedEmail) {
    const [user] = await sql`
      insert into users (email) values (${normalizedEmail})
      on conflict (email) do update set email = excluded.email
      returning id`;
    return user.id;
  }
  const [user] = await sql`insert into users (is_anonymous) values (true) returning id`;
  return user.id;
}

// True if the user holds a non-expired 'premium' entitlement.
async function userHasPremium(sql: Sql, userId: string): Promise<boolean> {
  const [row] = await sql`select has_entitlement(${userId}::uuid, 'premium') as ok`;
  return !!row?.ok;
}

// Records the language the session was started in and sends partner A to the
// questionnaire in that language.
async function openSession(sql: Sql, sessionId: string, locale: Locale): Promise<never> {
  const [session] = await sql`
    update sessions set locale = ${locale} where id = ${sessionId}
    returning partner_a_access_token`;
  if (!session) throw new Error('Session creation failed');
  redirect(localePath(locale, `/session/${sessionId}?token=${session.partner_a_access_token}`));
}

function sessionLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

// Returned (instead of redirecting) when a premium pack is requested but the
// user hasn't unlocked premium yet, so the UI can open the paywall.
export type StartSessionResult = { paywall: true; userId: string } | undefined;

export async function startSession(
  email?: string,
  questionCount: number = 20,
  tierPref: string = 'vanilla',
  maxIntensity: number = 3,
  themes: string[] = [],
  pack?: string
): Promise<StartSessionResult> {
  const sql = getSql();

  // 1. Get or create the user
  const userId = await getOrCreateUser(sql, email);

  // Premium gate: a pack session requires the 'premium' entitlement. Check before
  // creating a couple/session so a non-paying attempt leaves no junk; the UI gets
  // a paywall signal instead of an error (create_pack_session also enforces this).
  if (pack && !(await userHasPremium(sql, userId))) {
    // A VIP code remembered in this browser stands in for the payment.
    const vip = await rememberedVip();
    if (!vip || !(await consumeVip(vip))) return { paywall: true, userId };
    await sql`
      insert into entitlements (user_id, product_code, source)
      values (${userId}, 'premium', ${`vip:${vip}`})
      on conflict (user_id, product_code) do nothing`;
    await countEvent('vip_unlock', await getLocale());
  }

  // 2. Reuse the user's latest couple, otherwise create a standalone one.
  // User A starts, then later invites User B.
  const [member] = await sql`
    select couple_id from couple_members
    where user_id = ${userId} order by joined_at desc limit 1`;

  let coupleId: string = member?.couple_id;

  if (!coupleId) {
    const [couple] = await sql`insert into couples (created_by_user_id) values (${userId}) returning id`;
    coupleId = couple.id;
    await sql`insert into couple_members (couple_id, user_id, role) values (${coupleId}, ${userId}, 'partner_a')`;
  }

  // 3. Create the session. Premium packs use create_pack_session (gated);
  // everything else uses create_next_session with the tier/intensity/theme prefs.
  const [created] = pack
    ? await sql`
        select create_pack_session(
          ${coupleId}::uuid, ${userId}::uuid, ${userId}::uuid,
          ${questionCount}::int, ${pack}::text, ${userId}::uuid
        ) as id`
    : await sql`
        select create_next_session(
          ${coupleId}::uuid, ${userId}::uuid, ${userId}::uuid,
          ${questionCount}::int, ${tierPref}::tier_preference, ${maxIntensity}::int,
          ${themes.length > 0 ? themes : null}::text[]
        ) as id`;

  // 4. Send partner A to the questionnaire
  await openSession(sql, created.id, await getLocale());
}

export async function joinSession(sessionId: string) {
  const sql = getSql();

  const [session] = await sql`select couple_id from sessions where id = ${sessionId}`;
  if (!session) throw new Error('Relace nebyla nalezena');

  // Create anonymous User B and attach them to the session + couple
  const userId = await getOrCreateUser(sql);
  await sql`update sessions set partner_b_user_id = ${userId} where id = ${sessionId}`;
  await sql`
    insert into couple_members (couple_id, user_id, role)
    values (${session.couple_id}, ${userId}, 'partner_b')
    on conflict do nothing`;

  return { success: true, userId };
}

// The caller proves who they are with their session access token; the role and
// user id are derived from it, never taken from the client. Once a partner has
// completed, their answers are final — a retried submit is a harmless no-op.
export async function submitAnswers(sessionId: string, token: string, answers: { questionId: number, kind: string, value: any }[]) {
  const sql = getSql();
  if (!isUuid(sessionId) || !isUuid(token)) throw new Error('Neplatná relace');

  const [session] = await sql`
    select partner_a_user_id, partner_b_user_id, partner_a_access_token, partner_b_access_token,
           partner_a_completed_at, partner_b_completed_at
    from sessions where id = ${sessionId}`;
  if (!session) throw new Error('Relace nebyla nalezena');

  const role =
    session.partner_a_access_token === token ? 'partner_a'
    : session.partner_b_access_token === token ? 'partner_b'
    : null;
  if (!role) throw new Error('Neplatný token');

  const userId: string | null = role === 'partner_a' ? session.partner_a_user_id : session.partner_b_user_id;
  if (!userId) throw new Error('Relace nebyla nalezena');

  const alreadyCompleted = role === 'partner_a' ? session.partner_a_completed_at : session.partner_b_completed_at;
  if (alreadyCompleted) return { success: true };

  const rows = answers.map((a) => ({
    question_id: a.questionId,
    answer_yes_no: a.kind === 'yes_no' ? a.value === true || a.value === 'true' : null,
    answer_frequency: a.kind === 'frequency_1_5' ? parseInt(a.value) : null,
    answer_text: a.kind === 'short_answer' ? a.value : null,
  }));

  // Upsert so a retry after a partial failure can't trip the unique constraint.
  await sql`
    insert into answers (session_id, question_id, user_id, answer_yes_no, answer_frequency, answer_text)
    select ${sessionId}::uuid, x.question_id, ${userId}::uuid, x.answer_yes_no, x.answer_frequency, x.answer_text
    from jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
      as x(question_id int, answer_yes_no boolean, answer_frequency smallint, answer_text text)
    on conflict (session_id, question_id, user_id) do update set
      answer_yes_no = excluded.answer_yes_no,
      answer_frequency = excluded.answer_frequency,
      answer_text = excluded.answer_text`;

  // Mark completion
  await sql`select complete_partner_submission(${sessionId}::uuid, ${userId}::uuid, ${role}::participant_role)`;

  // If this submission completed the session, email both partners (once).
  await maybeSendResultsEmail(sql, sessionId);

  return { success: true };
}

// Sends the "results are ready" email to both partners exactly once. The send is
// claimed atomically via a conditional update so concurrent final submits can't
// double-email; if the session isn't completed yet (or was already emailed) this
// is a no-op.
async function maybeSendResultsEmail(sql: Sql, sessionId: string) {
  const [claimed] = await sql`
    update sessions set results_email_sent_at = now()
    where id = ${sessionId} and status = 'completed' and results_email_sent_at is null
    returning partner_a_user_id, partner_b_user_id, partner_a_access_token, partner_b_access_token, locale`;

  if (!claimed) return;

  const baseUrl = await getBaseUrl();
  const locale = sessionLocale(claimed.locale);
  const recipients = [
    { userId: claimed.partner_a_user_id, token: claimed.partner_a_access_token },
    { userId: claimed.partner_b_user_id, token: claimed.partner_b_access_token },
  ];

  for (const r of recipients) {
    if (!r.userId) continue;
    const [u] = await sql`select email from users where id = ${r.userId}`;
    if (u?.email) {
      await sendResultsReadyEmail(u.email, `${baseUrl}${localePath(locale, `/session/${sessionId}?token=${r.token}`)}`, locale);
    }
  }
}

export async function invitePartner(sessionId: string, partnerBEmail?: string) {
  const sql = getSql();
  const normalizedEmail = partnerBEmail?.toLowerCase().trim();

  // 1. Session and couple info
  const [session] = await sql`select couple_id, partner_b_access_token from sessions where id = ${sessionId}`;
  if (!session) throw new Error('Session not found');

  // 2. Get or create User B, attach to session + couple
  const userBId = await getOrCreateUser(sql, normalizedEmail);
  await sql`update sessions set partner_b_user_id = ${userBId} where id = ${sessionId}`;
  await sql`
    insert into couple_members (couple_id, user_id, role)
    values (${session.couple_id}, ${userBId}, 'partner_b')
    on conflict do nothing`;

  // 3. Send email if provided
  // The invite goes out in the language the inviter is using right now.
  const baseUrl = await getBaseUrl();
  const locale = await getLocale();
  const inviteLink = `${baseUrl}${localePath(locale, `/session/${sessionId}?token=${session.partner_b_access_token}`)}`;

  if (normalizedEmail) {
    await sendInviteEmail(normalizedEmail, inviteLink, locale);
  }

  return { success: true, inviteLink };
}

export async function generateNextSession(coupleId: string, userId: string, questionCount?: number, tierPref?: string) {
  const sql = getSql();

  // Inherit intensity/theme preferences from the couple's latest session so a
  // repeat round keeps the same spice settings the pair originally chose.
  const [last] = await sql`
    select question_count, tier_pref, max_intensity, themes from sessions
    where couple_id = ${coupleId} order by session_number desc limit 1`;

  const count = questionCount || last?.question_count || 20;
  const tier = tierPref || last?.tier_pref || 'vanilla';
  const maxIntensity = last?.max_intensity || 3;
  const themes: string[] | null = last?.themes?.length > 0 ? last.themes : null;

  const [created] = await sql`
    select create_next_session(
      ${coupleId}::uuid, ${userId}::uuid, ${userId}::uuid,
      ${count}::int, ${tier}::tier_preference, ${maxIntensity}::int, ${themes}::text[]
    ) as id`;

  await openSession(sql, created.id, await getLocale());
}
