/* eslint-disable consistent-return */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

const CACHE_STATIC_NAME = "static-v2";
const CACHE_DINAMIC_NAME = "dinamic-v2";
const CACHE_INMUTABLE_NAME = "inmutable-v2";

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
            'https://www.lfewines.com/testing-site/',
            'https://www.lfewines.com/about/',
            'https://www.lfewines.com/project/copia-dona-bernarda/',
            'https://www.lfewines.com/vineyards/',
            'https://www.lfewines.com/beyond-the-bottle/',
            'https://www.lfewines.com/portfolio/',
            'https://www.lfewines.com/news/',
            'https://www.lfewines.com/reach-us/'
        ]));

        const cacheInmutable = caches.open( CACHE_INMUTABLE_NAME )
        .then((cache) => cache.addAll([
            'https://www.lfewines.com/wp-includes/css/dashicons.min.css?ver=5.6',
        ]));

    e.waitUntil(Promise.all([cacheprom, cacheInmutable]));
});

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("wp-admin")) return;

  const response = caches
    .match(e.request)
    .then((resp) => {
      // En cada recarga va a la web y actualiza el STATIC CACHE
      caches.open(CACHE_STATIC_NAME).then((cache) => {
        fetch(e.request).then((newresp) => cache.put(e.request, newresp));
        cleanCache(CACHE_STATIC_NAME, 500);
      });

      // No existe el archivo
      // Va a la Web

      if (resp) return resp;

      return fetch(e.request).then((newResp) => {
        caches.open(CACHE_DINAMIC_NAME).then((cache) => {
          cache.put(e.request, newResp);
          cleanCache(CACHE_DINAMIC_NAME, 500);
        });

        return newResp.clone();
      });
    })
    .catch(() => {
      if (e.request.headers.get("accept").includes("text/html")) {
        return caches.match("/pages/offline.html");
      }
    });

  e.respondWith(response);
});

// cunado se activa el Sw

self.addEventListener("activate", (e) => {
  console.log("SW Activado!!");
  // Borramos los static cache viejos o que no se estan usando
  const respuesta = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== CACHE_STATIC_NAME && key.includes("static")) {
        return caches.delete(key);
      }
    });
    keys.forEach((key) => {
      if (key !== CACHE_DINAMIC_NAME && key.includes("dinamic")) {
        return caches.delete(key);
      }
    });
    keys.forEach((key) => {
      if (key !== CACHE_INMUTABLE_NAME && key.includes("inmutable")) {
        return caches.delete(key);
      }
    });
  });

  e.waitUntil(respuesta);
});
