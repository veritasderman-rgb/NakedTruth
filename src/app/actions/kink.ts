'use server';

import { redirect } from 'next/navigation';
import { getSql, isUuid } from '@/lib/db';
import { isLocale, localePath, DEFAULT_LOCALE } from '@/lib/i18n';
import { MISSING_MAX, cleanContext, isKinkMode, scoreAnswers } from '@/lib/kink';
import { getKinkProfileByInvite } from '@/lib/kink-store';

// Stores an anonymous Kinkometr result. Returns the private id (the owner's
// link) and, when the test was taken from an invite, the inviter's shareable
// token for the comparison URL. Cups are always recomputed on the server.
export async function saveKinkProfile(
  mode: string,
  answers: Record<string, unknown>,
  extra?: { inviteToken?: string | null; context?: unknown; missing?: string }
): Promise<{ id: string; partnerToken: string | null }> {
  if (!isKinkMode(mode)) throw new Error('Neznámý typ testu');
  const scored = scoreAnswers(mode, answers ?? {});
  if (!scored) throw new Error('Test není kompletní. Zkuste to prosím znovu.');

  const inviter = extra?.inviteToken ? await getKinkProfileByInvite(extra.inviteToken) : null;
  const context = cleanContext(extra?.context);
  const missing = typeof extra?.missing === 'string' ? extra.missing.trim().slice(0, MISSING_MAX) || null : null;

  const [row] = await getSql()`
    insert into kink_profiles (partner_of, mode, answers, cups, context, missing)
    values (
      ${inviter?.id ?? null}, ${mode},
      ${JSON.stringify(scored.clean)}::jsonb, ${JSON.stringify(scored.cups)}::jsonb,
      ${JSON.stringify(context)}::jsonb, ${missing}
    )
    returning id`;

  return { id: row.id, partnerToken: inviter?.inviteToken ?? null };
}

// Erases a Kinkometr result for good — answers, cups, free text and any paid
// report. Whoever holds the private id is its owner. Profiles filled in from
// this one's invite keep their own result and simply lose the link.
export async function deleteKinkProfile(id: string, locale: string): Promise<never> {
  if (isUuid(id)) await getSql()`delete from kink_profiles where id = ${id}`;
  redirect(localePath(isLocale(locale) ? locale : DEFAULT_LOCALE, '/kinkometr'));
}
