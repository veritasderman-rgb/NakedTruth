import { getSql, isUuid } from '@/lib/db';
import { isKinkMode, type CupResults, type KinkMode } from '@/lib/kink';

export type KinkProfile = {
  id: string;
  partnerOf: string | null;
  mode: KinkMode;
  cups: CupResults;
};

function toProfile(row: Record<string, any>): KinkProfile {
  return {
    id: row.id,
    partnerOf: row.partner_of,
    mode: isKinkMode(row.mode) ? row.mode : 'full',
    cups: row.cups as CupResults,
  };
}

export async function getKinkProfile(id: string): Promise<KinkProfile | null> {
  if (!isUuid(id)) return null;
  const [row] = await getSql()`select id, partner_of, mode, cups from kink_profiles where id = ${id}`;
  return row ? toProfile(row) : null;
}

// Profiles filled in from this profile's invite link, newest first.
export async function getInvitedProfiles(id: string): Promise<KinkProfile[]> {
  const rows = await getSql()`
    select id, partner_of, mode, cups from kink_profiles
    where partner_of = ${id} order by created_at desc limit 10`;
  return rows.map(toProfile);
}
