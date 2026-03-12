-- NakedTruth - Supabase schema (STEP 2)
-- Run this entire script in Supabase SQL editor.

create extension if not exists pgcrypto;

-- ========= ENUMS =========
do $$ begin
  create type question_tier as enum ('tier_1', 'tier_2');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type question_kind as enum ('yes_no', 'frequency_1_5', 'short_answer');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type session_status as enum ('pending_partner', 'completed');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type participant_role as enum ('partner_a', 'partner_b');
exception
  when duplicate_object then null;
end $$;

-- ========= USERS =========
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  constraint users_email_lowercase check (email = lower(email))
);

-- ========= COUPLES =========
create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  created_by_user_id uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.couple_members (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role participant_role not null,
  joined_at timestamptz not null default now(),
  unique (couple_id, user_id),
  unique (couple_id, role)
);

-- ========= QUESTIONS =========
create table if not exists public.questions (
  id bigint generated always as identity primary key,
  tier question_tier not null,
  kind question_kind not null,
  prompt text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_questions_tier_active on public.questions (tier, is_active);

-- ========= SESSIONS =========
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by_user_id uuid not null references public.users(id) on delete restrict,
  session_number int not null,
  status session_status not null default 'pending_partner',
  partner_a_user_id uuid not null references public.users(id) on delete restrict,
  partner_b_user_id uuid references public.users(id) on delete restrict,
  partner_a_completed_at timestamptz,
  partner_b_completed_at timestamptz,
  completed_at timestamptz,
  partner_a_access_token uuid not null default gen_random_uuid(),
  partner_b_access_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique (couple_id, session_number),
  unique (partner_a_access_token),
  unique (partner_b_access_token)
);

create index if not exists idx_sessions_couple_created_at on public.sessions (couple_id, created_at desc);

create table if not exists public.session_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  question_id bigint not null references public.questions(id) on delete restrict,
  question_order int not null,
  created_at timestamptz not null default now(),
  unique (session_id, question_id),
  unique (session_id, question_order)
);

create index if not exists idx_session_questions_session on public.session_questions (session_id, question_order);

-- ========= ANSWERS =========
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  question_id bigint not null references public.questions(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete cascade,
  answer_yes_no boolean,
  answer_frequency smallint,
  answer_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, question_id, user_id),
  constraint answers_frequency_range check (
    answer_frequency is null or (answer_frequency between 1 and 5)
  )
);

create index if not exists idx_answers_session_user on public.answers (session_id, user_id);

-- Ensure question belongs to session before accepting answer.
create or replace function public.validate_answer_question_in_session()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.session_questions sq
    where sq.session_id = new.session_id
      and sq.question_id = new.question_id
  ) then
    raise exception 'Question % is not part of session %', new.question_id, new.session_id;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_validate_answer_question_in_session on public.answers;
create trigger trg_validate_answer_question_in_session
before insert or update on public.answers
for each row execute function public.validate_answer_question_in_session();

-- ========= RPC: CREATE NEXT SESSION WITH NON-REPEATING QUESTIONS =========
-- Session #1 => only tier_1.
-- Session #2+ => mixed tier_1 + tier_2 (default 10 + 10) if available.
create or replace function public.create_next_session(
  p_couple_id uuid,
  p_created_by_user_id uuid,
  p_partner_a_user_id uuid,
  p_question_count int default 20,
  p_tier2_mix_count int default 10
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_session_number int;
  v_total_previous int;
  v_tier2_count int;
  v_tier1_count int;
begin
  if p_question_count <= 0 then
    raise exception 'p_question_count must be > 0';
  end if;

  if p_tier2_mix_count < 0 or p_tier2_mix_count > p_question_count then
    raise exception 'p_tier2_mix_count must be between 0 and p_question_count';
  end if;

  select count(*) into v_total_previous
  from public.sessions s
  where s.couple_id = p_couple_id;

  v_session_number := v_total_previous + 1;

  insert into public.sessions (
    couple_id,
    created_by_user_id,
    session_number,
    partner_a_user_id,
    status
  )
  values (
    p_couple_id,
    p_created_by_user_id,
    v_session_number,
    p_partner_a_user_id,
    'pending_partner'
  )
  returning id into v_session_id;

  if v_session_number = 1 then
    v_tier2_count := 0;
    v_tier1_count := p_question_count;
  else
    v_tier2_count := p_tier2_mix_count;
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

  if (select count(*) from public.session_questions where session_id = v_session_id) < p_question_count then
    raise exception 'Not enough unused questions for couple % to create session %', p_couple_id, v_session_number;
  end if;

  return v_session_id;
end;
$$;

-- ========= RPC: COMPLETE A PARTNER =========
create or replace function public.complete_partner_submission(
  p_session_id uuid,
  p_user_id uuid,
  p_role participant_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_role = 'partner_a' then
    update public.sessions
    set partner_a_completed_at = coalesce(partner_a_completed_at, now())
    where id = p_session_id
      and partner_a_user_id = p_user_id;
  elsif p_role = 'partner_b' then
    update public.sessions
    set partner_b_completed_at = coalesce(partner_b_completed_at, now())
    where id = p_session_id
      and partner_b_user_id = p_user_id;
  else
    raise exception 'Invalid role';
  end if;

  update public.sessions
  set status = 'completed',
      completed_at = coalesce(completed_at, now())
  where id = p_session_id
    and partner_a_completed_at is not null
    and partner_b_completed_at is not null;
end;
$$;
