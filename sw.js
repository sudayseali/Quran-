const CACHE_NAME = 'quran-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache API requests for offline reading (Stale-while-revalidate strategy)
  if (url.origin.includes('api.quran.com')) {
      event.respondWith(
        caches.open('quran-api-cache').then((cache) => {
          return cache.match(event.request).then((response) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
            return response || fetchPromise;
          });
        })
      );
      return;
  }

  // Cache Fonts and Images
  if (event.request.destination === 'font' || event.request.destination === 'image') {
     event.respondWith(
       caches.open('quran-assets-cache').then((cache) => {
         return cache.match(event.request).then((response) => {
           return response || fetch(event.request).then((networkResponse) => {
             cache.put(event.request, networkResponse.clone());
             return networkResponse;
           });
         });
       })
     );
     return;
  }

  // General fallback for other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});