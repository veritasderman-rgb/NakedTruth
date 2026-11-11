import type { EventName } from '@/lib/events';

// Client-side: report one anonymous event. Fire-and-forget.
export function track(name: EventName): void {
  if (typeof window === 'undefined') return;
  try {
    const body = JSON.stringify({ name, locale: document.documentElement.lang });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/e', new Blob([body], { type: 'application/json' }));
    else fetch('/api/e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch {
    // measuring must never break the page
  }
}
