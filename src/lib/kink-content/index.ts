import type { Locale } from '@/lib/i18n';
import type { KinkContent } from './types';
import { cs } from './cs';
import { en } from './en';
import { de } from './de';
import { fr } from './fr';
import { es } from './es';

const CONTENT: Record<Locale, KinkContent> = { cs, en, de, fr, es };

export function getContent(locale: Locale): KinkContent {
  return CONTENT[locale] ?? cs;
}

export type { KinkContent, CupText, CupTips } from './types';
