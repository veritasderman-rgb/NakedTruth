import type { MetadataRoute } from 'next';
import { appUrl } from '@/lib/app-url';

// Private pages (results, comparisons, reports, quiz sessions) are reachable
// only through unguessable links and must never be crawled.
export default function robots(): MetadataRoute.Robots {
  const privatePaths = ['/kinkometr/vysledek/', '/kinkometr/porovnani/', '/kinkometr/rozbor/', '/kinkometr/parovy-rozbor/', '/session/', '/api/', '/stats'];
  const prefixes = ['', '/en', '/de', '/fr', '/es'];
  return {
    rules: { userAgent: '*', allow: '/', disallow: prefixes.flatMap((p) => privatePaths.map((path) => `${p}${path}`)) },
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
