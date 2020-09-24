/* eslint-disable no-restricted-globals */
// 1 Cache only, todo se va a servir desde el cache y no saldra nada a la web.
self.addEventListener("install", (e) => {
  const cacheprom = caches.open("cache-1").then((cache) => {
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
  e.respondWith(caches.match(e.request));
});
