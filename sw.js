// Cache de la app para que abra sin internet. Sube la versión al cambiar archivos.
const CACHE = 'money-v33';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

// Al instalar se descarga todo directo del servidor (cache:'reload'): nunca se guarda una copia vieja
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function fresh(req) {
  const res = await fetch(req, { cache: 'no-store' });
  if (res && res.ok) (await caches.open(CACHE)).put('./index.html', res.clone());
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // sw.js siempre del servidor (la app lo usa para saber si hay versión nueva)
  if (url.pathname.endsWith('/sw.js')) { e.respondWith(fetch(req, { cache: 'no-store' })); return; }

  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  if (isPage) {
    // Abrir la app: al instante con la copia guardada (sin esperar internet) y se actualiza por detrás
    if (req.mode === 'navigate') {
      e.respondWith((async () => {
        const hit = (await caches.match('./index.html')) || (await caches.match('./'));
        if (hit) { e.waitUntil(fresh(req).catch(() => {})); return hit; }
        try { return await fresh(req); } catch (err) { return Response.error(); }
      })());
      return;
    }
    // Pedido de la propia app para bajar la versión nueva: directo del servidor
    e.respondWith(fresh(req).catch(() => caches.match('./index.html')));
    return;
  }

  // Íconos y demás: primero lo guardado (rápido), si no, internet
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
