// Offline-Betrieb für Praxis Score. Bei jeder Änderung an der App VERSION erhöhen.
const VERSION = "tmk-lahmheit-v15";
const FILES = ["./", "index.html", "xlsx.full.min.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "logo-tmk.svg", "bogen.svg", "asap-latin.woff2"];
const OPTIONAL = ["foerderleiste.jpg"];
// Beim Einrichten immer frisch vom Server holen, nicht aus dem Zwischenspeicher des Browsers
const fresh = f => new Request(f, {cache: "reload"});

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(FILES.map(fresh)).then(() => Promise.all(OPTIONAL.map(f => c.add(fresh(f)).catch(() => {})))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Sofort aus dem Speicher antworten (funktioniert ohne Netz), im Hintergrund aktualisieren
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if(e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const cached = await cache.match(e.request, {ignoreSearch: true});
    const net = fetch(e.request).then(res => {
      if(res && res.ok && !res.redirected) cache.put(e.request, res.clone());
      return res;
    });
    if(cached){ e.waitUntil(net.catch(() => {})); return cached; }
    return net.catch(() => Response.error());
  }));
});
