'use server';

import { revalidatePath } from 'next/cache';
import { countEvent } from '@/lib/events';
import { areConnected, getKinkProfile, getKinkProfileByInvite, isPairReportUnlocked, unlockPairReport, unlockReport } from '@/lib/kink-store';
import { consumeVip, normalizeVipCode, refundVip } from '@/lib/vip';

// Unlocks a detailed report — or, with `other` (the partner's invite token),
// the couple report — with a VIP code instead of a payment. A use is taken
// only for an unlock that actually happens.
export async function redeemVip(rawCode: string, id: string, other?: string): Promise<'ok' | 'invalid'> {
  const code = normalizeVipCode(rawCode);
  const profile = code ? await getKinkProfile(id).catch(() => null) : null;
  if (!code || !profile) return 'invalid';

  const partner = other ? await getKinkProfileByInvite(other).catch(() => null) : null;
  if (other && (!partner || !areConnected(profile, partner))) return 'invalid';

  const already = partner ? await isPairReportUnlocked(profile.inviteToken, partner.inviteToken) : profile.reportUnlocked;
  if (!already) {
    if (!(await consumeVip(code))) return 'invalid';
    const unlocked = partner
      ? await unlockPairReport(profile.inviteToken, partner.inviteToken, `vip:${code}`)
      : !!(await unlockReport(profile.inviteToken, `vip:${code}`, null));
    // Somebody else unlocked it in the meantime: the code was not needed.
    if (!unlocked) await refundVip(code);
    else await countEvent('vip_unlock', null);
  }
  revalidatePath('/', 'layout');
  return 'ok';
}
