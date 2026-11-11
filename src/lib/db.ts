import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

// Neon serverless Postgres over HTTPS. Server-side only — DATABASE_URL must
// never be exposed to the browser (no NEXT_PUBLIC_ prefix).
let cached: NeonQueryFunction<false, false> | null = null;

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('Chybí konfigurace databáze (DATABASE_URL). Nastavte ji v prostředí Vercelu.');
  }
  if (!cached) cached = neon(url);
  return cached;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Guards uuid-typed lookups so a malformed id is "not found", not a SQL error.
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}
