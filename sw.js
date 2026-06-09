const CACHE_NAME = 'mfd-roster-v5';
const ASSETS = ['/DHM_Roster/', '/DHM_Roster/index.html', '/DHM_Roster/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'UPDATE_AVAILABLE' }));
      });
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('/DHM_Roster/index.html')))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'MFD Roster', body: 'Duty update.' };
  e.waitUntil(self.registration.showNotification(data.title || 'MFD Roster', {
    body: data.body || '',
    icon: '/DHM_Roster/icon-192.png',
    badge: '/DHM_Roster/icon-96.png',
    vibrate: [200, 100, 200],
    data: data
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/DHM_Roster/'));
});
