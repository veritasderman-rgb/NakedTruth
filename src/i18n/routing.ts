import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales. `en` (and others) ship with the infrastructure but are
  // content-filled later — they fall back to `cs` until translations exist.
  locales: ['cs', 'en'],
  defaultLocale: 'cs',
  // Keep the default locale prefixed too, so every URL is explicit and
  // future locales need no routing changes.
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
