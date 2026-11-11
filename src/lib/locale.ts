import { headers } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';

// The locale of the current request, as resolved by the middleware. Server only.
export async function getLocale(): Promise<Locale> {
  const value = (await headers()).get('x-locale');
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
