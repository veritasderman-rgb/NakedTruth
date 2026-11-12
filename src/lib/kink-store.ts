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
  // An e-mail is stored with the result (the address itself stays server-side).
  hasEmail: boolean;
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
    hasEmail: !!row.email,
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
// Shared by the return page and the webhook, whichever sees the payment first.
// Idempotent: only the first call unlocks. Returns the profile's private id on
// that first call and null otherwise, so the sale is counted and confirmed once.
// The buyer's e-mail is kept with the result unless one is already there.
export async function unlockReport(inviteToken: string, payment: string | null, email: string | null): Promise<string | null> {
  if (!isUuid(inviteToken)) return null;
  const [row] = await getSql()`
    update kink_profiles
    set report_unlocked_at = now(), report_payment = ${payment}, email = coalesce(email, ${email})
    where invite_token = ${inviteToken} and report_unlocked_at is null
    returning id`;
  return row?.id ?? null;
}

// ---- Couple report: one payment unlocks it for both connected results ----

function ordered(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function isPairReportUnlocked(inviteA: string, inviteB: string): Promise<boolean> {
  if (!isUuid(inviteA) || !isUuid(inviteB)) return false;
  const [a, b] = ordered(inviteA.toLowerCase(), inviteB.toLowerCase());
  const rows = await getSql()`select 1 from kink_pair_reports where a_invite = ${a} and b_invite = ${b}`;
  return rows.length > 0;
}

// True only for the call that unlocked it.
export async function unlockPairReport(inviteA: string, inviteB: string, payment: string | null): Promise<boolean> {
  if (!isUuid(inviteA) || !isUuid(inviteB) || inviteA === inviteB) return false;
  const [a, b] = ordered(inviteA.toLowerCase(), inviteB.toLowerCase());
  const rows = await getSql()`
    insert into kink_pair_reports (a_invite, b_invite, payment) values (${a}, ${b}, ${payment})
    on conflict do nothing returning a_invite`;
  return rows.length > 0;
}

// The two profiles may be compared only when one was filled in from the
// other's invite.
export function areConnected(a: KinkProfile, b: KinkProfile): boolean {
  return a.partnerOf === b.id || b.partnerOf === a.id;
}
