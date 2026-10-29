/* MyFinance Poche — service worker : garde l'application sur l'iPhone pour l'ouvrir sans réseau.
   Stratégie « réseau d'abord » : en ligne, la dernière version publiée est chargée et mise en cache ;
   hors ligne, la copie en cache est utilisée. Aucune donnée personnelle n'est mise en cache ici
   (les données vivent dans le stockage local, chiffrées). Changer CACHE à chaque nouvelle version. */
const CACHE = 'mfpoche-2026-10-29-2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req, { cache: 'no-store' }).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)).then(r => r || Response.error())));
});
