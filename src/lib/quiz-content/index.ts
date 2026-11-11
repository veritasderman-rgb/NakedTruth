import type { Locale } from '@/lib/i18n';
import { cs, type QuizContent } from './cs';
import { en } from './en';
import { de } from './de';
import { fr } from './fr';
import { es } from './es';

const CONTENT: Record<Locale, QuizContent> = { cs, en, de, fr, es };

export function getQuiz(locale: Locale): QuizContent {
  return CONTENT[locale] ?? cs;
}

export type { QuizContent } from './cs';
