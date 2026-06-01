import 'server-only';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type Profile = {
  id: string;
  email: string | null;
  authUserId: string;
};

// Ensures a public.users profile row exists for an authenticated user and is
// linked via auth_user_id. Links an existing email-based profile if present
// (no destructive migration), otherwise creates one. Idempotent.
export async function linkProfile(authUserId: string, email: string | null): Promise<string> {
  const admin = getSupabaseAdmin();
  const normalizedEmail = email?.toLowerCase().trim() || null;

  // Already linked?
  const { data: linked } = await admin
    .from('users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .maybeSingle();
  if (linked) return linked.id;

  // Link an existing profile by email.
  if (normalizedEmail) {
    const { data: byEmail } = await admin
      .from('users')
      .select('id, auth_user_id')
      .eq('email', normalizedEmail)
      .maybeSingle();
    if (byEmail) {
      if (!byEmail.auth_user_id) {
        await admin.from('users').update({ auth_user_id: authUserId, is_anonymous: false }).eq('id', byEmail.id);
      }
      return byEmail.id;
    }
  }

  // Create a fresh profile.
  const { data: created, error } = await admin
    .from('users')
    .insert({ email: normalizedEmail, auth_user_id: authUserId, is_anonymous: false })
    .select('id')
    .single();
  if (error) throw error;
  return created.id;
}

// Returns the signed-in profile, linking it on first access. Null when anonymous.
export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profileId = await linkProfile(user.id, user.email ?? null);
  return { id: profileId, email: user.email ?? null, authUserId: user.id };
}

// Account-level entitlement check (server-side source of truth).
export async function hasEntitlement(profileId: string, productCode: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { data } = await admin.rpc('has_entitlement', {
    p_user_id: profileId,
    p_product_code: productCode,
  });
  return data === true;
}
