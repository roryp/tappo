// Offline cache: precache the shell, then cache-first for same-origin GETs (Vite assets are content-hashed).
const CACHE = 'tap-tactics-v4';
const SHELL = ['./', './index.html', './game.js', './copilot-game.js', './copilot.css', './assets/index-CnYtbatc.css', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  if (e.request.mode === 'navigate' || ['/game.js', '/copilot-game.js', '/copilot.css'].some(path => u.pathname.endsWith(path))) {
    const key = e.request.mode === 'navigate' ? './index.html' : e.request;
    e.respondWith(fetch(e.request).then(r => { if (r.ok) caches.open(CACHE).then(c => c.put(key, r.clone())); return r; }).catch(() => caches.match(key)));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) { const cl = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); } return r; })));
});
