-- Migration: Add question count and tier preference to sessions
-- Run this in Supabase SQL editor after the initial schema.

-- New enum for tier preference
do $$ begin
  create type tier_preference as enum ('vanilla', 'spicy', 'mixed');
exception
  when duplicate_object then null;
end $$;

-- Add columns to sessions
alter table public.sessions
  add column if not exists question_count int not null default 20,
  add column if not exists tier_pref tier_preference not null default 'vanilla';

-- ========= UPDATED RPC: CREATE NEXT SESSION WITH TIER PREFERENCE =========
create or replace function public.create_next_session(
  p_couple_id uuid,
  p_created_by_user_id uuid,
  p_partner_a_user_id uuid,
  p_question_count int default 20,
  p_tier2_mix_count int default 10,
  p_tier_pref tier_preference default 'vanilla'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_session_number int;
  v_tier2_count int;
  v_tier1_count int;
begin
  if p_question_count <= 0 then
    raise exception 'p_question_count must be > 0';
  end if;

  select coalesce(max(s.session_number), 0) + 1 into v_session_number
  from public.sessions s
  where s.couple_id = p_couple_id;

  insert into public.sessions (
    couple_id,
    created_by_user_id,
    session_number,
    partner_a_user_id,
    status,
    question_count,
    tier_pref
  )
  values (
    p_couple_id,
    p_created_by_user_id,
    v_session_number,
    p_partner_a_user_id,
    'pending_partner',
    p_question_count,
    p_tier_pref
  )
  returning id into v_session_id;

  -- Determine tier split based on preference
  if p_tier_pref = 'vanilla' then
    v_tier1_count := p_question_count;
    v_tier2_count := 0;
  elsif p_tier_pref = 'spicy' then
    v_tier1_count := 0;
    v_tier2_count := p_question_count;
  else -- 'mixed'
    v_tier2_count := ceil(p_question_count::numeric / 2);
    v_tier1_count := p_question_count - v_tier2_count;
  end if;

  with used_questions as (
    select distinct sq.question_id
    from public.session_questions sq
    join public.sessions s on s.id = sq.session_id
    where s.couple_id = p_couple_id
  ),
  tier1_pick as (
    select q.id as question_id
    from public.questions q
    where q.is_active = true
      and q.tier = 'tier_1'
      and not exists (select 1 from used_questions uq where uq.question_id = q.id)
    order by random()
    limit v_tier1_count
  ),
  tier2_pick as (
    select q.id as question_id
    from public.questions q
    where q.is_active = true
      and q.tier = 'tier_2'
      and not exists (select 1 from used_questions uq where uq.question_id = q.id)
    order by random()
    limit v_tier2_count
  ),
  merged as (
    select question_id from tier1_pick
    union all
    select question_id from tier2_pick
  ),
  ordered as (
    select question_id, row_number() over (order by random()) as question_order
    from merged
  )
  insert into public.session_questions (session_id, question_id, question_order)
  select v_session_id, o.question_id, o.question_order
  from ordered o;

  return v_session_id;
end;
$$;
