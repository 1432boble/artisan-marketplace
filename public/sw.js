// Biso service worker — intentionally cache-free, self-clearing.
//
// This file used to be empty. A returning visitor may still carry an old
// worker and/or Cache Storage from a previous version, which can serve stale
// pages. This worker takes control immediately and deletes every cache, while
// staying installable (a fetch handler is present but passes through to the
// network — nothing is intercepted or cached).

self.addEventListener('install', () => {
  // Replace any older worker without waiting for all tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Flush anything a previous worker may have cached.
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      // Start controlling open pages right away.
      await self.clients.claim();
    })()
  );
});

// Present so the app stays installable; does not call respondWith, so every
// request goes straight to the network (pure pass-through, no caching).
self.addEventListener('fetch', () => {});
