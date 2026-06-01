'use server';

import { getSupabaseAdmin } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const locale = await getLocale();
  redirect({ href: '/', locale });
}

// GDPR right to erasure: removes the auth identity and the profile row. The DB
// cascades delete answers / couple memberships / entitlements via FK rules.
export async function deleteMyData() {
  const profile = await getCurrentUser();
  if (!profile) return { success: false };

  const admin = getSupabaseAdmin();

  // Delete profile (cascades to dependent rows).
  await admin.from('users').delete().eq('id', profile.id);

  // Delete the auth identity (best-effort; requires service role).
  try {
    await admin.auth.admin.deleteUser(profile.authUserId);
  } catch (e) {
    console.error('auth admin deleteUser failed:', e);
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const locale = await getLocale();
  redirect({ href: '/', locale });
}
