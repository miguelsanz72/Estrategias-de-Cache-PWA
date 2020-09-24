/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

const CACHE_STATIC_NAME = "static-v1";
const CACHE_DINAMIC_NAME = "dinamic-v1";
const CACHE_INMUTABLE_NAME = "inmutable-v1";
const CACHE_DINAMIC_LIMIT = 100;

//3 network with cache fallback, primero va a internet, intenta obtener el recurso, si lo optiene lo muestra y si no lo busca en el cache y lo muestra desde cache

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
  const response = fetch(e.request)
    .then((resp) => {
      if (!resp) return caches.match(e.request);

      caches.open(CACHE_DINAMIC_NAME).then((cache) => {
        cache.put(e.request, resp);
        cleanCache(CACHE_DINAMIC_NAME, CACHE_DINAMIC_LIMIT);
      });

      return resp.clone();
    })
    .catch(() => caches.match(e.request));

  e.respondWith(response);
});
