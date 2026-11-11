import type { Locale } from '@/lib/i18n';
import { cs } from './cs';
import { en } from './en';
import type { LegalContent } from './types';

// Czech is the binding version; every other language reads the English
// translation.
const CONTENT: Partial<Record<Locale, LegalContent>> = { cs, en };

export function getLegal(locale: Locale): LegalContent {
  return CONTENT[locale] ?? en;
}

export const LEGAL_LINKS: Record<Locale, { terms: string; privacy: string }> = {
  cs: { terms: 'Obchodní podmínky', privacy: 'Soukromí' },
  en: { terms: 'Terms', privacy: 'Privacy' },
  de: { terms: 'AGB', privacy: 'Datenschutz' },
  fr: { terms: 'Conditions', privacy: 'Confidentialité' },
  es: { terms: 'Condiciones', privacy: 'Privacidad' },
};

export type { LegalContent, LegalDoc } from './types';
