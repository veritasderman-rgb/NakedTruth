'use server';

import { createHash } from 'crypto';
import { appUrl } from '@/lib/app-url';
import { getSql, isUuid } from '@/lib/db';
import { countEvent } from '@/lib/events';
import { getExtra } from '@/lib/extra-content';
import { DEFAULT_LOCALE, fmt, isLocale, localePath, type Locale } from '@/lib/i18n';
import { isMailConfigured, normalizeEmail, sendLinksEmail } from '@/lib/mail';

export type AccessResult = 'sent' | 'invalid' | 'throttled' | 'unavailable' | 'failed';

// E-mails per address and day, over both actions below.
const DAILY_LIMIT = 3;

// Counts this attempt and says whether the address is still under the limit.
// Keyed by a hash, so the table holds no addresses.
async function underLimit(email: string): Promise<boolean> {
  const key = createHash('sha256').update(email).digest('hex');
  const [row] = await getSql()`
    insert into mail_throttle (key, day, count) values (${key}, current_date, 1)
    on conflict (key, day) do update set count = mail_throttle.count + 1
    returning count`;
  return row.count <= DAILY_LIMIT;
}

// Every private link stored for an address: Kinkometr results (and their paid
// reports) and couples-quiz sessions the address took part in.
async function linksFor(email: string, locale: Locale): Promise<{ label: string; href: string }[]> {
  const sql = getSql();
  const t = getExtra(locale).ui;
  const url = (path: string) => `${appUrl()}${localePath(locale, path)}`;
  const day = (d: string | Date) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(d));

  const profiles = await sql`
    select id, created_at, report_unlocked_at from kink_profiles
    where email = ${email} order by created_at desc limit 20`;
  const sessions = await sql`
    select s.id, s.created_at,
           case when ua.email = ${email} then s.partner_a_access_token else s.partner_b_access_token end as token
    from sessions s
    left join users ua on ua.id = s.partner_a_user_id
    left join users ub on ub.id = s.partner_b_user_id
    where ua.email = ${email} or ub.email = ${email}
    order by s.created_at desc limit 20`;

  return [
    ...profiles.flatMap((p) => [
      { label: fmt(t.mailLinkResult, { date: day(p.created_at) }), href: url(`/kinkometr/vysledek/${p.id}`) },
      ...(p.report_unlocked_at ? [{ label: fmt(t.mailLinkReport, { date: day(p.created_at) }), href: url(`/kinkometr/rozbor/${p.id}`) }] : []),
    ]),
    ...sessions.map((s) => ({ label: fmt(t.mailLinkQuiz, { date: day(s.created_at) }), href: url(`/session/${s.id}?token=${s.token}`) })),
  ];
}

// Keeps an e-mail with a Kinkometr result (whoever holds the private id owns
// it) and mails the owner their links.
export async function saveResultEmail(id: string, rawEmail: string, rawLocale: string): Promise<AccessResult> {
  const email = normalizeEmail(rawEmail);
  if (!email || !isUuid(id)) return 'invalid';
  if (!isMailConfigured()) return 'unavailable';
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  try {
    if (!(await underLimit(email))) return 'throttled';
    const sql = getSql();
    const saved = await sql`update kink_profiles set email = ${email} where id = ${id} and email is null returning id`;
    if (saved.length === 0) return 'invalid';
    if (await sendLinksEmail(email, locale, await linksFor(email, locale))) {
      await countEvent('link_saved', locale);
      return 'sent';
    }
    // Nothing was delivered, so do not keep the address either.
    await sql`update kink_profiles set email = null where id = ${id} and email = ${email}`;
    return 'failed';
  } catch (e) {
    console.error('[access] saving e-mail failed', e);
    return 'failed';
  }
}

// Mails every stored link to the address. The answer is the same whether or
// not anything is stored, so the form cannot be used to probe for addresses.
export async function requestLinks(rawEmail: string, rawLocale: string): Promise<AccessResult> {
  const email = normalizeEmail(rawEmail);
  if (!email) return 'invalid';
  if (!isMailConfigured()) return 'unavailable';
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  try {
    if (!(await underLimit(email))) return 'throttled';
    await countEvent('links_requested', locale);
    const links = await linksFor(email, locale);
    if (links.length > 0) await sendLinksEmail(email, locale, links);
    return 'sent';
  } catch (e) {
    console.error('[access] link request failed', e);
    return 'failed';
  }
}
