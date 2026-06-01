import { createBrowserClient } from '@supabase/ssr';

// Browser Supabase client (used for magic-link sign-in). Uses the PKCE flow
// with cookie-stored verifier so the server callback can complete the exchange.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
