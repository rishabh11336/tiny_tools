// tiny/tools service worker — offline support.
// Strategy: navigations = network-first (fresh HTML, fall back to cache when
// offline); same-origin static assets = stale-while-revalidate. Cross-origin
// (fonts, GA) and giant WASM blobs are left to the network — never precached.
// ponytail: runtime cache only, no precache manifest; add Workbox if the
// caching rules ever outgrow these two cases.
const VERSION = "v1";
const CACHE = `tt-${VERSION}`;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // don't touch GA, fonts, CDNs

  // Skip the multi-MB WASM/model payloads — caching them would blow storage.
  if (/\.(wasm|onnx)$/.test(url.pathname) || url.pathname.includes("ffmpeg")) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req).then((m) => m || caches.match("/"))),
    );
    return;
  }

  // static assets: serve cache, refresh in background
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
