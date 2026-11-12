import { NextResponse } from 'next/server';
import { DEFAULT_LOCALE, isLocale, localePath } from '@/lib/i18n';
import { VIP_COOKIE, VIP_COOKIE_DAYS, isVipUsable, normalizeVipCode } from '@/lib/vip';

export const dynamic = 'force-dynamic';

// A VIP link: remember a usable code in this browser and show what it does.
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = normalizeVipCode((await params).code);
  const header = req.headers.get('x-locale');
  const locale = isLocale(header) ? header : DEFAULT_LOCALE;
  const ok = await isVipUsable(code).catch(() => false);

  const url = new URL(req.url);
  url.pathname = localePath(locale, '/vip');
  url.search = ok ? '' : '?invalid=1';
  const res = NextResponse.redirect(url, 303);
  if (ok && code) {
    res.cookies.set(VIP_COOKIE, code, { path: '/', maxAge: 60 * 60 * 24 * VIP_COOKIE_DAYS, sameSite: 'lax', httpOnly: true, secure: url.protocol === 'https:' });
  }
  return res;
}
