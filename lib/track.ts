export function track(
  event_type: string,
  profile_id?: string | null,
  metadata?: Record<string, unknown> | null
): void {
  const payload = JSON.stringify({
    event_type,
    profile_id: profile_id ?? null,
    metadata: metadata ?? null,
  });

  // Fire-and-forget; must never delay navigation. sendBeacon survives a
  // same-tab navigation (e.g. tel:); fetch keepalive is the fallback.
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/events', new Blob([payload], { type: 'application/json' }));
      return;
    }
  } catch {
    /* fall through to fetch */
  }

  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
