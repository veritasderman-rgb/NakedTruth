-- Migration: manual re-tagging of tier_2 questions.
-- The heuristic first pass dumped ~88 questions into 'explicit' that clearly
-- belong to bdsm / fantasy / compat. These ids were reviewed by hand. Also
-- bumps a handful of unambiguously hardcore questions to intensity 3.
-- Run after the question content migrations. Idempotent.

-- → bdsm (power, restraint, pain, control, marking, degradation, sensation)
update public.questions set theme = 'bdsm'
where id in (110,117,130,139,141,143,154,159,162,169,178,189,200,201,205,208,
             218,224,225,237,238,240,246,252,256,259,263,271,277,283,290,299);

-- → fantasy (roleplay, scenarios, threesome/swinging, recording, voyeur/cuckold)
update public.questions set theme = 'fantasy'
where id in (109,114,125,128,131,135,151,164,167,168,191,211,216,219,230,233,
             241,244,251,260,265,275,280);

-- → compat (frequency, satisfaction, initiation, foreplay/aftercare, feedback,
--   communication, emotional connection, relationship values)
update public.questions set theme = 'compat'
where id in (105,107,111,115,123,129,144,145,146,150,152,153,156,158,175,183,
             195,199,202,209,222,226,231,247,250,261,270,272,278,287,289,295,298);

-- Intensity corrections for clearly hardcore items mis-tagged as mild.
update public.questions set intensity = 3
where id in (110,137,143,224,238,240,275,290);
update public.questions set intensity = 2
where id in (117);

-- Fix a garbled prompt spotted during review (id 273) in both the source
-- column and its Czech translation.
update public.questions
set prompt = 'Jakou naprosto konkrétní, sprostou větu bys chtěl/a, abych zařval/a těsně v momentě, kdy vyvrcholím nebo kdy vyvrcholíš ty?'
where id = 273;
update public.question_translations
set prompt = 'Jakou naprosto konkrétní, sprostou větu bys chtěl/a, abych zařval/a těsně v momentě, kdy vyvrcholím nebo kdy vyvrcholíš ty?'
where question_id = 273 and locale = 'cs';
