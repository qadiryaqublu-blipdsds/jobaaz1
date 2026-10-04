// Jobia PWA Service Worker
const CACHE_NAME = 'jobia-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/jobia-logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Soft fail if any asset is not yet available in dev
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip non-http(s)
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Skip Firestore API / backend WebSocket / Vite HMR requests
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('firestore') ||
    url.pathname.includes('/@vite/')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for HTML documents
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
