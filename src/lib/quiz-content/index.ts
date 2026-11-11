import type { Locale } from '@/lib/i18n';
import { cs, type QuizContent } from './cs';

// Translations are added per locale; a locale without one falls back to Czech.
const CONTENT: Partial<Record<Locale, QuizContent>> = { cs };

export function getQuiz(locale: Locale): QuizContent {
  return CONTENT[locale] ?? cs;
}

export type { QuizContent } from './cs';
