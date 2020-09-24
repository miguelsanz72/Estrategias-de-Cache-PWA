/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

const CACHE_STATIC_NAME = "static-v1";
const CACHE_DINAMIC_NAME = "dinamic-v1";
const CACHE_INMUTABLE_NAME = "inmutable-v1";

// 2 Cache with network fallback, intenta leer enl cache, si no funciona busca en la red con limite de cache dinamico

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
  const response = caches.match(e.request).then((resp) => {
    if (resp) return resp;

    // No existe el archivo
    // tengo que ir a la web

    console.log("no existe", e.request.url);

    return fetch(e.request).then((newResp) => {
      caches.open(CACHE_DINAMIC_NAME).then((cache) => {
        cache.put(e.request, newResp);
        cleanCache(CACHE_DINAMIC_NAME, 100);
      });

      return newResp.clone();
    });
  });

  e.respondWith(response);
});
