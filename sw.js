// Offline-Cache für die Lahmheits-App. Bei Änderungen VERSION erhöhen.
const VERSION = "lahmheit-v3";
const FILES = ["./", "index.html", "xlsx.full.min.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Sofort aus dem Cache antworten, im Hintergrund aktualisieren
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const cached = await cache.match(e.request, {ignoreSearch:true});
    const net = fetch(e.request).then(res => {
      if(res && res.ok && new URL(e.request.url).origin === location.origin) cache.put(e.request, res.clone());
      return res;
    }).catch(() => cached);
    return cached || net;
  }));
});
