-- Migration: extend create_next_session with intensity/theme filtering and a
-- calibration ("naladění") prelude for spicy/mixed rounds. Run after
-- 20260602_intensity_themes.sql.

-- Remember the chosen spice config so "Další kolo" can inherit it.
alter table public.sessions
  add column if not exists max_intensity smallint,
  add column if not exists themes text[];

-- Drop the previous 7-arg overload (keep a single, paywalled definition).
drop function if exists public.create_next_session(
  uuid, uuid, uuid, integer, integer, public.tier_preference, uuid);

create or replace function public.create_next_session(
  p_couple_id uuid,
  p_created_by_user_id uuid,
  p_partner_a_user_id uuid,
  p_question_count int default 10,
  p_tier2_mix_count int default 10,
  p_tier_pref tier_preference default 'vanilla',
  p_user_id uuid default null,
  p_max_intensity int default 3,
  p_themes text[] default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
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

  -- Paywall: any tier_2 content requires an entitlement.
  if v_has_tier2 then
    if p_user_id is null or not public.has_entitlement(p_user_id, 'tier_2') then
      raise exception 'PAYWALL';
    end if;
  end if;

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

  -- Calibration prelude (spicy/mixed): one question per selected theme, first.
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

  -- Content picks, ordered after the calibration prelude.
  with used_questions as (
    select distinct sq.question_id
    from public.session_questions sq
    join public.sessions s on s.id = sq.session_id
    where s.couple_id = p_couple_id
  ),
  tier1_pick as (
    select q.id as question_id
    from public.questions q
    where q.is_active = true and q.tier = 'tier_1' and q.is_calibration = false
      and not exists (select 1 from used_questions uq where uq.question_id = q.id)
    order by random() limit v_tier1_count
  ),
  tier2_pick as (
    select q.id as question_id
    from public.questions q
    where q.is_active = true and q.tier = 'tier_2' and q.is_calibration = false
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
$$;

revoke execute on function
  public.create_next_session(uuid, uuid, uuid, integer, integer, public.tier_preference, uuid, integer, text[])
  from public, anon, authenticated;
grant execute on function
  public.create_next_session(uuid, uuid, uuid, integer, integer, public.tier_preference, uuid, integer, text[])
  to service_role;
