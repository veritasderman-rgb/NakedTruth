import type { Locale } from '@/lib/i18n';
import { cs, type ExtraContent } from './cs';
import { en } from './en';
import { de } from './de';
import { fr } from './fr';
import { es } from './es';

const CONTENT: Record<Locale, ExtraContent> = { cs, en, de, fr, es };

export function getExtra(locale: Locale): ExtraContent {
  return CONTENT[locale] ?? cs;
}

export type { ExtraContent, Landing, LandingKey } from './cs';
