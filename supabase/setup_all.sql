-- Master Setup for NakedTruth
-- Run this in Supabase SQL Editor. It creates everything in the correct order.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create Enums safely
DO $$ BEGIN
    CREATE TYPE public.question_tier AS ENUM ('tier_1', 'tier_2');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.question_kind AS ENUM ('yes_no', 'frequency_1_5', 'short_answer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.session_status AS ENUM ('pending_partner', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.participant_role AS ENUM ('partner_a', 'partner_b');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_lowercase CHECK (email = lower(email))
);

CREATE TABLE IF NOT EXISTS public.couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.couple_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role public.participant_role NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (couple_id, user_id),
  UNIQUE (couple_id, role)
);

CREATE TABLE IF NOT EXISTS public.questions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tier public.question_tier NOT NULL,
  kind public.question_kind NOT NULL,
  prompt text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_tier_active ON public.questions (tier, is_active);

CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  created_by_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  session_number int NOT NULL,
  status public.session_status NOT NULL DEFAULT 'pending_partner',
  partner_a_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  partner_b_user_id uuid REFERENCES public.users(id) ON DELETE RESTRICT,
  partner_a_completed_at timestamptz,
  partner_b_completed_at timestamptz,
  completed_at timestamptz,
  partner_a_access_token uuid NOT NULL DEFAULT gen_random_uuid(),
  partner_b_access_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (couple_id, session_number),
  UNIQUE (partner_a_access_token),
  UNIQUE (partner_b_access_token)
);

CREATE INDEX IF NOT EXISTS idx_sessions_couple_created_at ON public.sessions (couple_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.session_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  question_id bigint NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
  question_order int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, question_id),
  UNIQUE (session_id, question_order)
);

CREATE INDEX IF NOT EXISTS idx_session_questions_session ON public.session_questions (session_id, question_order);

CREATE TABLE IF NOT EXISTS public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  question_id bigint NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  answer_yes_no boolean,
  answer_frequency smallint,
  answer_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, question_id, user_id),
  CONSTRAINT answers_frequency_range CHECK (
    answer_frequency IS NULL OR (answer_frequency BETWEEN 1 AND 5)
  )
);

CREATE INDEX IF NOT EXISTS idx_answers_session_user ON public.answers (session_id, user_id);

-- 3. Functions & Triggers
CREATE OR REPLACE FUNCTION public.validate_answer_question_in_session()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.session_questions sq
    WHERE sq.session_id = new.session_id
      AND sq.question_id = new.question_id
  ) THEN
    RAISE EXCEPTION 'Question % is not part of session %', new.question_id, new.session_id;
  END IF;

  new.updated_at := now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_answer_question_in_session ON public.answers;
CREATE TRIGGER trg_validate_answer_question_in_session
BEFORE INSERT OR UPDATE ON public.answers
FOR EACH ROW EXECUTE FUNCTION public.validate_answer_question_in_session();

CREATE OR REPLACE FUNCTION public.create_next_session(
  p_couple_id uuid,
  p_created_by_user_id uuid,
  p_partner_a_user_id uuid,
  p_question_count int DEFAULT 20,
  p_tier2_mix_count int DEFAULT 10
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id uuid;
  v_session_number int;
  v_total_previous int;
  v_tier2_count int;
  v_tier1_count int;
BEGIN
  SELECT count(*) INTO v_total_previous FROM public.sessions WHERE couple_id = p_couple_id;
  v_session_number := v_total_previous + 1;

  INSERT INTO public.sessions (couple_id, created_by_user_id, session_number, partner_a_user_id, status)
  VALUES (p_couple_id, p_created_by_user_id, v_session_number, p_partner_a_user_id, 'pending_partner')
  RETURNING id INTO v_session_id;

  IF v_session_number = 1 THEN
    v_tier2_count := 0;
    v_tier1_count := p_question_count;
  ELSE
    v_tier2_count := p_tier2_mix_count;
    v_tier1_count := p_question_count - v_tier2_count;
  END IF;

  WITH used_questions AS (
    SELECT DISTINCT sq.question_id
    FROM public.session_questions sq
    JOIN public.sessions s ON s.id = sq.session_id
    WHERE s.couple_id = p_couple_id
  ),
  tier1_pick AS (
    SELECT q.id AS question_id FROM public.questions q
    WHERE q.is_active = true AND q.tier = 'tier_1'
      AND NOT EXISTS (SELECT 1 FROM used_questions uq WHERE uq.question_id = q.id)
    ORDER BY random() LIMIT v_tier1_count
  ),
  tier2_pick AS (
    SELECT q.id AS question_id FROM public.questions q
    WHERE q.is_active = true AND q.tier = 'tier_2'
      AND NOT EXISTS (SELECT 1 FROM used_questions uq WHERE uq.question_id = q.id)
    ORDER BY random() LIMIT v_tier2_count
  ),
  merged AS (
    SELECT question_id FROM tier1_pick
    UNION ALL
    SELECT question_id FROM tier2_pick
  ),
  ordered AS (
    SELECT question_id, row_number() OVER (ORDER BY random()) AS question_order
    FROM merged
  )
  INSERT INTO public.session_questions (session_id, question_id, question_order)
  SELECT v_session_id, o.question_id, o.question_order
  FROM ordered o;

  RETURN v_session_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_partner_submission(
  p_session_id uuid,
  p_user_id uuid,
  p_role public.participant_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_role = 'partner_a' THEN
    UPDATE public.sessions SET partner_a_completed_at = coalesce(partner_a_completed_at, now())
    WHERE id = p_session_id AND partner_a_user_id = p_user_id;
  ELSIF p_role = 'partner_b' THEN
    UPDATE public.sessions SET partner_b_completed_at = coalesce(partner_b_completed_at, now())
    WHERE id = p_session_id AND partner_b_user_id = p_user_id;
  END IF;

  UPDATE public.sessions SET status = 'completed', completed_at = coalesce(completed_at, now())
  WHERE id = p_session_id AND partner_a_completed_at IS NOT NULL AND partner_b_completed_at IS NOT NULL;
END;
$$;

COMMIT;
