import type { SupabaseClient } from '@supabase/supabase-js';
import { routing } from '@/i18n/routing';

export type LocalizedQuestion = {
  id: number;
  kind: 'yes_no' | 'frequency_1_5' | 'short_answer';
  tier: 'tier_1' | 'tier_2';
  prompt: string;
  scaleLow: string | null;
  scaleHigh: string | null;
};

type RawQuestion = {
  id: number;
  kind: LocalizedQuestion['kind'];
  tier: LocalizedQuestion['tier'];
  prompt: string;
};

// Resolves prompts + scale labels for the requested locale, falling back to the
// default locale (cs) whenever a translation is missing. Keeps all locale logic
// server-side; the UI just renders the resolved strings.
export async function localizeQuestions(
  supabase: SupabaseClient,
  questions: RawQuestion[],
  locale: string
): Promise<LocalizedQuestion[]> {
  if (questions.length === 0) return [];
  const ids = questions.map((q) => q.id);
  const fallback = routing.defaultLocale;

  const { data: translations } = await supabase
    .from('question_translations')
    .select('question_id, locale, prompt, scale_low, scale_high')
    .in('question_id', ids)
    .in('locale', Array.from(new Set([locale, fallback])));

  const byId = new Map<number, Record<string, any>>();
  for (const tr of translations ?? []) {
    const existing = byId.get(tr.question_id) ?? {};
    existing[tr.locale] = tr;
    byId.set(tr.question_id, existing);
  }

  return questions.map((q) => {
    const tr = byId.get(q.id);
    const chosen = tr?.[locale] ?? tr?.[fallback];
    return {
      id: q.id,
      kind: q.kind,
      tier: q.tier,
      // Fall back to the legacy `questions.prompt` if no translation row exists yet.
      prompt: chosen?.prompt ?? q.prompt,
      scaleLow: chosen?.scale_low ?? null,
      scaleHigh: chosen?.scale_high ?? null,
    };
  });
}
