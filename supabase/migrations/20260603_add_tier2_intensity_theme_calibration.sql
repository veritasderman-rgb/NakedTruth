-- Migration: Add the tier_2 intensity / theme / calibration schema and the
-- entitlements infrastructure that the live database already had but the repo
-- migrations never captured.
--
-- Why this exists: create_next_session (see 20260604_remove_tier2_paywall.sql)
-- and the application's startSession/generateNextSession now reference
-- sessions.max_intensity, sessions.themes and questions.intensity / theme /
-- is_calibration, plus the entitlements table + has_entitlement(). A database
-- initialized purely from the repo SQL/migrations was missing all of these, so
-- the RPC would fail (PostgREST cannot resolve create_next_session with the new
-- args, and the function body references non-existent columns). This migration
-- backfills the schema so the repo is self-consistent for fresh environments.
--
-- It is intentionally dated before 20260604 so that, on a clean `supabase db
-- reset`, the columns exist before the function that depends on them is created.
-- Everything here is idempotent (IF NOT EXISTS / CREATE OR REPLACE) so applying
-- it to the already-migrated production database is a safe no-op.

-- ========= sessions: per-session tier_2 preferences =========
alter table public.sessions
  add column if not exists max_intensity smallint,
  add column if not exists themes text[];

-- ========= questions: tier_2 classification =========
alter table public.questions
  add column if not exists intensity smallint,
  add column if not exists theme text,
  add column if not exists is_calibration boolean not null default false;

-- ========= entitlements: paid unlocks (future Stripe paywall) =========
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_code text not null,
  source text not null default 'stripe',
  stripe_payment_intent_id text,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (user_id, product_code)
);

create index if not exists idx_entitlements_user
  on public.entitlements (user_id, product_code);

create unique index if not exists uq_entitlements_payment_intent
  on public.entitlements (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

-- Helper used by future paywall logic. Currently nothing enforces it (tier_2 is
-- free — see 20260604_remove_tier2_paywall.sql), but the function is part of the
-- real schema and is kept so the paywall can be reintroduced cleanly later.
create or replace function public.has_entitlement(p_user_id uuid, p_product_code text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = p_user_id
      and e.product_code = p_product_code
      and (e.expires_at is null or e.expires_at > now())
  );
$function$;
