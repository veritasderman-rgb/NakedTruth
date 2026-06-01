import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { linkProfile } from '@/lib/auth';

// Completes the magic-link PKCE flow: exchanges the code for a session (using
// the cookie-stored verifier), links the profile, then redirects onward.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          await linkProfile(user.id, user.email ?? null);
        } catch (e) {
          console.error('linkProfile failed:', e);
        }
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
    console.error('exchangeCodeForSession failed:', error);
  }

  return NextResponse.redirect(new URL('/', url.origin));
}
