// Locales. Czech is the default and lives at the root (/kinkometr); the others
// are served under a prefix (/en/kinkometr). Language-neutral helpers only —
// safe to import from client components.

export const LOCALES = ['cs', 'en', 'de', 'fr', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'cs';

export const LOCALE_NAMES: Record<Locale, string> = {
  cs: 'Čeština',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

// App-relative path for a locale: ('en', '/kinkometr') -> '/en/kinkometr'.
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

// Fill {placeholders} in a translated string.
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}

// Pick a plural form. Czech has three forms (1 / 2-4 / other); French treats 0
// and 1 as singular; the rest use 1 / other.
export function plural(locale: Locale, n: number, forms: string[]): string {
  let form: string;
  if (locale === 'cs') form = n === 1 ? forms[0] : n >= 2 && n <= 4 ? forms[1] : forms[2] ?? forms[1];
  else if (locale === 'fr') form = n <= 1 ? forms[0] : forms[1];
  else form = n === 1 ? forms[0] : forms[1];
  return fmt(form ?? forms[forms.length - 1], { n });
}
