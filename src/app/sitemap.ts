import type { MetadataRoute } from 'next';
import { appUrl } from '@/lib/app-url';
import { LOCALES, localePath } from '@/lib/i18n';

// Public landing pages in every language, cross-linked as alternates.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  return ['/', '/kinkometr'].flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${base}${localePath(locale, path)}`,
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : 0.8,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${base}${localePath(l, path)}`])) },
    }))
  );
}
