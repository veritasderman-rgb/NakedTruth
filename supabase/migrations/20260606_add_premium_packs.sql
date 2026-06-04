-- Migration: premium thematic packs + monetization.
--
-- Premium model (per product decision): base + tier_2 stay free; a one-time
-- 29 Kč purchase grants a 'premium' entitlement that unlocks premium thematic
-- packs. Premium questions are marked with a non-null `pack`.
--
-- This migration:
--   1. adds questions.pack and sessions.pack
--   2. seeds the first premium pack ("Fantazie bez filtrů")
--   3. updates create_next_session so premium pack questions never leak into
--      free tier_1/tier_2 sessions (adds `pack is null` to the free pools)
--   4. adds create_pack_session: builds a session from a pack, gated on the
--      'premium' entitlement (defense in depth; the app also checks first).
--
-- Idempotent where practical; safe to re-apply.

alter table public.questions add column if not exists pack text;
alter table public.sessions add column if not exists pack text;

create index if not exists idx_questions_pack on public.questions (pack) where pack is not null;

-- ===== Seed: first premium pack =====
insert into public.questions (tier, kind, prompt, theme, intensity, is_calibration, is_active, pack)
select v.tier::question_tier, v.kind::question_kind, v.prompt, v.theme, v.intensity, false, true, 'fantazie_bez_filtru'
from (values
  ('tier_2','short_answer','Jaká tvoje fantazie ti přijde tak divoká, že ses ji zatím bál/a vyslovit nahlas?','fantasy',3),
  ('tier_2','yes_no','Vzrušuje tě představa, že bychom to spolu zkusili na nějakém riskantním místě, kde nás málem někdo přistihne?','fantasy',3),
  ('tier_2','frequency_1_5','Jak často sníš o něčem, co jsme spolu ještě nikdy nezkusili? (1 = skoro nikdy, 5 = skoro pořád)','fantasy',2),
  ('tier_2','yes_no','Lákalo by tě zahrát si na někoho úplně jiného — převzít roli, která ti normálně není vlastní?','fantasy',2),
  ('tier_2','short_answer','Kdyby sis mohl/a splnit jednu erotickou fantazii bez jakýchkoli následků, co by to bylo?','fantasy',3),
  ('tier_2','yes_no','Přitahuje tě představa, že bys mě (nebo sebe) nechal/a svázat?','bdsm',3),
  ('tier_2','frequency_1_5','Jak moc tě vzrušuje pomyšlení na to být při tom sledován/a? (1 = vůbec, 5 = hodně)','fantasy',2),
  ('tier_2','yes_no','Chtěl/a bys někdy zkusit hračku nebo pomůcku, o které ses zatím bál/a říct nahlas?','explicit',2),
  ('tier_2','short_answer','Co je ta jedna věc, kterou bys ode mě v posteli chtěl/a slyšet nebo zažít mnohem častěji?','explicit',2),
  ('tier_2','yes_no','Fantazíruješ někdy o tom, že bys převzal/a úplnou kontrolu nad tím, co se děje?','bdsm',3)
) as v(tier, kind, prompt, theme, intensity)
where not exists (
  select 1 from public.questions q where q.pack = 'fantazie_bez_filtru' and q.prompt = v.prompt
);

-- ===== Update create_next_session: keep premium packs out of free pools =====
create or replace function public.create_next_session(
  p_couple_id uuid,
  p_created_by_user_id uuid,
  p_partner_a_user_id uuid,
  p_question_count integer default 10,
  p_tier2_mix_count integer default 10,
  p_tier_pref tier_preference default 'vanilla'::tier_preference,
  p_user_id uuid default null::uuid,
  p_max_intensity integer default 3,
  p_themes text[] default null::text[]
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
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
  from public.sessions s
  where s.couple_id = p_couple_id;

  insert into public.sessions (
    couple_id, created_by_user_id, session_number,
    partner_a_user_id, status, question_count, tier_pref,
    max_intensity, themes
  )
  values (
    p_couple_id, p_created_by_user_id, v_session_number,
    p_partner_a_user_id, 'pending_partner', p_question_count, p_tier_pref,
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

  if v_has_tier2 then
    insert into public.session_questions (session_id, question_id, question_order)
    select
      v_session_id, c.id,
      row_number() over (order by array_position(array['explicit','bdsm','fantasy','compat'], c.theme))
    from public.questions c
    where c.is_calibration = true
      and (p_themes is null or c.theme = any(p_themes));
    select count(*) into v_cal_count from public.session_questions where session_id = v_session_id;
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
    where q.is_active = true and q.tier = 'tier_1' and q.is_calibration = false and q.pack is null
      and not exists (select 1 from used_questions uq where uq.question_id = q.id)
    order by random() limit v_tier1_count
  ),
  tier2_pick as (
    select q.id as question_id
    from public.questions q
    where q.is_active = true and q.tier = 'tier_2' and q.is_calibration = false and q.pack is null
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
  insert into public.session_questions (session_id, question_id, question_order)
  select v_session_id, o.question_id, o.question_order
  from ordered o;

  return v_session_id;
end;
$function$;

-- ===== New: build a session from a premium pack (entitlement-gated) =====
create or replace function public.create_pack_session(
  p_couple_id uuid,
  p_created_by_user_id uuid,
  p_partner_a_user_id uuid,
  p_question_count integer default 20,
  p_pack text default null,
  p_user_id uuid default null::uuid
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_session_id uuid;
  v_session_number int;
begin
  if p_pack is null then
    raise exception 'p_pack is required';
  end if;
  if p_question_count <= 0 then
    raise exception 'p_question_count must be > 0';
  end if;
  -- Premium gate. The app checks the entitlement before calling this; this is
  -- defense in depth so the RPC can never hand out premium content for free.
  if p_user_id is null or not public.has_entitlement(p_user_id, 'premium') then
    raise exception 'PAYWALL_PREMIUM';
  end if;

  select coalesce(max(s.session_number), 0) + 1 into v_session_number
  from public.sessions s
  where s.couple_id = p_couple_id;

  insert into public.sessions (
    couple_id, created_by_user_id, session_number,
    partner_a_user_id, status, question_count, tier_pref, pack
  )
  values (
    p_couple_id, p_created_by_user_id, v_session_number,
    p_partner_a_user_id, 'pending_partner', p_question_count, 'spicy', p_pack
  )
  returning id into v_session_id;

  with used_questions as (
    select distinct sq.question_id
    from public.session_questions sq
    join public.sessions s on s.id = sq.session_id
    where s.couple_id = p_couple_id
  ),
  pick as (
    select q.id as question_id
    from public.questions q
    where q.is_active = true and q.pack = p_pack and q.is_calibration = false
      and not exists (select 1 from used_questions uq where uq.question_id = q.id)
    order by random() limit p_question_count
  ),
  ordered as (
    select question_id, row_number() over (order by random()) as question_order
    from pick
  )
  insert into public.session_questions (session_id, question_id, question_order)
  select v_session_id, o.question_id, o.question_order
  from ordered o;

  return v_session_id;
end;
$function$;
