// Public origin of the app, without a trailing slash. NEXT_PUBLIC_APP_URL wins;
// on Vercel the production domain is used when it is not set.
export function appUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit && explicit !== 'undefined') return explicit.replace(/\/$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return 'http://localhost:3000';
}

export function isAppUrlKnown(): boolean {
  return appUrl() !== 'http://localhost:3000';
}
