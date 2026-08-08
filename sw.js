// Service worker minimal : rend l'app "installable" (condition technique des
// navigateurs) et met en cache la coquille de l'app pour un lancement rapide.
// Les données elles-mêmes viennent toujours de Firestore en direct.
const CACHE_NAME = 'recos-shell-v1';
const SHELL_FILES = ['./recos.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // réseau en priorité (pour toujours avoir la dernière version + Firestore
  // en direct), avec le cache local en secours si hors-ligne
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
