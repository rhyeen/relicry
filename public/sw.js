// @TODO: This needs to be bumped every release. Find a better strategy later.
const VERSION = 'v1';
const CARD_CACHE = `relicry-cards-${VERSION}`;
const ASSET_CACHE = `relicry-assets-${VERSION}`;
const NEXT_IMAGE_CACHE = `relicry-next-image-${VERSION}`;
const REMOTE_IMAGE_CACHE = `relicry-remote-images-${VERSION}`;

/**
 * @deprecated We are not certain we want to do this yet as there are
 * many downsides to caching entire card pages in the service worker.
 * For example, the user won't be able to collect the card. Also, if
 * they didn't visit the page while online, it won't be cached.
 * 
 * The images are by far the most important to cache for offline use.
 * This other data is tiny by comparison.
 */
function isCardRoutePath(pathname) {
  return false;
  // if (pathname.startsWith('/c/')) {
  //   return /^\/c\/[^/]+\/[^/]+\/?$/.test(pathname);
  // }
  // return false;
}

function isNextStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/');
}

function isNextImage(url) {
  return url.pathname.startsWith('/_next/image');
}

function isFlightRequest(req) {
  const accept = req.headers.get('accept') || '';
  return accept.includes('text/x-component');
}

/**
 * Firebase Storage patterns (common):
 * https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<object>?alt=media&token=...
 * https://storage.googleapis.com/<bucket>/<object>  (less common for Firebase but possible)
 * 
 * @NOTE: Offline caching only works if the exact URL is requested again.
 * If we're using getDownloadURL() links with ?token=..., that token is usually
 * stable, but if we rotate tokens, the URL changes and it’ll look like a “new”
 * image to the cache.
 */
function isFirebaseStorageImage(url, req) {
  if (req.destination !== 'image') return false;

  const host = url.hostname;
  if (host === 'firebasestorage.googleapis.com') return true;
  if (host === 'storage.googleapis.com') return true;

  // If you serve via custom domain/CDN, add it here:
  // if (host === 'cdn.relicry.com') return true;

  return false;
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();

    const keep = new Set([CARD_CACHE, ASSET_CACHE, NEXT_IMAGE_CACHE, REMOTE_IMAGE_CACHE]);
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith('relicry-') && !keep.has(k))
        .map((k) => caches.delete(k))
    );
  })());
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);

  const cached = await cache.match(req);
  if (cached) return cached;

  const res = await fetch(req);

  // Cache OK responses, and also cache opaque image responses (common for cross-origin <img>)
  if (res && (res.ok || res.type === 'opaque')) {
    cache.put(req, res.clone());
  }

  return res;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Cross-origin Firebase Storage images: cache-first for offline
  // (Do this BEFORE same-origin checks.)
  if (isFirebaseStorageImage(url, req)) {
    event.respondWith(cacheFirst(req, REMOTE_IMAGE_CACHE));
    return;
  }

  // From here down, only same-origin.
  if (url.origin !== self.location.origin) return;

  // Card navigations + card RSC/Flight payloads: cache-first
  if (isCardRoutePath(url.pathname) && (req.mode === 'navigate' || isFlightRequest(req))) {
    event.respondWith(cacheFirst(req, CARD_CACHE));
    return;
  }

  // Next static build assets (hashed): cache-first
  if (isNextStaticAsset(url)) {
    event.respondWith(cacheFirst(req, ASSET_CACHE));
    return;
  }

  // Next Image optimizer responses: cache-first (optional but helpful)
  if (isNextImage(url)) {
    event.respondWith(cacheFirst(req, NEXT_IMAGE_CACHE));
    return;
  }
});
