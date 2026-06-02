'use server';

import { getSupabaseAdmin } from '@/lib/supabase';
import { sendInviteEmail } from '@/lib/mail';
import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { headers } from 'next/headers';
import { PAYWALL_ERROR } from '@/lib/constants';
import { getCurrentUser } from '@/lib/auth';

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  const host = (await headers()).get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function startSession(email?: string, questionCount: number = 10, tierPref: string = 'vanilla') {
  const supabase = getSupabaseAdmin();
  const locale = await getLocale();
  const normalizedEmail = email?.toLowerCase().trim();

  let activeUser;

  // Prefer the signed-in account so entitlements (tier_2) resolve correctly.
  const current = await getCurrentUser();
  if (current) {
    activeUser = { id: current.id };
  } else if (normalizedEmail) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw new Error('Chyba databáze');
    }

    activeUser = user;

    if (!activeUser) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ email: normalizedEmail })
        .select('id')
        .single();

      if (createError) throw createError;
      activeUser = newUser;
    }
  } else {
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({ is_anonymous: true })
      .select('id')
      .single();

    if (createError) throw createError;
    activeUser = newUser;
  }

  const { data: member } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', activeUser!.id)
    .single();

  let coupleId = member?.couple_id;

  if (!coupleId) {
    const { data: newCouple, error: coupleError } = await supabase
      .from('couples')
      .insert({ created_by_user_id: activeUser!.id })
      .select('id')
      .single();

    if (coupleError) throw coupleError;
    coupleId = newCouple.id;

    await supabase.from('couple_members').insert({
      couple_id: coupleId,
      user_id: activeUser!.id,
      role: 'partner_a'
    });
  }

  const sessionId = await createSessionOrPaywall(coupleId, activeUser!.id, activeUser!.id, questionCount, tierPref);

  const { data: session } = await supabase
    .from('sessions')
    .select('partner_a_access_token')
    .eq('id', sessionId)
    .single();

  if (!session) throw new Error('Session creation failed');

  redirect({ href: `/session/${sessionId}?token=${session.partner_a_access_token}`, locale });
}

// Calls the RPC and translates its PAYWALL signal into a typed error the
// client can catch and turn into a Stripe Checkout redirect.
async function createSessionOrPaywall(
  coupleId: string,
  createdBy: string,
  partnerA: string,
  questionCount: number,
  tierPref: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data: sessionId, error: rpcError } = await supabase.rpc('create_next_session', {
    p_couple_id: coupleId,
    p_created_by_user_id: createdBy,
    p_partner_a_user_id: partnerA,
    p_question_count: questionCount,
    p_tier_pref: tierPref,
    p_user_id: partnerA,
  });

  if (rpcError) {
    if (rpcError.message?.includes('PAYWALL')) {
      throw new Error(PAYWALL_ERROR);
    }
    throw rpcError;
  }
  return sessionId as string;
}

export async function joinSession(sessionId: string) {
  const supabase = getSupabaseAdmin();

  const { data: newUserB, error: createError } = await supabase
    .from('users')
    .insert({ is_anonymous: true })
    .select('id')
    .single();

  if (createError) throw createError;

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('couple_id')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) throw new Error('Relace nebyla nalezena');

  await supabase.from('sessions').update({ partner_b_user_id: newUserB.id }).eq('id', sessionId);

  await supabase.from('couple_members').insert({
    couple_id: session.couple_id,
    user_id: newUserB.id,
    role: 'partner_b'
  });

  return { success: true, userId: newUserB.id };
}

// Autosave a single answer (upsert). Called after each question so progress
// survives reloads / connection drops. Relies on the
// unique(session_id, question_id, user_id) constraint.
export async function saveAnswer(
  sessionId: string,
  userId: string,
  questionId: number,
  kind: string,
  value: any
) {
  const supabase = getSupabaseAdmin();
  const row = {
    session_id: sessionId,
    question_id: questionId,
    user_id: userId,
    answer_yes_no: kind === 'yes_no' ? value === 'true' || value === true : null,
    answer_frequency: kind === 'frequency_1_5' ? parseInt(value) : null,
    answer_text: kind === 'short_answer' ? value : null,
  };

  const { error } = await supabase
    .from('answers')
    .upsert(row, { onConflict: 'session_id,question_id,user_id' });

  if (error) throw error;
  return { success: true };
}

// Marks this partner's round as complete. Answers are already persisted via
// saveAnswer, so this only flips completion state.
export async function completeRound(sessionId: string, userId: string, role: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.rpc('complete_partner_submission', {
    p_session_id: sessionId,
    p_user_id: userId,
    p_role: role,
  });
  if (error) throw error;
  return { success: true };
}

export async function invitePartner(sessionId: string, partnerBEmail?: string) {
  const supabase = getSupabaseAdmin();
  const locale = await getLocale();
  const normalizedEmail = partnerBEmail?.toLowerCase().trim();

  let activeUserB;

  if (normalizedEmail) {
    const { data: userB } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    activeUserB = userB;

    if (!activeUserB) {
      const { data: newUserB } = await supabase
        .from('users')
        .insert({ email: normalizedEmail })
        .select('id')
        .single();
      activeUserB = newUserB;
    }
  } else {
    const { data: newUserB } = await supabase
      .from('users')
      .insert({ is_anonymous: true })
      .select('id')
      .single();
    activeUserB = newUserB;
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('couple_id, partner_b_access_token')
    .eq('id', sessionId)
    .single();

  if (!session) throw new Error('Session not found');

  await supabase.from('sessions').update({ partner_b_user_id: activeUserB!.id }).eq('id', sessionId);

  const { data: existingMember } = await supabase
    .from('couple_members')
    .select('id')
    .eq('couple_id', session.couple_id)
    .eq('user_id', activeUserB!.id)
    .single();

  if (!existingMember) {
    await supabase.from('couple_members').insert({
      couple_id: session.couple_id,
      user_id: activeUserB!.id,
      role: 'partner_b'
    });
  }

  const baseUrl = await getBaseUrl();
  const inviteLink = `${baseUrl}/${locale}/session/${sessionId}?token=${session.partner_b_access_token}`;

  if (normalizedEmail) {
    const result = await sendInviteEmail(normalizedEmail, inviteLink, locale);
    return { success: true, inviteLink, emailSent: result.ok, emailError: result.ok ? undefined : result.error };
  }

  return { success: true, inviteLink, emailSent: false, emailError: undefined as string | undefined };
}

export async function generateNextSession(coupleId: string, userId: string, questionCount?: number, tierPref?: string) {
  const supabase = getSupabaseAdmin();
  const locale = await getLocale();

  if (!questionCount || !tierPref) {
    const { data: lastSession } = await supabase
      .from('sessions')
      .select('question_count, tier_pref')
      .eq('couple_id', coupleId)
      .order('session_number', { ascending: false })
      .limit(1)
      .single();

    questionCount = questionCount || lastSession?.question_count || 10;
    tierPref = tierPref || lastSession?.tier_pref || 'vanilla';
  }

  const sessionId = await createSessionOrPaywall(coupleId, userId, userId, questionCount ?? 10, tierPref ?? 'vanilla');

  const { data: session } = await supabase
    .from('sessions')
    .select('partner_a_access_token')
    .eq('id', sessionId)
    .single();

  if (!session) throw new Error('Session creation failed');

  redirect({ href: `/session/${sessionId}?token=${session.partner_a_access_token}`, locale });
}
