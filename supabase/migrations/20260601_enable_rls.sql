-- Migration: enable Row Level Security (defense-in-depth).
-- Run in the Supabase SQL editor after the auth/entitlements migration.
--
-- Context: the app performs all data access server-side through the service
-- role key, which BYPASSES RLS. The browser/SSR clients only call `auth.*`
-- (sign-in, getUser) and never read these tables directly. Enabling RLS here
-- therefore changes nothing for the app, but locks the tables down so the
-- public anon key cannot read or write them if it is ever used directly or
-- leaks. Sensitive tables get deny-by-default (RLS on, no anon policies);
-- non-sensitive content tables get explicit public read.

-- ========= Sensitive tables: RLS on, no anon/authenticated policies =========
-- (service role still has full access)
alter table public.users            enable row level security;
alter table public.couples          enable row level security;
alter table public.couple_members   enable row level security;
alter table public.sessions         enable row level security;
alter table public.session_questions enable row level security;
alter table public.answers          enable row level security;
alter table public.entitlements     enable row level security;

-- ========= Public content tables: RLS on + read-only for everyone =========
alter table public.questions             enable row level security;
alter table public.question_translations enable row level security;

drop policy if exists "questions_public_read" on public.questions;
create policy "questions_public_read"
  on public.questions
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "question_translations_public_read" on public.question_translations;
create policy "question_translations_public_read"
  on public.question_translations
  for select
  to anon, authenticated
  using (true);

-- Note: when client-side reads of user-owned data are introduced later, add
-- per-row policies here, e.g. answers visible only to members of the couple
-- that owns the session. Until then, deny-by-default is the safe posture.
