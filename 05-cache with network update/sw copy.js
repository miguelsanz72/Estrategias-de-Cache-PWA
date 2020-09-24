self.addEventListener("fetch", (e) => {
  const offLineResp = fetch("pages/offline.html");
  const resp = fetch(e.request).catch(() => offLineResp);

  e.respondWith(resp);
});
