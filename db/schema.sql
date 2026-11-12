-- NakedTruth — Postgres schema (Neon).
-- Consolidated from the former Supabase schema + migrations. Idempotent:
--   psql "$DATABASE_URL" -f db/schema.sql
--   psql "$DATABASE_URL" -f db/seed_questions.sql

create extension if not exists pgcrypto;

-- ========= ENUMS =========
do $$ begin create type question_tier as enum ('tier_1', 'tier_2');
exception when duplicate_object then null; end $$;
do $$ begin create type question_kind as enum ('yes_no', 'frequency_1_5', 'short_answer');
exception when duplicate_object then null; end $$;
do $$ begin create type session_status as enum ('pending_partner', 'completed');
exception when duplicate_object then null; end $$;
do $$ begin create type tier_preference as enum ('vanilla', 'spicy', 'mixed');
exception when duplicate_object then null; end $$;
do $$ begin create type participant_role as enum ('partner_a', 'partner_b');
exception when duplicate_object then null; end $$;

-- ========= USERS / COUPLES =========
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  constraint users_email_lowercase check (email = lower(email))
);

create table if not exists couples (
  id uuid primary key default gen_random_uuid(),
  created_by_user_id uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists couple_members (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role participant_role not null,
  joined_at timestamptz not null default now(),
  unique (couple_id, user_id),
  unique (couple_id, role)
);

-- ========= QUESTIONS =========
create table if not exists questions (
  id integer generated always as identity primary key,
  tier question_tier not null,
  kind question_kind not null,
  prompt text not null,
  is_active boolean not null default true,
  -- tier_2 classification: theme in ('explicit','fantasy','bdsm','compat'), intensity 1-3
  theme text,
  intensity smallint,
  is_calibration boolean not null default false,
  -- non-null = premium pack question (never served in free sessions)
  pack text,
  created_at timestamptz not null default now()
);

create index if not exists idx_questions_tier_active on questions (tier, is_active);
create index if not exists idx_questions_pack on questions (pack) where pack is not null;

-- Translations of question prompts. Czech lives in questions.prompt; a missing
-- row falls back to it. Seeded from db/seed_question_translations.sql.
create table if not exists question_translations (
  question_id integer not null references questions(id) on delete cascade,
  locale text not null,
  prompt text not null,
  primary key (question_id, locale)
);

-- ========= SESSIONS =========
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  created_by_user_id uuid not null references users(id) on delete restrict,
  session_number int not null,
  status session_status not null default 'pending_partner',
  partner_a_user_id uuid not null references users(id) on delete restrict,
  partner_b_user_id uuid references users(id) on delete restrict,
  partner_a_completed_at timestamptz,
  partner_b_completed_at timestamptz,
  completed_at timestamptz,
  question_count int not null default 20,
  tier_pref tier_preference not null default 'vanilla',
  max_intensity smallint,
  themes text[],
  pack text,
  partner_a_access_token uuid not null default gen_random_uuid(),
  partner_b_access_token uuid not null default gen_random_uuid(),
  results_email_sent_at timestamptz,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (couple_id, session_number),
  unique (partner_a_access_token),
  unique (partner_b_access_token)
);

-- Language the session was started in: used for e-mails and links sent later.
alter table sessions add column if not exists locale text not null default 'cs';

create index if not exists idx_sessions_couple_created_at on sessions (couple_id, created_at desc);

create table if not exists session_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  question_id integer not null references questions(id) on delete restrict,
  question_order int not null,
  created_at timestamptz not null default now(),
  unique (session_id, question_id),
  unique (session_id, question_order)
);

create index if not exists idx_session_questions_session on session_questions (session_id, question_order);

-- ========= ANSWERS =========
create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  question_id integer not null references questions(id) on delete restrict,
  user_id uuid not null references users(id) on delete cascade,
  answer_yes_no boolean,
  answer_frequency smallint,
  answer_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, question_id, user_id),
  constraint answers_frequency_range check (answer_frequency is null or (answer_frequency between 1 and 5))
);

create index if not exists idx_answers_session_user on answers (session_id, user_id);

-- Reject answers to questions that are not part of the session.
create or replace function validate_answer_question_in_session()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1 from session_questions sq
    where sq.session_id = new.session_id and sq.question_id = new.question_id
  ) then
    raise exception 'Question % is not part of session %', new.question_id, new.session_id;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_validate_answer_question_in_session on answers;
create trigger trg_validate_answer_question_in_session
before insert or update on answers
for each row execute function validate_answer_question_in_session();

-- ========= ENTITLEMENTS (paid unlocks) =========
create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  product_code text not null,
  source text not null default 'stripe',
  stripe_payment_intent_id text,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (user_id, product_code)
);

create unique index if not exists uq_entitlements_payment_intent
  on entitlements (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create or replace function has_entitlement(p_user_id uuid, p_product_code text)
returns boolean language sql stable as $$
  select exists (
    select 1 from entitlements e
    where e.user_id = p_user_id
      and e.product_code = p_product_code
      and (e.expires_at is null or e.expires_at > now())
  );
$$;

-- ========= create_next_session: non-repeating questions per couple =========
-- vanilla = tier_1 only, spicy = tier_2 only, mixed = half/half. tier_2 is
-- filtered by intensity ceiling and optional themes; premium packs never leak in.
create or replace function create_next_session(
  p_couple_id uuid,
  p_created_by_user_id uuid,
  p_partner_a_user_id uuid,
  p_question_count integer default 10,
  p_tier_pref tier_preference default 'vanilla',
  p_max_intensity integer default 3,
  p_themes text[] default null
)
returns uuid language plpgsql as $$
declare
  v_session_id uuid;
  v_session_number int;
  v_tier2_count int;
  v_tier1_count int;
  v_cal_count int := 0;
  v_has_tier2 boolean;
begin
  if p_question_count <= 0 then
    raise exception 'p_question_count must be > 0';
  end if;

  v_has_tier2 := p_tier_pref in ('spicy', 'mixed');

  select coalesce(max(s.session_number), 0) + 1 into v_session_number
  from sessions s where s.couple_id = p_couple_id;

  insert into sessions (
    couple_id, created_by_user_id, session_number, partner_a_user_id, status,
    question_count, tier_pref, max_intensity, themes
  )
  values (
    p_couple_id, p_created_by_user_id, v_session_number, p_partner_a_user_id, 'pending_partner',
    p_question_count, p_tier_pref,
    case when v_has_tier2 then p_max_intensity else null end,
    case when v_has_tier2 then p_themes else null end
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

  -- Calibration questions (if any) always lead a tier_2 session.
  if v_has_tier2 then
    insert into session_questions (session_id, question_id, question_order)
    select v_session_id, c.id,
      row_number() over (order by array_position(array['explicit','bdsm','fantasy','compat'], c.theme), c.id)
    from questions c
    where c.is_calibration = true and c.is_active = true
      and (p_themes is null or c.theme = any(p_themes));
    select count(*) into v_cal_count from session_questions where session_id = v_session_id;
  end if;

  with used_questions as (
    select distinct sq.question_id
    from session_questions sq
    join sessions s on s.id = sq.session_id
    where s.couple_id = p_couple_id
  ),
  tier1_pick as (
    select q.id as question_id
    from questions q
    where q.is_active and q.tier = 'tier_1' and not q.is_calibration and q.pack is null
      and not exists (select 1 from used_questions uq where uq.question_id = q.id)
    order by random() limit v_tier1_count
  ),
  tier2_pick as (
    select q.id as question_id
    from questions q
    where q.is_active and q.tier = 'tier_2' and not q.is_calibration and q.pack is null
      and (q.intensity is null or q.intensity <= p_max_intensity)
      and (p_themes is null or q.theme = any(p_themes) or q.theme is null)
      and not exists (select 1 from used_questions uq where uq.question_id = q.id)
    order by random() limit v_tier2_count
  ),
  merged as (
    select question_id from tier1_pick
    union all
    select question_id from tier2_pick
  ),
  ordered as (
    select question_id, row_number() over (order by random()) + v_cal_count as question_order
    from merged
  )
  insert into session_questions (session_id, question_id, question_order)
  select v_session_id, o.question_id, o.question_order from ordered o;

  return v_session_id;
end;
$$;

-- ========= create_pack_session: premium pack, entitlement-gated =========
create or replace function create_pack_session(
  p_couple_id uuid,
  p_created_by_user_id uuid,
  p_partner_a_user_id uuid,
  p_question_count integer,
  p_pack text,
  p_user_id uuid
)
returns uuid language plpgsql as $$
declare
  v_session_id uuid;
  v_session_number int;
begin
  if p_pack is null then raise exception 'p_pack is required'; end if;
  if p_question_count <= 0 then raise exception 'p_question_count must be > 0'; end if;
  -- Defense in depth: the app checks the entitlement first.
  if p_user_id is null or not has_entitlement(p_user_id, 'premium') then
    raise exception 'PAYWALL_PREMIUM';
  end if;

  select coalesce(max(s.session_number), 0) + 1 into v_session_number
  from sessions s where s.couple_id = p_couple_id;

  insert into sessions (
    couple_id, created_by_user_id, session_number, partner_a_user_id, status,
    question_count, tier_pref, pack
  )
  values (
    p_couple_id, p_created_by_user_id, v_session_number, p_partner_a_user_id, 'pending_partner',
    p_question_count, 'spicy', p_pack
  )
  returning id into v_session_id;

  -- Packs are small, curated and replayable: used questions are not excluded.
  with pick as (
    select q.id as question_id
    from questions q
    where q.is_active and q.pack = p_pack and not q.is_calibration
    order by random() limit p_question_count
  ),
  ordered as (
    select question_id, row_number() over (order by random()) as question_order from pick
  )
  insert into session_questions (session_id, question_id, question_order)
  select v_session_id, o.question_id, o.question_order from ordered o;

  update sessions
    set question_count = (select count(*) from session_questions where session_id = v_session_id)
    where id = v_session_id;

  return v_session_id;
end;
$$;

-- ========= complete_partner_submission =========
create or replace function complete_partner_submission(
  p_session_id uuid,
  p_user_id uuid,
  p_role participant_role
)
returns void language plpgsql as $$
begin
  if p_role = 'partner_a' then
    update sessions set partner_a_completed_at = coalesce(partner_a_completed_at, now())
    where id = p_session_id and partner_a_user_id = p_user_id;
  elsif p_role = 'partner_b' then
    update sessions set partner_b_completed_at = coalesce(partner_b_completed_at, now())
    where id = p_session_id and partner_b_user_id = p_user_id;
  else
    raise exception 'Invalid role';
  end if;

  update sessions
  set status = 'completed', completed_at = coalesce(completed_at, now())
  where id = p_session_id
    and partner_a_completed_at is not null
    and partner_b_completed_at is not null;
end;
$$;

-- ========= KINKOMETR: solo kink profile ("poháry") =========
-- Anonymous. `id` is the private link to the owner's result and is never shown
-- to anyone else. `invite_token` is what the owner shares: it lets a partner
-- take the test and see the mutual comparison, but not the owner's result.
-- `partner_of` links a profile filled in from somebody's invite.
create table if not exists kink_profiles (
  id uuid primary key default gen_random_uuid(),
  partner_of uuid references kink_profiles(id) on delete set null,
  mode text not null default 'full',
  -- { "<questionId>": 0..4 }
  answers jsonb not null,
  -- { "<cupKey>": { "fill": 0..100, "unsure": n, "count": n, "depth"?, "give"?, "receive"? } }
  cups jsonb not null,
  created_at timestamptz not null default now()
);

alter table kink_profiles
  add column if not exists invite_token uuid not null default gen_random_uuid(),
  -- { "single": bool, "lowDesire": bool } — asked at the start, never scored
  add column if not exists context jsonb not null default '{}'::jsonb,
  -- free text: "what is missing here?" — visible only to the owner
  add column if not exists missing text,
  -- paid detailed report: when it was unlocked and by which Stripe payment
  add column if not exists report_unlocked_at timestamptz,
  add column if not exists report_payment text;

create unique index if not exists uq_kink_profiles_invite_token on kink_profiles (invite_token);
create index if not exists idx_kink_profiles_partner_of on kink_profiles (partner_of) where partner_of is not null;

-- ========= EVENTS: anonymous daily counters =========
-- One number per day, event and language. No visitor id, no IP, no cookie.
create table if not exists events (
  day date not null,
  name text not null,
  locale text not null default 'cs',
  count integer not null default 0,
  primary key (day, name, locale)
);

-- Stripe webhook events already handled, so a retried delivery is a no-op.
create table if not exists stripe_events (
  id text primary key,
  received_at timestamptz not null default now()
);

-- Set once the event has been handled completely. While null, received_at is
-- the time of the latest attempt and the event may be worked again.
alter table stripe_events add column if not exists processed_at timestamptz;

-- ========= E-MAIL ACCESS RECOVERY =========
-- Optional e-mail kept with a Kinkometr result: set when the owner asks to
-- have the link e-mailed, or taken from the checkout when they buy a report.
-- Deleted with the result.
alter table kink_profiles add column if not exists email text;
create index if not exists idx_kink_profiles_email on kink_profiles (email) where email is not null;

-- At most a few e-mails per address and day. `key` is a SHA-256 of the
-- address, so this table holds no e-mail addresses.
create table if not exists mail_throttle (
  key text not null,
  day date not null default current_date,
  count integer not null default 0,
  primary key (key, day)
);

-- ========= COUPLE REPORT =========
-- Paid joint plan for two connected Kinkometr results. Keyed by the two
-- shareable invite tokens in ascending order; one payment unlocks it for both.
create table if not exists kink_pair_reports (
  a_invite uuid not null references kink_profiles (invite_token) on delete cascade,
  b_invite uuid not null references kink_profiles (invite_token) on delete cascade,
  unlocked_at timestamptz not null default now(),
  payment text,
  primary key (a_invite, b_invite),
  check (a_invite < b_invite)
);

-- Purchase confirmation e-mails, one per Stripe Checkout session. Tracked
-- apart from the unlock so that a failed send is retried. sent_at null =
-- claimed but not (yet) delivered.
create table if not exists purchase_confirmations (
  session_id text primary key,
  claimed_at timestamptz not null default now(),
  sent_at timestamptz
);
