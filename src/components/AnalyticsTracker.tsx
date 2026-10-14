'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef('');

  useEffect(() => {
    if (!pathname || lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    const querySource = new URLSearchParams(window.location.search).get('utm_source');
    const source = querySource?.trim().slice(0, 60) || 'Trực tiếp';
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view', target: pathname, source }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
