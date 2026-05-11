export function track(
  event_type: string,
  profile_id?: string | null,
  metadata?: Record<string, unknown> | null
): void {
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type,
      profile_id: profile_id ?? null,
      metadata: metadata ?? null,
    }),
  }).catch(() => {});
}
