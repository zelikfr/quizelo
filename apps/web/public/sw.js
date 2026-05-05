/* eslint-disable no-undef, no-restricted-globals */
/**
 * Quizelo service worker.
 *
 * Strategy summary:
 *   - `/_next/static/*` — cache-first. Next.js content-hashes every
 *     filename so a chunk only ever serves the same bytes; cache
 *     forever. Tone.js lives in here (dynamic import → bundled chunk)
 *     so the audio engine survives offline reloads after first
 *     match.
 *   - Navigation requests (HTML) — network-first, fall back to a
 *     cached page if offline. We DON'T pre-cache the routes so the
 *     fallback is the most recent visited route.
 *   - Fonts / images / icons — stale-while-revalidate. Returns the
 *     cached version immediately and refreshes in the background.
 *   - Anything POST/PUT/DELETE, or `/api/*` — pass-through to
 *     network. We never want to serve a stale match payload.
 *
 * Increment `SW_VERSION` whenever we change cache structure or want
 * to force clients to refetch. Old caches are pruned on activate.
 */

const SW_VERSION = "quizelo-v1";
const STATIC_CACHE = `${SW_VERSION}-static`;
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;

// Bare-minimum critical shell. Next.js hashed assets are cached on
// first request — listing them here would instantly go stale on the
// next deploy.
const PRECACHE = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(PRECACHE).catch(() => {});
      // Activate immediately — no need to wait for tabs to close.
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(SW_VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isNextStatic(url) {
  return url.pathname.startsWith("/_next/static/");
}

function isApi(url) {
  return url.pathname.startsWith("/api/");
}

function isNavigation(req) {
  return req.mode === "navigate";
}

function isAssetLike(url) {
  return /\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf|otf|css)$/i.test(
    url.pathname,
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // mutations bypass the SW

  const url = new URL(req.url);
  // Cross-origin (Stripe, Google fonts CDN, etc.) — don't intercept.
  if (url.origin !== self.location.origin) return;
  if (isApi(url)) return;

  if (isNextStatic(url)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  if (isNavigation(req)) {
    event.respondWith(networkFirst(req, RUNTIME_CACHE));
    return;
  }

  if (isAssetLike(url)) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    // Last-ditch — the cache might still have a near-match. Otherwise
    // re-throw so the browser surfaces the offline error.
    const fallback = await cache.match(req);
    if (fallback) return fallback;
    throw err;
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(req);
    if (cached) return cached;
    // If we have nothing — offer the cached root as a generic
    // offline fallback. The app shell can then render its error
    // boundary or a "no connection" view.
    const root = await cache.match("/");
    if (root) return root;
    throw err;
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

// Allow the page to ask the SW to skip waiting (used after we
// detect a new version is available and the user accepts the
// reload).
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
