'use server';

import { getSupabaseAdmin } from '@/lib/supabase';
import { sendInviteEmail } from '@/lib/mail';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

async function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  const host = (await headers()).get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function startSession(email?: string, questionCount: number = 20, tierPref: string = 'vanilla') {
  const supabase = getSupabaseAdmin();
  const normalizedEmail = email?.toLowerCase().trim();

  let activeUser;

  if (normalizedEmail) {
    // 1. Get or create user by email
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
    // Create anonymous user
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({ is_anonymous: true })
      .select('id')
      .single();

    if (createError) throw createError;
    activeUser = newUser;
  }

  // 2. Check if user is already in a couple, otherwise create a standalone couple for now
  // In this simplified flow, User A starts, then later invites User B.
  const { data: member } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', activeUser!.id)
    .single();

  let coupleId = member?.couple_id;

  if (!coupleId) {
    // Create new couple
    const { data: newCouple, error: coupleError } = await supabase
      .from('couples')
      .insert({ created_by_user_id: activeUser!.id })
      .select('id')
      .single();

    if (coupleError) throw coupleError;
    coupleId = newCouple.id;

    // Add User A as member
    await supabase.from('couple_members').insert({
      couple_id: coupleId,
      user_id: activeUser!.id,
      role: 'partner_a'
    });
  }

  // 3. Create next session using RPC
  const { data: sessionId, error: rpcError } = await supabase.rpc('create_next_session', {
    p_couple_id: coupleId,
    p_created_by_user_id: activeUser!.id,
    p_partner_a_user_id: activeUser!.id,
    p_question_count: questionCount,
    p_tier_pref: tierPref
  });

  if (rpcError) throw rpcError;

  // 4. Get access token for partner A
  const { data: session } = await supabase
    .from('sessions')
    .select('partner_a_access_token')
    .eq('id', sessionId)
    .single();

  if (!session) throw new Error('Session creation failed');

  redirect(`/session/${sessionId}?token=${session.partner_a_access_token}`);
}

export async function joinSession(sessionId: string) {
  const supabase = getSupabaseAdmin();

  // Create anonymous User B
  const { data: newUserB, error: createError } = await supabase
    .from('users')
    .insert({ is_anonymous: true })
    .select('id')
    .single();

  if (createError) throw createError;

  // Get session info
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('couple_id')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) throw new Error('Relace nebyla nalezena');

  // Update session with User B
  await supabase.from('sessions').update({ partner_b_user_id: newUserB.id }).eq('id', sessionId);

  // Add User B to couple
  await supabase.from('couple_members').insert({
    couple_id: session.couple_id,
    user_id: newUserB.id,
    role: 'partner_b'
  });

  return { success: true, userId: newUserB.id };
}

export async function submitAnswers(sessionId: string, userId: string, answers: { questionId: number, kind: string, value: any }[], role: string) {
  const supabase = getSupabaseAdmin();

  // Insert answers
  const formattedAnswers = answers.map(a => ({
    session_id: sessionId,
    question_id: a.questionId,
    user_id: userId,
    answer_yes_no: a.kind === 'yes_no' ? a.value : null,
    answer_frequency: a.kind === 'frequency_1_5' ? parseInt(a.value) : null,
    answer_text: a.kind === 'short_answer' ? a.value : null,
  }));

  const { error: insertError } = await supabase.from('answers').insert(formattedAnswers);
  if (insertError) throw insertError;

  // Mark completion
  const { error: completeError } = await supabase.rpc('complete_partner_submission', {
    p_session_id: sessionId,
    p_user_id: userId,
    p_role: role
  });

  if (completeError) throw completeError;

  return { success: true };
}

export async function invitePartner(sessionId: string, partnerBEmail?: string) {
  const supabase = getSupabaseAdmin();
  const normalizedEmail = partnerBEmail?.toLowerCase().trim();

  let activeUserB;

  if (normalizedEmail) {
    // 1. Get or create User B
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
    // Create anonymous User B
    const { data: newUserB } = await supabase
      .from('users')
      .insert({ is_anonymous: true })
      .select('id')
      .single();
    activeUserB = newUserB;
  }

  // 2. Get session and couple info
  const { data: session } = await supabase
    .from('sessions')
    .select('couple_id, partner_b_access_token')
    .eq('id', sessionId)
    .single();

  if (!session) throw new Error('Session not found');

  // 3. Update session with User B
  await supabase.from('sessions').update({ partner_b_user_id: activeUserB!.id }).eq('id', sessionId);

  // 4. Add User B to couple if not already
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

  // 5. Send email if provided
  const baseUrl = await getBaseUrl();
  const inviteLink = `${baseUrl}/session/${sessionId}?token=${session.partner_b_access_token}`;

  if (normalizedEmail) {
    await sendInviteEmail(normalizedEmail, inviteLink);
  }

  return { success: true, inviteLink };
}

export async function generateNextSession(coupleId: string, userId: string, questionCount?: number, tierPref?: string) {
  const supabase = getSupabaseAdmin();

  // If no preferences passed, inherit from the latest session of this couple
  if (!questionCount || !tierPref) {
    const { data: lastSession } = await supabase
      .from('sessions')
      .select('question_count, tier_pref')
      .eq('couple_id', coupleId)
      .order('session_number', { ascending: false })
      .limit(1)
      .single();

    questionCount = questionCount || lastSession?.question_count || 20;
    tierPref = tierPref || lastSession?.tier_pref || 'vanilla';
  }

  const { data: sessionId, error: rpcError } = await supabase.rpc('create_next_session', {
    p_couple_id: coupleId,
    p_created_by_user_id: userId,
    p_partner_a_user_id: userId,
    p_question_count: questionCount,
    p_tier_pref: tierPref
  });

  if (rpcError) throw rpcError;

  const { data: session } = await supabase
    .from('sessions')
    .select('partner_a_access_token')
    .eq('id', sessionId)
    .single();

  if (!session) throw new Error('Session creation failed');

  redirect(`/session/${sessionId}?token=${session.partner_a_access_token}`);
}
