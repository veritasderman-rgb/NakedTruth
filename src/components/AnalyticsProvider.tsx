'use client';

import { useEffect } from 'react';
import { initAnalytics, hasAnalyticsConsent } from '@/lib/analytics';
import { ConsentBanner } from './ConsentBanner';

// Initializes analytics once consent is present, and renders the consent
// banner. Safe to mount unconditionally — it is a no-op without a PostHog key
// or without granted consent.
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (hasAnalyticsConsent()) initAnalytics();
  }, []);

  return (
    <>
      {children}
      <ConsentBanner />
    </>
  );
}
