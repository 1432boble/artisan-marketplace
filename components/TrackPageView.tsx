'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';

export function TrackPageView({ event }: { event: string }) {
  useEffect(() => {
    track(event);
  }, []);
  return null;
}
