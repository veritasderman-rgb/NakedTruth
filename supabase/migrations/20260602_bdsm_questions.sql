-- Migration: expand the tier_2 "bdsm" theme with quality Czech questions that
-- enrich the sexual-compatibility experience (dominance/submission, bondage,
-- sensation/impact play, role play, plus consent & boundaries — which are part
-- of compatibility, not an afterthought). Consensual, couple-context, 18+.
-- Run after the intensity/themes migrations. Idempotent (guards on prompt).

insert into public.questions (tier, kind, prompt, theme, intensity, is_calibration, is_active)
select 'tier_2'::question_tier, v.kind::question_kind, v.prompt, 'bdsm', v.intensity, false, true
from (values
  -- ===== frequency_1_5 (how much it attracts you) =====
  ('frequency_1_5', 'Jak moc tě přitahuje představa, že ve vašich hrátkách jasně velíš ty? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě láká odevzdat partnerovi kontrolu a prostě poslouchat? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě vzrušuje, když máš (nebo má partner) svázané ruce? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě láká hra se zavázanýma očima? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě přitahuje plácání nebo lehký výprask při sexu? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě vzrušuje sprostá mluva v posteli? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě přitahuje tahání za vlasy nebo kousání? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě láká oddalování orgasmu a hra na hranici (edging)? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak důležité je pro tebe mít předem domluvené stop-slovo a jasné hranice? (1 = vůbec to neřeším, 5 = naprosto zásadní)', 2),
  ('frequency_1_5', 'Jak moc tě láká chvála a slovní odměna od partnera při sexu? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě přitahuje hra s mírnou bolestí? (1 = vůbec ne, 5 = hodně mě to láká)', 3),
  ('frequency_1_5', 'Jak moc tě vzrušuje představa pout, lan nebo bondage? (1 = vůbec, 5 = hodně)', 3),
  ('frequency_1_5', 'Jak moc tě láká dominance s ponižováním nebo tvrdšími slovy? (1 = vůbec, 5 = hodně)', 3),
  ('frequency_1_5', 'Jak moc tě přitahuje hra s rukou na krku — opatrně a s důvěrou? (1 = vůbec, 5 = hodně)', 3),
  ('frequency_1_5', 'Jak moc tě láká mocenská dynamika typu „pán a mazlíček"? (1 = vůbec, 5 = hodně)', 3),
  -- ===== yes_no (would you try / does it turn you on) =====
  ('yes_no', 'Chtěl/a bys vyzkoušet, jaké to je být svázaný/á?', 2),
  ('yes_no', 'Chtěl/a bys někdy vyzkoušet roli toho dominantního?', 2),
  ('yes_no', 'Láká tě vyzkoušet pomůcky jako pouta, šátek přes oči nebo vibrátor?', 2),
  ('yes_no', 'Chtěl/a bys, abychom si předem domluvili stop-slovo?', 2),
  ('yes_no', 'Vzrušuje tě představa, že ti partner dává rozkazy, které plníš?', 2),
  ('yes_no', 'Chtěl/a bys vyzkoušet lehký výprask — rukou nebo pomůckou?', 2),
  ('yes_no', 'Láká tě sehrát scénář s převlekem a rolemi?', 2),
  ('yes_no', 'Zajímá tě vyzkoušet hru s teplotou — led nebo horký vosk na kůži?', 3),
  ('yes_no', 'Láká tě představa, že tě někdo při sexu sleduje (nebo že sleduješ ty)?', 3),
  ('yes_no', 'Byl/a bys ochotný/á vyzkoušet tvrdší impact play (flogger, plácačka)?', 3),
  ('yes_no', 'Láká tě dynamika, kde jeden z nás na čas druhému „patří"?', 3),
  -- ===== short_answer (open desires & boundaries) =====
  ('short_answer', 'Jaká kink nebo BDSM praktika tě tajně láká, ale ještě jsme ji spolu nezkusili?', 2),
  ('short_answer', 'Kde je tvoje pevná hranice — co bys nikdy nechtěl/a zkoušet?', 2),
  ('short_answer', 'Kdybys mi mohl/a dát jeden „rozkaz" do postele, jaký by byl?', 2),
  ('short_answer', 'Která role ti sedí víc a proč — vést, odevzdat se, nebo střídat?', 2)
) as v(kind, prompt, intensity)
where not exists (select 1 from public.questions q where q.prompt = v.prompt);

-- Czech translations (+ parsed scale labels for frequency questions) for any
-- newly added bdsm rows that don't have a 'cs' translation yet.
insert into public.question_translations (question_id, locale, prompt, scale_low, scale_high)
select
  q.id, 'cs',
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
where q.theme = 'bdsm' and q.is_calibration = false
  and not exists (
    select 1 from public.question_translations t
    where t.question_id = q.id and t.locale = 'cs'
  );
