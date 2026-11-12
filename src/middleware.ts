import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from '@/lib/i18n';

const COOKIE = 'nt_lang';
const PREFIXED = new RegExp(`^/(${LOCALES.filter((l) => l !== DEFAULT_LOCALE).join('|')})(/.*)?$`);
// Pages where a first-time visitor is sent to their browser language.
const LANDING = new Set(['/', '/kinkometr', '/bdsm-test', '/kink-test', '/dom-sub-test']);

function remember(res: NextResponse, locale: Locale) {
  res.cookies.set(COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  return res;
}

// First supported language in Accept-Language. Visitors whose languages we do
// not have get English; no header at all (crawlers) stays on the default.
function preferred(header: string | null): Locale | null {
  if (!header) return null;
  for (const part of header.split(',')) {
    const tag = part.split(';')[0].trim().toLowerCase().split('-')[0];
    if (isLocale(tag)) return tag;
  }
  return 'en';
}

// Czech lives at the root; other locales are served under /<locale>/… and
// rewritten to the same routes with an `x-locale` request header.
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const headers = new Headers(req.headers);

  const match = pathname.match(PREFIXED);
  if (match) {
    const locale = match[1] as Locale;
    headers.set('x-locale', locale);
    const url = req.nextUrl.clone();
    url.pathname = match[2] || '/';
    return remember(NextResponse.rewrite(url, { request: { headers } }), locale);
  }

  // Never trust a client-supplied x-locale.
  headers.set('x-locale', DEFAULT_LOCALE);

  // Explicit choice of Czech from the language switcher.
  if (searchParams.get('lang') === DEFAULT_LOCALE) {
    return remember(NextResponse.next({ request: { headers } }), DEFAULT_LOCALE);
  }

  if (LANDING.has(pathname) && !req.cookies.get(COOKIE)) {
    const locale = preferred(req.headers.get('accept-language'));
    if (locale && locale !== DEFAULT_LOCALE) {
      const url = req.nextUrl.clone();
      url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
      return remember(NextResponse.redirect(url), locale);
    }
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Pages only: skip API routes, Next internals and files with an extension.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
