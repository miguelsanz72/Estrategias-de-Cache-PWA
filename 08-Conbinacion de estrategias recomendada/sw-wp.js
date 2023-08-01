const CACHE_STATIC_NAME = "static-v2";
const CACHE_DINAMIC_NAME = "dinamic-v2";
const CACHE_INMUTABLE_NAME = "inmutable-v2";

async function cleanCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await cleanCache(cacheName, maxItems);
  }
}

self.addEventListener('install', (e) => {
  const cacheStatic = caches.open(CACHE_STATIC_NAME).then(cache => cache.addAll(['./']));
  const cacheInmutable = caches.open(CACHE_INMUTABLE_NAME).then(cache => cache.addAll(['/wp-includes/css/dashicons.min.css?ver=5.6']));
  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("wp-admin") || e.request.method === 'POST') return;

  e.respondWith(
    caches.match(e.request)
      .then(cachedResp => {
        if (cachedResp) {
          // If resource is in cache, fetch the network resource in the background to update cache
          fetch(e.request)
            .then(networkResp => {
              caches.open(CACHE_STATIC_NAME).then(cache => cache.put(e.request, networkResp));
            })
            .catch(() => {});  // Ignore network errors, as cache will be used
          return cachedResp;
        }

        // If resource is not in cache, fetch from network, cache it, and return it
        return fetch(e.request)
          .then(networkResp => {
            const cloneResp = networkResp.clone();
            caches.open(CACHE_STATIC_NAME).then(cache => cache.put(e.request, cloneResp));
            return networkResp;
          });
      })
      .catch(() => {
        if (e.request.headers.get("accept").includes("text/html")) {
          return caches.match("/pages/offline.html");
        }
      })
  );
});

self.addEventListener("activate", (e) => {
  const clearOldCaches = caches.keys().then(keys => {
    const keysToDelete = keys.filter(key => 
      (key !== CACHE_STATIC_NAME && key.includes("static")) ||
      (key !== CACHE_DINAMIC_NAME && key.includes("dinamic")) ||
      (key !== CACHE_INMUTABLE_NAME && key.includes("inmutable"))
    );
    return Promise.all(keysToDelete.map(key => caches.delete(key)));
  });
  e.waitUntil(clearOldCaches);
});
