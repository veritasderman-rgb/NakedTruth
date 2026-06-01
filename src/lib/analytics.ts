'use client';

import posthog from 'posthog-js';

// Funnel event names — single source of truth so we never typo an event.
export type AnalyticsEvent =
  | 'landing_view'
  | 'config_selected'
  | 'round_started'
  | 'question_answered'
  | 'round_completed'
  | 'invite_sent'
  | 'partner_completed'
  | 'reveal_viewed'
  | 'share_clicked'
  | 'paywall_viewed'
  | 'checkout_started'
  | 'purchase_completed';

const CONSENT_KEY = 'nt_analytics_consent';

let initialized = false;

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(CONSENT_KEY) === 'granted';
}

export function setAnalyticsConsent(granted: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  if (granted) initAnalytics();
  else if (initialized) posthog.opt_out_capturing();
}

export function hasConsentChoice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(CONSENT_KEY) !== null;
}

export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || !hasAnalyticsConsent()) return;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    autocapture: false,
  });
  initialized = true;
}

// Never pass PII (e.g. answer text) in properties.
export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!initialized || !hasAnalyticsConsent()) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!initialized || !hasAnalyticsConsent()) return;
  posthog.identify(userId, properties);
}
