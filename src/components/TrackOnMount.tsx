'use client';

import { useEffect } from 'react';
import { track, type AnalyticsEvent } from '@/lib/analytics';

// Fires a single analytics event when mounted. Lets server components emit
// funnel events without becoming client components themselves.
export function TrackOnMount({
  event,
  properties,
}: {
  event: AnalyticsEvent;
  properties?: Record<string, unknown>;
}) {
  useEffect(() => {
    track(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
