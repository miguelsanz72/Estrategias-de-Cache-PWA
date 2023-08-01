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
  if (e.request.url.includes("wp-admin")) return;

  e.respondWith(
    fetch(e.request)
      .then(newResp => {
        // If successful fetch, update cache and return response
        const cloneResp = newResp.clone();
        
        if (e.request.method !== 'POST') {
          caches.open(CACHE_STATIC_NAME).then(cache => cache.put(e.request, cloneResp));
          cleanCache(CACHE_STATIC_NAME, 500);
        } else {
          caches.open(CACHE_DINAMIC_NAME).then(cache => cache.put(e.request, cloneResp));
          cleanCache(CACHE_DINAMIC_NAME, 500);
        }
        
        return newResp;
      })
      .catch(() => {
        // If fetch fails, return cached response
        return caches.match(e.request).then(resp => {
          if (resp) {
            return resp;
          } else if (e.request.headers.get("accept").includes("text/html")) {
            return caches.match("/pages/offline.html");
          }
        });
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
