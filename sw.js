// Qrown service worker: app-shell cache, network-first so updates arrive quickly.
const VERSION = "qrown-v3";
const SHELL = ["/", "/index.html", "/style.css", "/app.js", "/qr-lib.js", "/config.js", "/manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Never cache Supabase API / storage traffic.
  if (url.hostname.endsWith(".supabase.co")) return;
  // CDN scripts (supabase-js): cache-first.
  if (url.origin !== location.origin) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { const cp = res.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); return res; })));
    return;
  }
  // Same-origin: network first, fall back to cache; navigations fall back to the app shell.
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const cp = res.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("/index.html") : Response.error())))
  );
});
