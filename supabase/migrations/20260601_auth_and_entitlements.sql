-- Migration: link Supabase Auth to the existing profile table, and add
-- entitlements for paid content. Run in the Supabase SQL editor.

-- ========= AUTH LINK =========
-- public.users stays the profile table; auth.users is the identity provider.
-- Anonymous rows keep auth_user_id = null.
alter table public.users
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

create index if not exists idx_users_auth_user_id on public.users (auth_user_id);

-- ========= ENTITLEMENTS =========
-- Account-level entitlements (decision: tied to the user account). tier_1 is
-- always free; tier_2 / packs require a row here.
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_code text not null,                 -- 'tier_2' | 'pack_*'
  source text not null default 'stripe',      -- 'stripe' | 'grant'
  stripe_payment_intent_id text,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,                      -- null = lifetime
  unique (user_id, product_code)
);

create index if not exists idx_entitlements_user on public.entitlements (user_id, product_code);

-- Idempotent guard against double-grants from duplicate Stripe webhook events.
create unique index if not exists uq_entitlements_payment_intent
  on public.entitlements (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

-- Helper: does a user currently hold a product?
create or replace function public.has_entitlement(p_user_id uuid, p_product_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = p_user_id
      and e.product_code = p_product_code
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

-- ========= UPDATED RPC: enforce the paywall server-side =========
-- tier_1 (vanilla) is always allowed. spicy/mixed require the 'tier_2'
-- entitlement for the requesting user, otherwise the RPC raises PAYWALL.
create or replace function public.create_next_session(
  p_couple_id uuid,
  p_created_by_user_id uuid,
  p_partner_a_user_id uuid,
  p_question_count int default 10,
  p_tier2_mix_count int default 10,
  p_tier_pref tier_preference default 'vanilla',
  p_user_id uuid default null
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

  -- Paywall: any tier_2 content requires an entitlement.
  if p_tier_pref in ('spicy', 'mixed') then
    if p_user_id is null or not public.has_entitlement(p_user_id, 'tier_2') then
      raise exception 'PAYWALL';
    end if;
  end if;

  select coalesce(max(s.session_number), 0) + 1 into v_session_number
  from public.sessions s
  where s.couple_id = p_couple_id;

  insert into public.sessions (
    couple_id, created_by_user_id, session_number,
    partner_a_user_id, status, question_count, tier_pref
  )
  values (
    p_couple_id, p_created_by_user_id, v_session_number,
    p_partner_a_user_id, 'pending_partner', p_question_count, p_tier_pref
  )
  returning id into v_session_id;

  if p_tier_pref = 'vanilla' then
    v_tier1_count := p_question_count;
    v_tier2_count := 0;
  elsif p_tier_pref = 'spicy' then
    v_tier1_count := 0;
    v_tier2_count := p_question_count;
  else
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
    where q.is_active = true and q.tier = 'tier_1'
      and not exists (select 1 from used_questions uq where uq.question_id = q.id)
    order by random() limit v_tier1_count
  ),
  tier2_pick as (
    select q.id as question_id
    from public.questions q
    where q.is_active = true and q.tier = 'tier_2'
      and not exists (select 1 from used_questions uq where uq.question_id = q.id)
    order by random() limit v_tier2_count
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
