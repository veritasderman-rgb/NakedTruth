import type { Locale } from '@/lib/i18n';
import { cs, type ReportContent } from './cs';
import { en } from './en';
import { de } from './de';

// Translations are added per locale; a locale without one falls back to Czech.
const CONTENT: Partial<Record<Locale, ReportContent>> = { cs, en, de };

export function getReport(locale: Locale): ReportContent {
  return CONTENT[locale] ?? cs;
}

export type { ReportContent } from './cs';
