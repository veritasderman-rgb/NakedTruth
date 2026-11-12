import { getSql, isDbConfigured } from '@/lib/db';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';

// Anonymous usage counters. One row per day, event and language holds a
// number — no visitor id, no IP address, no cookie. Enough to see the funnel,
// nothing that could single anybody out.
export const EVENTS = [
  'home_view',
  'kink_intro_view',
  'kink_start',
  'kink_round1_done',
  'kink_deep_start',
  'kink_saved',
  'kink_saved_invited',
  'kink_result_view',
  'kink_compare_view',
  'invite_copied',
  'report_buy_click',
  'report_paid',
  'report_view',
  'tip_click',
  'tip_paid',
  'quiz_start',
  'quiz_submitted',
  'premium_buy_click',
  'premium_paid',
  'kink_share_click',
  'kink_share_view',
  'pair_buy_click',
  'pair_paid',
  'pair_view',
  'link_saved',
  'links_requested',
  'landing_view',
  'kink_resumed',
] as const;

export type EventName = (typeof EVENTS)[number];

export function isEventName(value: unknown): value is EventName {
  return typeof value === 'string' && (EVENTS as readonly string[]).includes(value);
}

// Never throws: measuring must not break the page it measures.
export async function countEvent(name: EventName, locale: Locale | string | null | undefined): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    await getSql()`
      insert into events (day, name, locale, count)
      values (current_date, ${name}, ${isLocale(locale) ? locale : DEFAULT_LOCALE}, 1)
      on conflict (day, name, locale) do update set count = events.count + 1`;
  } catch (e) {
    console.error('[events] failed to count', name, e);
  }
}
