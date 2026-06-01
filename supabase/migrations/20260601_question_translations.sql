-- Migration: i18n for questions.
-- Moves the localized prompt + scale labels out of `questions.prompt` (a single
-- Czech string with inline "(1 = …, 5 = …)" labels) into a per-locale table.
-- Run this in the Supabase SQL editor after the initial schema/seed.

create table if not exists public.question_translations (
  id uuid primary key default gen_random_uuid(),
  question_id bigint not null references public.questions(id) on delete cascade,
  locale text not null,
  prompt text not null,
  scale_low text,
  scale_high text,
  created_at timestamptz not null default now(),
  unique (question_id, locale)
);

create index if not exists idx_qt_question_locale
  on public.question_translations (question_id, locale);

-- One-time backfill of the existing Czech content. For frequency questions we
-- parse the trailing "(1 = low, 5 = high)" into dedicated columns and strip it
-- from the prompt, so the UI no longer needs to regex-parse at runtime.
insert into public.question_translations (question_id, locale, prompt, scale_low, scale_high)
select
  q.id,
  'cs',
  case
    when q.kind = 'frequency_1_5' and m.m is not null
      then btrim(regexp_replace(q.prompt, '\s*\(1\s*=\s*.+?,\s*5\s*=\s*.+?\)\s*$', ''))
    else q.prompt
  end,
  case when q.kind = 'frequency_1_5' and m.m is not null then m.m[1] else null end,
  case when q.kind = 'frequency_1_5' and m.m is not null then m.m[2] else null end
from public.questions q
left join lateral (
  select regexp_match(q.prompt, '\(1\s*=\s*(.+?),\s*5\s*=\s*(.+?)\)\s*$') as m
) m on true
on conflict (question_id, locale) do nothing;

-- English (and other locales) are added later simply by INSERTing more rows
-- here — no application code changes required.
