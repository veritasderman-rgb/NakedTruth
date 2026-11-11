'use client';

import { useEffect } from 'react';
import type { EventName } from '@/lib/events';
import { track } from '@/lib/track';

// Counts one page view of the page it is placed on.
export default function Track({ name }: { name: EventName }) {
  useEffect(() => {
    track(name);
  }, [name]);
  return null;
}
