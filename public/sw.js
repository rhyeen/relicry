// sw.js
//
// Goals:
// - In production: cache Firebase Storage images for offline/spotty networks.
// - In development (localhost): DO NOT cache Next.js dev assets (`/_next/*`) because
//   they are not reliably content-hashed and cache-first will cause stale JS/CSS.
// - Avoid caching full pages / RSC payloads (you already marked that as deprecated).

// @NOTE: Bump this version if you fundementally change the caching strategy.
const VERSION = "v1";

// Only keep the caches that matter for your offline goals.
const REMOTE_IMAGE_CACHE = `relicry-remote-images-${VERSION}`;

// Legacy caches (kept for cleanup so old versions don't pile up)
const LEGACY_PREFIX = "relicry-";

// Detect local dev (service worker scope host)
const DEV =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1" ||
  self.location.hostname === "0.0.0.0";

/**
 * Firebase Storage patterns (common):
 * https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<object>?alt=media&token=...
 * https://storage.googleapis.com/<bucket>/<object>
 *
 * Offline caching only works if the exact URL is requested again.
 * If you rotate download tokens, the URL changes and it’ll look like a “new” image.
 */
function isFirebaseStorageImage(url, req) {
  if (req.destination !== "image") return false;

  const host = url.hostname;
  if (host === "firebasestorage.googleapis.com") return true;
  if (host === "storage.googleapis.com") return true;

  // Add custom CDN domains here if you introduce them:
  // if (host === 'cdn.relicry.com') return true;

  return false;
}

/**
 * In dev, never intercept Next.js dev assets.
 * In prod, you can let the browser/CDN handle Next assets; SW caching them often
 * increases complexity and storage use without much benefit.
 */
function isNextInternal(url) {
  return url.pathname.startsWith("/_next/");
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();

      // Clean up old relicry caches (including caches from previous versions)
      const keep = new Set([REMOTE_IMAGE_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith(LEGACY_PREFIX) && !keep.has(k))
          .map((k) => caches.delete(k))
      );
    })()
  );
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);

  const cached = await cache.match(req);
  if (cached) return cached;

  const res = await fetch(req);

  // Cache OK responses, and also cache opaque image responses (common for cross-origin <img>)
  if (res && (res.ok || res.type === "opaque")) {
    cache.put(req, res.clone());
  }

  return res;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 🚫 DEV SAFETY:
  // Never interfere with Next.js internal assets during local dev. This prevents stale JS/CSS.
  if (DEV && url.origin === self.location.origin && isNextInternal(url)) {
    return;
  }

  // ✅ Cache Firebase Storage images (cross-origin) for offline/spotty networks.
  // Do this BEFORE same-origin checks.
  if (isFirebaseStorageImage(url, req)) {
    event.respondWith(cacheFirst(req, REMOTE_IMAGE_CACHE));
    return;
  }

  // From here down, we currently do nothing for same-origin requests.
  // Intentionally NOT caching:
  // - /_next/static (browser/CDN handles in prod; breaks dev if cache-first)
  // - /_next/image (can balloon cache; also can break dev)
  // - HTML/RSC payloads (you marked as deprecated due to auth/collection interactions)
});
