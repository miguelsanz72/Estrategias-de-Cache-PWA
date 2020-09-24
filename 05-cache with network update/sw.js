/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

const CACHE_STATIC_NAME = "static-v1";
const CACHE_DINAMIC_NAME = "dinamic-v1";
const CACHE_INMUTABLE_NAME = "inmutable-v1";
const CACHE_DINAMIC_LIMIT = 100;

// 4 Cache with network update.
// Cuando el rendimiento es critico,
// las actualizaciones siempre estaran una version atras de la version actual de la aplicacion web

async function cleanCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  cache.keys().then((keys) => {
    if (keys.length > maxItems) {
      cache.delete(keys[0]).then(cleanCache(cacheName, maxItems));
    }
  });
}
// prettier-ignore
self.addEventListener('install', (e) => {
    const cacheprom = caches
        .open(CACHE_STATIC_NAME)
        .then((cache) => cache.addAll([
          '/',
          '/index.html',
          '/css/style.css',
          '/img/main.jpg',
          '/js/app.js',
          '/img/no-img.jpg',
          '/pages/offline.html'
        ]));

        const cacheInmutable = caches.open( CACHE_INMUTABLE_NAME )
        .then( cache => cache.add('https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'));

    e.waitUntil(Promise.all([cacheprom, cacheInmutable]));
});

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("fonts.googleapis")) {
    return e.respondWith(caches.match(e.request));
  }

  const response = caches.open(CACHE_STATIC_NAME).then((cache) => {
    fetch(e.request).then((newresp) => cache.put(e.request, newresp));
    return cache.match(e.request);
  });

  e.respondWith(response);
});
