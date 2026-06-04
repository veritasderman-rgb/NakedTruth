// Shared scoring logic for comparing two partners' answers in a session.
// Kept framework-agnostic and pure so it can be reused by the comparison UI,
// the share page and the OG image route.

export type AnswerRow = {
  question_id: number;
  user_id: string;
  answer_yes_no: boolean | null;
  answer_frequency: number | null;
  answer_text: string | null;
};

export type QuestionRow = {
  id: number;
  kind: 'yes_no' | 'frequency_1_5' | 'short_answer';
  tier: 'tier_1' | 'tier_2';
  theme: string | null;
  prompt: string;
};

export type CategoryScore = {
  key: string;
  label: string;
  matchCount: number;
  total: number;
  percent: number;
};

export type ScoreResult = {
  matchCount: number;
  total: number;
  percent: number;
  categories: CategoryScore[];
};

// Normalize a stored answer to a comparable string, or null when unanswered.
export function answerValue(a: AnswerRow | undefined, kind: string): string | null {
  if (!a) return null;
  if (kind === 'yes_no') return a.answer_yes_no?.toString() ?? null;
  if (kind === 'frequency_1_5') return a.answer_frequency?.toString() ?? null;
  return a.answer_text ?? null;
}

// Two answers count as a match only for comparable kinds (not free text),
// when both are present and equal.
export function isMatch(valA: string | null, valB: string | null, kind: string): boolean {
  if (kind === 'short_answer') return false;
  return valA !== null && valB !== null && valA === valB;
}

// Human-readable category for a question. tier_1 is a single relationship
// bucket; tier_2 is split by theme.
export function categoryFor(q: QuestionRow): { key: string; label: string } {
  if (q.tier === 'tier_1') return { key: 'vanilla', label: 'Vztahy & soužití' };
  switch (q.theme) {
    case 'explicit':
      return { key: 'explicit', label: 'Bez obalu' };
    case 'fantasy':
      return { key: 'fantasy', label: 'Fantazie' };
    case 'bdsm':
      return { key: 'bdsm', label: 'Dominance & submise' };
    case 'compat':
      return { key: 'compat', label: 'Sladění' };
    default:
      return { key: 'intimacy', label: 'Pod peřinou' };
  }
}

function pct(matchCount: number, total: number): number {
  return total > 0 ? Math.round((matchCount / total) * 100) : 0;
}

// Compute the overall match score plus a per-category breakdown. Only
// comparable (non free-text), fully-answered questions count toward totals.
export function computeScore(
  questions: QuestionRow[],
  answers: AnswerRow[],
  partnerAId: string,
  partnerBId: string
): ScoreResult {
  const byCategory = new Map<string, CategoryScore>();
  let matchCount = 0;
  let total = 0;

  for (const q of questions) {
    if (q.kind === 'short_answer') continue;

    const ansA = answers.find((a) => a.question_id === q.id && a.user_id === partnerAId);
    const ansB = answers.find((a) => a.question_id === q.id && a.user_id === partnerBId);
    const valA = answerValue(ansA, q.kind);
    const valB = answerValue(ansB, q.kind);

    // Skip questions a partner left unanswered — they aren't comparable.
    if (valA === null || valB === null) continue;

    const matched = isMatch(valA, valB, q.kind);
    const cat = categoryFor(q);

    const entry =
      byCategory.get(cat.key) ?? { key: cat.key, label: cat.label, matchCount: 0, total: 0, percent: 0 };
    entry.total += 1;
    if (matched) entry.matchCount += 1;
    byCategory.set(cat.key, entry);

    total += 1;
    if (matched) matchCount += 1;
  }

  const categories = Array.from(byCategory.values())
    .map((c) => ({ ...c, percent: pct(c.matchCount, c.total) }))
    .sort((a, b) => b.total - a.total);

  return { matchCount, total, percent: pct(matchCount, total), categories };
}

// Shared copy for the headline label so the UI, share page and OG image agree.
export function matchLabel(percent: number): { text: string; color: string } {
  if (percent >= 80) return { text: 'Jste na stejné vlně', color: '#16a34a' };
  if (percent >= 60) return { text: 'Solidní základ, je na čem stavět', color: '#059669' };
  if (percent >= 40) return { text: 'Máte o čem mluvit', color: '#d97706' };
  return { text: 'Překvapení čeká — na to se podívejte', color: '#ea580c' };
}
