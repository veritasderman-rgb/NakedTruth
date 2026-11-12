import { CUP_BY_KEY, type Cup, type CupKey } from '@/lib/kink';

// The public share link carries up to three cups as "key.fill,key.fill" and
// nothing else — no result id, no other answers.
export type SharedCup = { cup: Cup; fill: number };

export function encodeSharedCups(cups: { cup: Cup; result: { fill: number } }[]): string {
  return cups.slice(0, 3).map((c) => `${c.cup.key}.${c.result.fill}`).join(',');
}

export function parseSharedCups(raw: string | null | undefined): SharedCup[] {
  const seen = new Set<string>();
  const out: SharedCup[] = [];
  for (const part of (raw ?? '').split(',').slice(0, 3)) {
    const [key, fill] = part.split('.');
    const cup = CUP_BY_KEY[key as CupKey];
    const n = Number.parseInt(fill ?? '', 10);
    if (!cup || seen.has(key) || Number.isNaN(n)) continue;
    seen.add(key);
    out.push({ cup, fill: Math.max(0, Math.min(100, n)) });
  }
  return out;
}
