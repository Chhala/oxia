/**
 * OXIA — sw.js
 * Service Worker : Cache-First pour assets statiques
 * Permet le fonctionnement hors-ligne (PWA iOS)
 */

const CACHE_NAME = 'oxia-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './SL_Pads_110_Cm.mp3',
];

/* ── Install : mise en cache des assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate : nettoyage des anciens caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch : Cache-First, réseau en fallback ── */
self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes non-GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Mettre en cache les nouvelles ressources
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Fallback silencieux si hors ligne et pas en cache
        return new Response('', { status: 408 });
      });
    })
  );
});
