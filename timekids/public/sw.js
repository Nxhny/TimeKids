// public/sw.js — TimeKids Service Worker v2
// ─────────────────────────────────────────────────────────────────────────────
// Strategy:
//   • Shell assets  → Cache-first (CSS, JS, fonts, images)
//   • API calls     → Network-first, fall back to cached response if offline
//   • HTML pages    → Network-first, fall back to cached version
//   • Offline page  → Shown when navigation fails and no cache exists
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_VER   = 'tk-v3';
const CACHE_SHELL = `${CACHE_VER}-shell`;
const CACHE_PAGES = `${CACHE_VER}-pages`;
const CACHE_API   = `${CACHE_VER}-api`;

const SHELL_ASSETS = [
  '/css/main.css',
  '/css/auth.css',
  '/css/i18n.css',
  '/js/api.js',
  '/js/utils.js',
  '/js/i18n.js',
  '/js/player.js',
  '/assets/logo.png',
  '/manifest.json',
  '/offline',
];

const PAGES = [
  '/', '/login', '/register', '/dashboard',
  '/profile', '/settings', '/children', '/playlists',
];

// ── Install — pre-cache shell ──────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_SHELL)
      .then(c => c.addAll(SHELL_ASSETS))
      .catch(err => console.warn('[SW] Shell pre-cache partial failure:', err))
  );
  self.skipWaiting();
});

// ── Activate — clean old caches ────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('tk-') && !k.startsWith(CACHE_VER))
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch handler ──────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin except YouTube / Supabase
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin &&
      !url.hostname.includes('supabase') &&
      !url.hostname.includes('youtube') &&
      !url.hostname.includes('fonts.g')) return;

  // ── API calls: network-first, cache response briefly ──────────────────
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirstAPI(request));
    return;
  }

  // ── Shell assets: cache-first ─────────────────────────────────────────
  if (isShellAsset(url.pathname)) {
    e.respondWith(cacheFirst(request, CACHE_SHELL));
    return;
  }

  // ── HTML page navigation: network-first, fallback to cache ───────────
  if (request.mode === 'navigate') {
    e.respondWith(navigateFirst(request));
    return;
  }

  // ── Everything else: network with cache fallback ──────────────────────
  e.respondWith(networkWithCacheFallback(request));
});

// ── Strategies ─────────────────────────────────────────────────────────────

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) {
    const cache = await caches.open(cacheName);
    cache.put(req, res.clone());
  }
  return res;
}

async function networkFirstAPI(req) {
  try {
    const res = await fetch(req);
    // Cache successful GET API responses for 30s
    if (res.ok && req.method === 'GET') {
      const cache = await caches.open(CACHE_API);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: 'Offline — cached data unavailable.', offline: true }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function navigateFirst(req) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(CACHE_PAGES);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    // Try cached version of this page
    const cached = await caches.match(req);
    if (cached) return cached;
    // Fall back to offline page
    const offlinePage = await caches.match('/offline');
    return offlinePage || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
  }
}

async function networkWithCacheFallback(req) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(CACHE_SHELL);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    return caches.match(req) || Response.error();
  }
}

function isShellAsset(pathname) {
  return pathname.startsWith('/css/') ||
         pathname.startsWith('/js/') ||
         pathname.startsWith('/assets/') ||
         pathname === '/manifest.json';
}

// ── Background sync for play events (future) ──────────────────────────────
self.addEventListener('sync', e => {
  if (e.tag === 'sync-plays') {
    e.waitUntil(syncQueuedPlays());
  }
});

async function syncQueuedPlays() {
  // Placeholder for future background sync of play events
}
