// Brainmap Service Worker: online immer die neueste Version vom Server, offline die zuletzt geladene.
// Kein Vorab-Cache, keine Versionsliste: jede erfolgreiche Antwort ersetzt den Cache-Eintrag.
const CACHE = 'brainmap-app';
const TIMEOUT = 5000;   // langsames Netz: nach 5 s die gespeicherte Version zeigen, die App prüft später nach

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === 'navigate' ? new URL('./', location).href : req.url.split('?')[0];
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // cache:'no-cache' fragt den Server immer (ETag), lädt aber nur neu, wenn sich etwas geändert hat
      const res = await Promise.race([
        fetch(req.mode === 'navigate' ? req.url : req, { cache:'no-cache' }),   // Navigations-Requests erlauben keine Optionen
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), TIMEOUT))
      ]);
      if (res.ok) await cache.put(key, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(key);
      if (hit) return hit;
      throw err;
    }
  })());
});
