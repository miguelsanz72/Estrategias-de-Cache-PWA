/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

const CACHE_NAME = "cache.1";
// 2 Cache with network fallback, intenta leer enl cache, si no funciona busca en la red
self.addEventListener("install", (e) => {
  const cacheprom = caches.open(CACHE_NAME).then((cache) => {
    return cache.addAll([
      "/",
      "/index.html",
      "/css/style.css",
      "/img/main.jpg",
      "/js/app.js",
      "/img/no-img.jpg",
      "/pages/offline.html",
    ]);
  });

  e.waitUntil(cacheprom);
});

self.addEventListener("fetch", (e) => {
  const response = caches.match(e.request).then((resp) => {
    if (resp) return resp;

    // No existe el archivo
    // tengo que ir a la web

    console.log("no existe", e.request.url);

    return fetch(e.request).then((newResp) => {
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(e.request, newResp);
      });

      return newResp.clone();
    });
  });

  e.respondWith(response);
});
