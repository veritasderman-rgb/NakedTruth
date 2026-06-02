-- Migration: intensity + theme tagging for tier_2, and calibration questions.
-- Enables the "spice configurator" (filter tier_2 by intensity/theme) and the
-- "naladění" calibration round that drives a sexual-compatibility score.
-- Run in the Supabase SQL editor.

-- ========= COLUMNS =========
-- intensity: 1 = náznak, 2 = otevřeně, 3 = bez hranic (tier_1 stays null).
-- theme: 'explicit' | 'bdsm' | 'fantasy' | 'compat' (null = untagged/any).
-- is_calibration: special tier_2 questions asked at the start of a spicy round.
alter table public.questions
  add column if not exists intensity smallint,
  add column if not exists theme text,
  add column if not exists is_calibration boolean not null default false;

create index if not exists idx_questions_tier2_filter
  on public.questions (tier, theme, intensity) where tier = 'tier_2';

-- ========= CALIBRATION QUESTIONS (one per theme) =========
-- Inserted once (idempotent guard). frequency_1_5 so closeness => compatibility.
insert into public.questions (tier, kind, prompt, theme, intensity, is_calibration, is_active)
select v.tier, v.kind, v.prompt, v.theme, v.intensity, true, true
from (values
  ('tier_2'::question_tier, 'frequency_1_5'::question_kind,
   'Jak otevřeně chceš teď s partnerem mluvit o sexu? (1 = jen náznaky, 5 = úplně bez obalu)', 'explicit', 1),
  ('tier_2'::question_tier, 'frequency_1_5'::question_kind,
   'Jak moc tě přitahuje dominance, submise nebo BDSM? (1 = vůbec mě to neláká, 5 = láká mě to hodně)', 'bdsm', 2),
  ('tier_2'::question_tier, 'frequency_1_5'::question_kind,
   'Jak moc chceš sdílet tajné fantazie a zkoušet roleplay? (1 = radši ne, 5 = jdu do toho)', 'fantasy', 2),
  ('tier_2'::question_tier, 'frequency_1_5'::question_kind,
   'Jak zásadní je pro tebe sex ve vašem vztahu? (1 = spíš okrajový, 5 = naprosto klíčový)', 'compat', 1)
) as v(tier, kind, prompt, theme, intensity)
where not exists (select 1 from public.questions where is_calibration = true);

-- Czech translations + parsed scale labels for the calibration questions.
insert into public.question_translations (question_id, locale, prompt, scale_low, scale_high)
select
  q.id, 'cs',
  btrim(regexp_replace(q.prompt, '\s*\(1\s*=\s*.+?,\s*5\s*=\s*.+?\)\s*$', '')),
  m.m[1], m.m[2]
from public.questions q
left join lateral (
  select regexp_match(q.prompt, '\(1\s*=\s*(.+?),\s*5\s*=\s*(.+?)\)\s*$') as m
) m on true
where q.is_calibration = true
on conflict (question_id, locale) do nothing;

-- ========= HEURISTIC FIRST-PASS TAGGING of existing tier_2 questions =========
-- Rough keyword-based tagging so the feature works out of the box. Intended to
-- be refined later (admin/curation). Only touches untagged, non-calibration rows.
update public.questions q set theme =
  case
    when q.prompt ~* '(bdsm|dominan|submis|pouta|spout|výprask|trest|podříz|ovládá|otrok|klec|bič|obojek|poníž)' then 'bdsm'
    when q.prompt ~* '(fantazi|roleplay|převlek|scénář|trojk|převleč|hra na|sen o|tajn(á|é) touh|kostým)' then 'fantasy'
    when q.prompt ~* '(jak často|frekvenc|iniciativ|chuť na sex|libido|spokojen|kolikrát|málo sexu|víc sexu)' then 'compat'
    else 'explicit'
  end
where q.tier = 'tier_2' and q.is_calibration = false and q.theme is null;

update public.questions q set intensity =
  case
    when q.prompt ~* '(bdsm|anál|trojk|fetiš|výprask|poníž|skupin|fisting|orgie|swing|dildo|veřejn)' then 3
    when q.prompt ~* '(orgasm|masturb|porno|prst|orál|pozic|vzrušuj|nahá|nahý|svlék|dotek|erotic)' then 2
    else 1
  end
where q.tier = 'tier_2' and q.is_calibration = false and q.intensity is null;
