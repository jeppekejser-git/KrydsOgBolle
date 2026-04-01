/**
 * Service Worker — Påske Kryds & Bolle
 * Cacher alle app-filer ved installation så spillet virker offline.
 */

const CACHE = 'paske-kryds-bolle-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/screens.css',
  '/css/board.css',
  '/js/game.js',
  '/js/app.js',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install: cache alle filer
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: ryd gamle caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: svar fra cache, fald tilbage til netværk
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
