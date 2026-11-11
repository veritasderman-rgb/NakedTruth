// Kinkometr — solo test. Every area of interest is a "cup" (pohár) that fills
// up according to the answers. This file is language-neutral: structure and
// scoring only. All wording lives in src/lib/kink-content/<locale>.ts.
//
// Two rounds: a short, mild first round over every cup, then an optional
// "deeper" round — sharper statements plus give / receive direction — only for
// the cups the person chose to explore further.

export type GroupKey = 'power' | 'body' | 'fantasy' | 'people' | 'tender';

export const GROUP_KEYS: GroupKey[] = ['power', 'body', 'fantasy', 'people', 'tender'];

export type CupKey =
  | 'dominance' | 'submission' | 'bondage' | 'impact' | 'control' | 'praise' | 'primal'
  | 'sensation' | 'anal' | 'oral' | 'toys' | 'edge'
  | 'roleplay' | 'verbal' | 'materials' | 'feet' | 'gender'
  | 'watch' | 'group' | 'sharing' | 'adventure'
  | 'romance' | 'tantra';

export type Cup = {
  key: CupKey;
  group: GroupKey;
  color: string;
  // Part of the BDSM-only test.
  bdsm: boolean;
  // Cups where it matters which side you are on. The first two deeper
  // statements then measure "give" and "receive".
  dir: boolean;
};

const cup = (key: CupKey, group: GroupKey, color: string, bdsm = false, dir = false): Cup => ({ key, group, color, bdsm, dir });

export const CUPS: Cup[] = [
  cup('dominance', 'power', '#ff3d6e', true),
  cup('submission', 'power', '#b05cff', true),
  cup('bondage', 'power', '#ff7a1a', true, true),
  cup('impact', 'power', '#ff2ea6', true, true),
  cup('control', 'power', '#ff9e3d', true, true),
  cup('praise', 'power', '#e04bff', true, true),
  cup('primal', 'power', '#ff5c3d', true),
  cup('sensation', 'body', '#00d5ff', true, true),
  cup('edge', 'body', '#7dd3ff', true),
  cup('anal', 'body', '#5aa0ff', false, true),
  cup('oral', 'body', '#35c9f0', false, true),
  cup('toys', 'body', '#35f0a0'),
  cup('roleplay', 'fantasy', '#ffd400'),
  cup('verbal', 'fantasy', '#c8ff2e'),
  cup('materials', 'fantasy', '#ffb02e'),
  cup('feet', 'fantasy', '#f5e050'),
  cup('gender', 'fantasy', '#a8f02e'),
  cup('watch', 'people', '#3d8bff', false, true),
  cup('group', 'people', '#ff5c5c'),
  cup('sharing', 'people', '#ff8a8a', false, true),
  cup('adventure', 'people', '#2effd5'),
  cup('romance', 'tender', '#ff9ecb'),
  cup('tantra', 'tender', '#ffc4a3'),
];

export const CUP_BY_KEY: Record<CupKey, Cup> = Object.fromEntries(CUPS.map((c) => [c.key, c])) as Record<CupKey, Cup>;

export type KinkMode = 'full' | 'quick' | 'bdsm';
export const MODE_KEYS: KinkMode[] = ['full', 'quick', 'bdsm'];
export const MODE_MINUTES: Record<KinkMode, number> = { full: 5, quick: 2, bdsm: 2 };

export function isKinkMode(value: unknown): value is KinkMode {
  return value === 'full' || value === 'quick' || value === 'bdsm';
}

// A question is addressed by cup + round + index; its text comes from the
// locale content (cups[cup].base[index] or cups[cup].deep[index]).
export type KinkQuestion = { id: string; cup: CupKey; round: 'base' | 'deep'; index: number };

export function cupsFor(mode: KinkMode): Cup[] {
  return CUPS.filter((c) => (mode === 'bdsm' ? c.bdsm : true));
}

// Round one, interleaved across cups so one topic never comes twice in a row.
export function questionsFor(mode: KinkMode): KinkQuestion[] {
  const cups = cupsFor(mode);
  const perCup = mode === 'quick' ? 1 : 2;
  const out: KinkQuestion[] = [];
  for (let i = 0; i < perCup; i++) {
    for (const c of cups) out.push({ id: `${c.key}_b${i + 1}`, cup: c.key, round: 'base', index: i });
  }
  return out;
}

// Round two: the three deeper statements of each chosen cup, cup by cup.
export function deepQuestionsFor(cupKeys: CupKey[]): KinkQuestion[] {
  return cupKeys.flatMap((key) =>
    [0, 1, 2].map((i) => ({ id: `${key}_d${i + 1}`, cup: key, round: 'deep' as const, index: i }))
  );
}

// Answer scale, shown top to bottom. Value 2 is the explicit "I don't know" —
// it half-fills the cup and is counted separately so the result can say
// "unexplored" instead of pretending to know.
export const ANSWER_VALUES = [4, 3, 2, 1, 0] as const;
export const UNSURE_VALUE = 2;

export type CupResult = {
  // Round one: 0-100 interest, how many "I don't know", how many answers.
  fill: number;
  unsure: number;
  count: number;
  // Round two (only when the person went deeper): 0-100 depth and, for
  // directional cups, the raw 0-4 answers for each side.
  depth?: number;
  give?: number;
  receive?: number;
};
export type CupResults = Partial<Record<CupKey, CupResult>>;

function isAnswer(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 4;
}

// Validates raw answers and computes each cup. Round one must be complete for
// the mode; round two is optional but all-or-nothing per cup. Returns null when
// something is missing or out of range.
export function scoreAnswers(mode: KinkMode, answers: Record<string, unknown>): { cups: CupResults; clean: Record<string, number> } | null {
  const cups: CupResults = {};
  const clean: Record<string, number> = {};

  for (const q of questionsFor(mode)) {
    const v = answers[q.id];
    if (!isAnswer(v)) return null;
    clean[q.id] = v;
    const c = cups[q.cup] ?? { fill: 0, unsure: 0, count: 0 };
    c.fill += v;
    c.count += 1;
    if (v === UNSURE_VALUE) c.unsure += 1;
    cups[q.cup] = c;
  }

  for (const key of Object.keys(cups) as CupKey[]) {
    const c = cups[key]!;
    c.fill = Math.round((c.fill / (c.count * 4)) * 100);

    const deep = deepQuestionsFor([key]).map((q) => ({ q, v: answers[q.id] }));
    if (deep.every((d) => d.v === undefined)) continue;
    if (!deep.every((d) => isAnswer(d.v))) return null;
    const values = deep.map((d) => d.v as number);
    deep.forEach((d) => { clean[d.q.id] = d.v as number; });
    if (CUP_BY_KEY[key].dir) {
      // Being into only one side is not "less deep": the stronger side counts.
      c.give = values[0];
      c.receive = values[1];
      c.depth = Math.round(((Math.max(values[0], values[1]) + values[2]) / 8) * 100);
    } else {
      c.depth = Math.round((values.reduce((a, b) => a + b, 0) / (values.length * 4)) * 100);
    }
  }
  return { cups, clean };
}

// A cup is "unexplored" when at least half of its answers were "I don't know".
export function isUnexplored(c: CupResult): boolean {
  return c.unsure * 2 >= c.count;
}

export const FULL_THRESHOLD = 65;

export type FillLevel = 'unexplored' | 'overflow' | 'full' | 'half' | 'low' | 'empty';

export function fillLevel(c: CupResult): FillLevel {
  if (isUnexplored(c)) return 'unexplored';
  if (c.fill >= 85) return 'overflow';
  if (c.fill >= FULL_THRESHOLD) return 'full';
  if (c.fill >= 40) return 'half';
  if (c.fill >= 15) return 'low';
  return 'empty';
}

// 0 = barely, 3 = all the way. Index into the locale's `depth` labels.
export function depthLevel(depth: number): 0 | 1 | 2 | 3 {
  if (depth >= 75) return 3;
  if (depth >= 45) return 2;
  if (depth >= 20) return 1;
  return 0;
}

export type Side = 'give' | 'receive' | 'both' | null;

// Which side of a directional cup the person leans to ("tempts me" or more).
export function sideOf(c: CupResult): Side {
  if (c.give === undefined || c.receive === undefined) return null;
  const g = c.give >= 3;
  const r = c.receive >= 3;
  if (g && r) return 'both';
  if (g) return 'give';
  if (r) return 'receive';
  return null;
}

// Cups present in a result, fullest first.
export function rankedCups(cups: CupResults): { cup: Cup; result: CupResult }[] {
  return CUPS.filter((c) => cups[c.key])
    .map((c) => ({ cup: c, result: cups[c.key]! }))
    .sort((a, b) => b.result.fill - a.result.fill);
}

// Cups worth offering for round two: clear interest in round one.
export function deepCandidates(cups: CupResults): CupKey[] {
  return rankedCups(cups)
    .filter((r) => r.result.fill >= 50 && !isUnexplored(r.result))
    .map((r) => r.cup.key);
}

export type GroupSummary = { key: GroupKey; avg: number; full: number; cups: { cup: Cup; result: CupResult }[] };

// Cups by group, in the fixed group order, with the group's average fill.
export function groupSummaries(cups: CupResults): GroupSummary[] {
  return GROUP_KEYS.map((key) => {
    const list = CUPS.filter((c) => c.group === key && cups[c.key]).map((c) => ({ cup: c, result: cups[c.key]! }));
    const avg = list.length > 0 ? Math.round(list.reduce((s, r) => s + r.result.fill, 0) / list.length) : 0;
    const full = list.filter((r) => r.result.fill >= FULL_THRESHOLD && !isUnexplored(r.result)).length;
    return { key, avg, full, cups: list };
  }).filter((g) => g.cups.length > 0);
}

// ---------------------------------------------------------------------------
// Context (asked once at the start, never scored)
// ---------------------------------------------------------------------------

export type KinkContext = { single?: boolean; lowDesire?: boolean };

export function cleanContext(raw: unknown): KinkContext {
  const r = (raw ?? {}) as Record<string, unknown>;
  return { single: r.single === true, lowDesire: r.lowDesire === true };
}

export const MISSING_MAX = 300;

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

// "If you like A, try B." — neighbouring cups worth peeking into.
export const RELATED: Record<CupKey, CupKey[]> = {
  dominance: ['control', 'bondage', 'praise'],
  submission: ['control', 'bondage', 'praise'],
  bondage: ['sensation', 'control', 'edge'],
  impact: ['edge', 'primal', 'praise'],
  control: ['sensation', 'toys', 'dominance'],
  praise: ['verbal', 'submission', 'dominance'],
  primal: ['impact', 'adventure', 'bondage'],
  sensation: ['edge', 'tantra', 'bondage'],
  edge: ['sensation', 'impact', 'roleplay'],
  anal: ['toys', 'oral', 'control'],
  oral: ['sensation', 'anal', 'feet'],
  toys: ['control', 'anal', 'watch'],
  roleplay: ['verbal', 'materials', 'gender'],
  verbal: ['praise', 'roleplay', 'watch'],
  materials: ['roleplay', 'feet', 'watch'],
  feet: ['materials', 'oral', 'submission'],
  gender: ['roleplay', 'materials', 'anal'],
  watch: ['sharing', 'group', 'adventure'],
  group: ['sharing', 'watch', 'roleplay'],
  sharing: ['watch', 'group', 'verbal'],
  adventure: ['watch', 'primal', 'roleplay'],
  romance: ['tantra', 'sensation', 'oral'],
  tantra: ['romance', 'sensation', 'control'],
};

type Ranked = { cup: Cup; result: CupResult };

export type Recommendations = {
  top: Ranked[];
  explore: Ranked[];
  related: { from: Cup; to: Cup }[];
  // Keys of the fullest cups, for matching dating tips.
  topKeys: CupKey[];
};

export function recommend(cups: CupResults): Recommendations {
  const ranked = rankedCups(cups);
  const explored = ranked.filter((r) => !isUnexplored(r.result));

  // Fullest cups that are at least half full (max 5). When none is, fall back
  // to the single fullest one — but only if it shows some interest; a clear
  // "no" to everything gets no recommendation at all.
  let top = explored.filter((r) => r.result.fill >= 50).slice(0, 5);
  if (top.length === 0 && explored.length > 0 && explored[0].result.fill >= 25) top = explored.slice(0, 1);

  const explore = ranked.filter((r) => isUnexplored(r.result)).slice(0, 5);

  // Neighbouring cups the person has not filled yet.
  const topKeys = new Set(top.map((t) => t.cup.key));
  const seen = new Set<CupKey>();
  const related: { from: Cup; to: Cup }[] = [];
  for (const t of top) {
    for (const key of RELATED[t.cup.key]) {
      const r = cups[key];
      if (!r || topKeys.has(key) || seen.has(key)) continue;
      if (r.fill < 25 && !isUnexplored(r)) continue; // a clear "no" stays a no
      seen.add(key);
      related.push({ from: t.cup, to: CUP_BY_KEY[key] });
      break;
    }
  }

  return { top, explore, related, topKeys: [...topKeys] };
}

// Dating tips whose cups overlap the person's fullest cups, best match first.
export function matchDating<T extends { cups: CupKey[] }>(tips: T[], topKeys: CupKey[]): T[] {
  const top = new Set(topKeys);
  return tips
    .map((d) => ({ d, hits: d.cups.filter((k) => top.has(k)).length }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 4)
    .map((x) => x.d);
}

export function fullCupCount(cups: CupResults): { full: number; unexplored: number; total: number } {
  const list = rankedCups(cups);
  return {
    full: list.filter((r) => r.result.fill >= FULL_THRESHOLD && !isUnexplored(r.result)).length,
    unexplored: list.filter((r) => isUnexplored(r.result)).length,
    total: list.length,
  };
}

// --- Comparison of two profiles (a = the viewer, b = their partner) --------
//
// Privacy rule: a cup is shown only when BOTH people are at least a "maybe".
// If either one is a "no", the cup stays hidden — only the number of hidden
// cups is reported, never who said no — so nobody is exposed for wanting
// something the other does not.
//
// One deliberate exception, stated in the invite text: when one person wants
// to lead and the other wants to be led, the `dynamic` line says so even if
// each rejected the opposite role. Each wish revealed there is exactly what
// the other one asked for.

export type Stance = 'yes' | 'maybe' | 'no';

export function stanceOf(c: CupResult): Stance {
  if (isUnexplored(c)) return 'maybe';
  if (c.fill >= 60) return 'yes';
  if (c.fill >= 35) return 'maybe';
  return 'no';
}

// How two people fit on a directional cup. a* = the viewer.
export type FitCode = 'bothBoth' | 'aGives' | 'bGives' | 'flex' | 'sameGive' | 'sameReceive';
// Dominance / submission fit.
export type DynamicCode = 'switch' | 'aLeads' | 'bLeads' | 'bothLead' | 'bothSubmit';

export type CupComparison = {
  cup: Cup;
  a: CupResult;
  b: CupResult;
  // shared = both yes; invite = one yes, one maybe; explore = both maybe.
  kind: 'shared' | 'invite' | 'explore';
  fit: FitCode | null;
};

export type Comparison = {
  rows: CupComparison[];
  // Cups compared but not shown because at least one person is a "no".
  hidden: number;
  // 0-100: how close the two sets of cups are overall.
  harmony: number;
  dynamic: DynamicCode | null;
};

function directionFit(c: Cup, a: CupResult, b: CupResult): FitCode | null {
  if (!c.dir) return null;
  const [sa, sb] = [sideOf(a), sideOf(b)];
  if (!sa || !sb) return null;
  if (sa === 'both' && sb === 'both') return 'bothBoth';
  if (sa === 'give' && sb === 'receive') return 'aGives';
  if (sa === 'receive' && sb === 'give') return 'bGives';
  if (sa === 'both' || sb === 'both') return 'flex';
  return sa === 'give' ? 'sameGive' : 'sameReceive';
}

// 0 = far apart … 3 = very close. Index into the locale's `harmony` labels.
export function harmonyLevel(h: number): 0 | 1 | 2 | 3 {
  if (h >= 80) return 3;
  if (h >= 65) return 2;
  if (h >= 50) return 1;
  return 0;
}

export function compareProfiles(a: CupResults, b: CupResults): Comparison {
  const rows: CupComparison[] = [];
  let hidden = 0;
  let diffSum = 0;
  let compared = 0;

  for (const c of CUPS) {
    const ra = a[c.key];
    const rb = b[c.key];
    if (!ra || !rb) continue;
    compared += 1;
    diffSum += Math.abs(ra.fill - rb.fill);

    const [sa, sb] = [stanceOf(ra), stanceOf(rb)];
    if (sa === 'no' || sb === 'no') {
      hidden += 1;
      continue;
    }
    const kind = sa === 'yes' && sb === 'yes' ? 'shared' : sa === 'maybe' && sb === 'maybe' ? 'explore' : 'invite';
    rows.push({ cup: c, a: ra, b: rb, kind, fit: kind === 'shared' ? directionFit(c, ra, rb) : null });
  }

  const harmony = compared > 0 ? Math.round(100 - diffSum / compared) : 0;

  // Only positive fits are reported, and only from cups each person was sure of.
  let dynamic: DynamicCode | null = null;
  const yes = (r?: CupResult) => !!r && stanceOf(r) === 'yes';
  const [da, sa, db, sb] = [yes(a.dominance), yes(a.submission), yes(b.dominance), yes(b.submission)];
  if (da && sb && db && sa) dynamic = 'switch';
  else if (da && sb) dynamic = 'aLeads';
  else if (db && sa) dynamic = 'bLeads';
  else if (da && db) dynamic = 'bothLead';
  else if (sa && sb) dynamic = 'bothSubmit';

  return { rows, hidden, harmony, dynamic };
}
