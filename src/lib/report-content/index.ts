import type { Locale } from '@/lib/i18n';
import { cs, type ReportContent } from './cs';
import { en } from './en';
import { de } from './de';
import { fr } from './fr';
import { es } from './es';

const CONTENT: Record<Locale, ReportContent> = { cs, en, de, fr, es };

export function getReport(locale: Locale): ReportContent {
  return CONTENT[locale] ?? cs;
}

export type { ReportContent } from './cs';
