// super-minimal offline cache for shell + icons
const CACHE = 'ev-calc-v1';
const ASSETS = [
  '',                 // your index
  'manifest.webmanifest',
  'icons/ev-152.png',
  'icons/ev-180.png',
  'icons/ev-192.png',
  'icons/ev-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request } = e;
  e.respondWith(
    caches.match(request).then(cached => cached ||
      fetch(request).then(resp => {
        // cache GET requests opportunistically
        if (request.method === 'GET' && resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return resp;
      }).catch(() => caches.match('/'))
    )
  );
});