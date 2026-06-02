-- Migration: harden grants & remove stale function overloads.
-- Run after the auth/entitlements + RLS migrations.
--
-- Why: adding the p_user_id parameter to create_next_session created a NEW
-- overload and left the older paywall-less overloads in place — those could be
-- called directly via PostgREST to bypass the tier_2 paywall. We drop them and
-- lock down direct anon/authenticated access to the SECURITY DEFINER functions
-- and sensitive tables (the app talks to all of these via the service role,
-- which is unaffected by these REVOKEs and bypasses RLS).

-- 1) Drop stale create_next_session overloads (keep only the 7-arg paywalled one).
drop function if exists public.create_next_session(uuid, uuid, uuid, integer, integer);
drop function if exists public.create_next_session(uuid, uuid, uuid, integer, integer, public.tier_preference);

-- 2) Lock down EXECUTE on SECURITY DEFINER functions. Functions grant EXECUTE
--    to PUBLIC by default (anon/authenticated inherit it), so revoke from PUBLIC
--    and re-grant only to service_role — the role the app uses for all RPC.
revoke execute on function
  public.create_next_session(uuid, uuid, uuid, integer, integer, public.tier_preference, uuid)
  from public, anon, authenticated;
grant execute on function
  public.create_next_session(uuid, uuid, uuid, integer, integer, public.tier_preference, uuid)
  to service_role;

revoke execute on function
  public.complete_partner_submission(uuid, uuid, public.participant_role)
  from public, anon, authenticated;
grant execute on function
  public.complete_partner_submission(uuid, uuid, public.participant_role)
  to service_role;

revoke execute on function
  public.has_entitlement(uuid, text)
  from public, anon, authenticated;
grant execute on function
  public.has_entitlement(uuid, text)
  to service_role;

-- 3) Revoke direct table access from public API roles on sensitive tables.
--    (RLS already denies rows, this also removes them from the exposed schema.)
revoke select, insert, update, delete on
  public.users,
  public.couples,
  public.couple_members,
  public.sessions,
  public.session_questions,
  public.answers,
  public.entitlements
  from anon, authenticated;

-- questions / question_translations stay readable (public content, RLS policies
-- allow SELECT) — nothing revoked there.

-- 4) Pin search_path on the legacy trigger function (linter 0011).
alter function public.validate_answer_question_in_session() set search_path = public;
