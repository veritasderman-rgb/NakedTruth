import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Locale negotiation (Accept-Language + cookie) and redirect to a prefixed URL.
// Auth-session refresh will be layered in here in package B.
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
