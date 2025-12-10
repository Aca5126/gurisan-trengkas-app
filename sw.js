// sw.js — Service Worker untuk sokongan offline
const CACHE_NAME = 'trengkas-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest'
];

// Install: cache aset teras
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: bersihkan cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Fetch: cuba cache dahulu, jatuh ke rangkaian
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
