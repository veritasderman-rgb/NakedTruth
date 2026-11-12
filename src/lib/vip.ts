import { randomInt } from 'crypto';
import { cookies } from 'next/headers';
import { getSql, isDbConfigured } from '@/lib/db';

// VIP codes: handed out by the owner, they unlock paid content for free. A
// code opened as a link (/vip/<code>) is remembered in this cookie so the
// paywalls can offer it with one click.
export const VIP_COOKIE = 'nt_vip';
export const VIP_COOKIE_DAYS = 30;

// No 0/O/1/I, so a code survives being read aloud or retyped.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newVipCode(): string {
  const part = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  return `VIP-${part()}-${part()}-${part()}`;
}

// Upper-cased and trimmed; null when it cannot be a code at all.
export function normalizeVipCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9-]{6,40}$/.test(code) ? code : null;
}

const usable = 'expires_at is null or expires_at > now()';

// Still has uses left and has not expired.
export async function isVipUsable(raw: unknown): Promise<boolean> {
  const code = normalizeVipCode(raw);
  if (!code || !isDbConfigured()) return false;
  const rows = await getSql()`
    select 1 from vip_codes
    where code = ${code} and (max_uses is null or uses < max_uses) and (expires_at is null or expires_at > now())`;
  return rows.length > 0;
}

// Takes one use. False when the code is unknown, used up or expired.
export async function consumeVip(raw: unknown): Promise<boolean> {
  const code = normalizeVipCode(raw);
  if (!code) return false;
  const rows = await getSql()`
    update vip_codes set uses = uses + 1
    where code = ${code} and (max_uses is null or uses < max_uses) and (expires_at is null or expires_at > now())
    returning code`;
  return rows.length > 0;
}

// Gives a use back when the unlock it was taken for did not happen.
export async function refundVip(raw: unknown): Promise<void> {
  const code = normalizeVipCode(raw);
  if (code) await getSql()`update vip_codes set uses = greatest(uses - 1, 0) where code = ${code}`;
}

// The code remembered in this browser, if it is still usable.
export async function rememberedVip(): Promise<string | null> {
  const code = normalizeVipCode((await cookies()).get(VIP_COOKIE)?.value);
  try {
    return code && (await isVipUsable(code)) ? code : null;
  } catch {
    return null;
  }
}
