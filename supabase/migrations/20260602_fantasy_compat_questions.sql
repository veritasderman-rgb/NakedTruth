-- Migration: expand the tier_2 "fantasy" and "compat" themes with quality
-- Czech questions so every spice theme has a solid pool. Consensual, couple
-- context, 18+. Run after the bdsm questions migration. Idempotent (guards on prompt).

-- ============ FANTASY & ROLEPLAY ============
insert into public.questions (tier, kind, prompt, theme, intensity, is_calibration, is_active)
select 'tier_2'::question_tier, v.kind::question_kind, v.prompt, 'fantasy', v.intensity, false, true
from (values
  ('frequency_1_5', 'Jak moc tě vzrušuje sdílet se mnou své tajné fantazie? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě láká sehrát roli někoho jiného — třeba dvou cizinců, co se právě potkali? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě přitahuje představa sexu na neobvyklém místě? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě vzrušuje sexting nebo odvážné zprávy přes den? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě láká dívat se spolu na porno nebo erotiku? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě přitahuje hra na svádění, jako bychom se právě poznali? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě láká převlek nebo kostým do ložnice? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě vzrušuje vyprávět mi fantazii nahlas přímo během sexu? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě láká scénář s jasnými rolemi — třeba šéf a podřízený? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě baví hra, kdy jeden druhého celý večer jen škádlí a oddaluje? (1 = vůbec, 5 = hodně)', 2),
  ('frequency_1_5', 'Jak moc tě vzrušuje představa, že nás při tom někdo skoro přistihne? (1 = vůbec, 5 = hodně)', 3),
  ('frequency_1_5', 'Jak moc tě láká fantazie o třetí osobě, i kdyby zůstala jen fantazií? (1 = vůbec, 5 = hodně)', 3),
  ('frequency_1_5', 'Jak moc tě přitahuje natáčení nebo focení našich intimních chvil jen pro nás dva? (1 = vůbec, 5 = hodně)', 3),
  ('yes_no', 'Máš nějakou fantazii, kterou jsi mi ještě nikdy neřekl/a?', 2),
  ('yes_no', 'Chtěl/a bys někdy sehrát scénář, kde se potkáme jako úplně cizí lidé?', 2),
  ('yes_no', 'Láká tě vyzkoušet roleplay s převlekem nebo uniformou?', 2),
  ('yes_no', 'Chtěl/a bys spolu zkusit sexting jako předehru přes den?', 2),
  ('yes_no', 'Bavilo by tě vymyslet a sehrát společně celý erotický scénář?', 2),
  ('yes_no', 'Chtěl/a bys se spolu jednou podívat na porno a nechat se inspirovat?', 2),
  ('yes_no', 'Máš fantazii, která tě vzrušuje, ale trochu se za ni stydíš?', 2),
  ('yes_no', 'Vzrušuje tě představa sexu někde, kde by nás mohli vyrušit?', 3),
  ('yes_no', 'Láká tě představa nahrát si vlastní intimní video jen pro nás?', 3),
  ('short_answer', 'Popiš svou nejžhavější fantazii, kterou bys se mnou chtěl/a zažít.', 2),
  ('short_answer', 'Jaký scénář nebo roli bychom spolu měli někdy sehrát?', 2),
  ('short_answer', 'Které místo (kromě postele) tě láká pro příště?', 2),
  ('short_answer', 'Jaká fantazie tě vzrušuje, ale nejsi si jistý/á, jestli ji chceš opravdu uskutečnit?', 2),
  ('short_answer', 'Co bych ti mohl/a pošeptat do ucha, aby ses okamžitě rozpálil/a?', 2),
  ('short_answer', 'Kdyby neexistoval žádný stud ani zábrany, co bys se mnou chtěl/a zkusit?', 2)
) as v(kind, prompt, intensity)
where not exists (select 1 from public.questions q where q.prompt = v.prompt);

-- ============ SOULAD & FREKVENCE ============
insert into public.questions (tier, kind, prompt, theme, intensity, is_calibration, is_active)
select 'tier_2'::question_tier, v.kind::question_kind, v.prompt, 'compat', v.intensity, false, true
from (values
  ('frequency_1_5', 'Jak spokojený/á jsi aktuálně s tím, jak často se milujeme? (1 = vůbec, 5 = naprosto)', 1),
  ('frequency_1_5', 'Jak často bys ideálně chtěl/a sex? (1 = občas za měsíc, 5 = skoro každý den)', 1),
  ('frequency_1_5', 'Jak moc je pro tebe důležitá předehra? (1 = klidně bych ji přeskočil/a, 5 = je pro mě klíčová)', 1),
  ('frequency_1_5', 'Jak moc potřebuješ po sexu mazlení a blízkost? (1 = vůbec, 5 = hodně)', 1),
  ('frequency_1_5', 'Jak rád/a přebíráš iniciativu a první naznačíš, že máš chuť? (1 = skoro nikdy, 5 = velmi rád/a)', 1),
  ('frequency_1_5', 'Jak ti vyhovuje spontánní sex oproti domluvenému? (1 = radši plánovaný, 5 = jen spontánní)', 1),
  ('frequency_1_5', 'Jak důležitý je pro tebe sex k tomu, aby ses cítil/a milovaný/á? (1 = vůbec, 5 = zásadní)', 1),
  ('frequency_1_5', 'Jak otevřeně spolu podle tebe mluvíme o sexu? (1 = vůbec, 5 = úplně otevřeně)', 1),
  ('frequency_1_5', 'Jak moc tě baví rychlovky oproti dlouhému milování? (1 = jen pomalu a dlouze, 5 = miluju rychlovky)', 1),
  ('frequency_1_5', 'Jak spokojený/á jsi s tím, kdo z nás častěji iniciuje? (1 = vůbec, 5 = naprosto)', 1),
  ('frequency_1_5', 'Jak moc spolu ladíme v tom, co nás vzrušuje? (1 = vůbec, 5 = naprosto)', 2),
  ('frequency_1_5', 'Jak moc se ti splnily sexuální představy, které jsi měl/a na začátku vztahu? (1 = vůbec, 5 = úplně)', 2),
  ('yes_no', 'Přál/a by sis, abychom se milovali častěji?', 1),
  ('yes_no', 'Cítíš se v poslední době dostatečně žádaný/á?', 1),
  ('yes_no', 'Naznačil/a bys mi snáz chuť, kdybys věděl/a, že tě neodmítnu?', 1),
  ('yes_no', 'Předstíral/a jsi někdy orgasmus, abys mě nezklamal/a?', 2),
  ('yes_no', 'Máš pocit, že známe svoje těla a víme, co druhému dělá dobře?', 1),
  ('yes_no', 'Chyběl by ti sex, kdybychom spolu měsíc nespali?', 1),
  ('yes_no', 'Řekl/a bys mi otevřeně, kdyby tě v posteli něco dlouhodobě netěšilo?', 1),
  ('yes_no', 'Pomáhá ti usmiřovací sex po hádce?', 1),
  ('yes_no', 'Cítíš se po sexu se mnou blízko a propojený/á?', 1),
  ('yes_no', 'Přál/a by sis, abych ti dával/a víc najevo, jak moc tě chci?', 1),
  ('short_answer', 'Co bych mohl/a dělat, aby ses cítil/a víc žádaný/á?', 1),
  ('short_answer', 'Co ti v naší posteli aktuálně chybí nebo by sis přál/a víc?', 1),
  ('short_answer', 'Kdy a jak se ti nejlíp naznačuje, že máš chuť?', 1),
  ('short_answer', 'Co tě v posteli rozpálí pokaždé — a vím to o tobě vůbec?', 1),
  ('short_answer', 'Je něco, co spolu děláme, a ty bys to radši dělal/a jinak?', 1),
  ('short_answer', 'Jaký byl náš nejlepší společný zážitek v posteli a čím to bylo?', 1),
  ('short_answer', 'Kdybys mohl/a změnit jednu věc na našem sexuálním životě, co by to bylo?', 1)
) as v(kind, prompt, intensity)
where not exists (select 1 from public.questions q where q.prompt = v.prompt);

-- ============ Czech translations (+ parsed scales) for new fantasy/compat rows ============
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
where q.theme in ('fantasy', 'compat') and q.is_calibration = false
  and not exists (
    select 1 from public.question_translations t
    where t.question_id = q.id and t.locale = 'cs'
  );
