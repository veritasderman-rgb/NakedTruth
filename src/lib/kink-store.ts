import { getSql, isUuid } from '@/lib/db';
import { cleanContext, isKinkMode, type CupResults, type KinkContext, type KinkMode } from '@/lib/kink';

export type KinkProfile = {
  // Private: the owner's link. Never put this into a URL meant for someone else.
  id: string;
  // Shareable: lets a partner take the test and see the mutual comparison.
  inviteToken: string;
  partnerOf: string | null;
  mode: KinkMode;
  cups: CupResults;
  context: KinkContext;
  missing: string | null;
  // The paid detailed report has been unlocked for this result.
  reportUnlocked: boolean;
};

function toProfile(row: Record<string, any>): KinkProfile {
  return {
    id: row.id,
    inviteToken: row.invite_token,
    partnerOf: row.partner_of,
    mode: isKinkMode(row.mode) ? row.mode : 'full',
    cups: row.cups as CupResults,
    context: cleanContext(row.context),
    missing: row.missing ?? null,
    reportUnlocked: !!row.report_unlocked_at,
  };
}

export async function getKinkProfile(id: string): Promise<KinkProfile | null> {
  if (!isUuid(id)) return null;
  const [row] = await getSql()`select * from kink_profiles where id = ${id}`;
  return row ? toProfile(row) : null;
}

export async function getKinkProfileByInvite(token: string): Promise<KinkProfile | null> {
  if (!isUuid(token)) return null;
  const [row] = await getSql()`select * from kink_profiles where invite_token = ${token}`;
  return row ? toProfile(row) : null;
}

// Profiles filled in from this profile's invite link, newest first.
export async function getInvitedProfiles(id: string): Promise<KinkProfile[]> {
  const rows = await getSql()`
    select * from kink_profiles where partner_of = ${id} order by created_at desc limit 10`;
  return rows.map(toProfile);
}

// Marks the detailed report as paid for the profile behind this invite token.
// Idempotent: the first payment wins, later calls change nothing.
export async function unlockReport(inviteToken: string, payment: string | null): Promise<void> {
  if (!isUuid(inviteToken)) return;
  await getSql()`
    update kink_profiles
    set report_unlocked_at = coalesce(report_unlocked_at, now()),
        report_payment = coalesce(report_payment, ${payment})
    where invite_token = ${inviteToken}`;
}
