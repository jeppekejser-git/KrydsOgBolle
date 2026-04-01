/**
 * Service Worker — Påske Kryds & Bolle
 * Relative stier så den virker på både localhost og GitHub Pages undermappe.
 * Strategi: netværk først, cache som fallback (offline-support).
 */

const CACHE = 'paske-kryds-bolle-v4';

const ASSETS = [
  './',
  './index.html',
  './css/base.css',
  './css/screens.css',
  './css/board.css',
  './js/game.js',
  './js/app.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// Install: cache alle filer med cache-bypass så vi altid får de nyeste
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(
        ASSETS.map(url =>
          fetch(new Request(url, { cache: 'reload' }))
            .then(res => cache.put(url, res))
            .catch(() => {}) // ignorér fejl på enkeltfiler
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// Activate: ryd gamle caches og tag kontrol med det samme
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: netværk først → opdatér cache → ved fejl brug cache (offline)
self.addEventListener('fetch', event => {
  // Kun GET-requests og same-origin
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
