/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */

const CACHE_STATIC_NAME = "static-v1";
const CACHE_DINAMIC_NAME = "dinamic-v1";
const CACHE_INMUTABLE_NAME = "inmutable-v1";
const CACHE_DINAMIC_LIMIT = 100;

// 5 cache && Network Race
// servira la respuesta mas rapida entre internet o cache

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
  const response = new Promise((resolve, reject) => {
    let rechazada = false;

    const failOne = () => {
      if (rechazada) {
        if (/\.(png|jpj)$/i.test(e.request.url)) {
          resolve(caches.match("/no-image.jpg"));
        } else {
          reject("No existe el recurso");
        }
      } else {
        rechazada = true;
      }
    };

    fetch(e.request)
      .then((resp) => {
        resp.ok ? resolve(resp) : failOne();
      })
      .catch(failOne);

    caches
      .match(e.request)
      .then((resp) => {
        resp ? resolve(resp) : failOne();
      })
      .catch(failOne);
  });

  e.respondWith(response);
});
