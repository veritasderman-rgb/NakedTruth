import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Messages for non-default locales fall back to Czech until their
  // translation files are populated, so partially-translated UIs still work.
  const fallback = (await import('../../messages/cs.json')).default;
  const messages =
    locale === routing.defaultLocale
      ? fallback
      : { ...fallback, ...(await import(`../../messages/${locale}.json`)).default };

  return { locale, messages };
});
