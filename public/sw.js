// Service Worker for Jadwal Acara Bakid Multimedia PWA
const CACHE_NAME = 'jadwal-bm-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/notif.mp3',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/manifest.json'
];

// Install Event: Cache Core Shell Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Network-First for API requests, Stale-While-Revalidate for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and API calls (Google Script & Cloudflare API) from aggressive cache
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/') || url.hostname.includes('google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Notification Click Event: Focus or Open App Window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Server Web Push Event (Wakes up device & displays notification even if app is closed)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Jadwal Bakid Multimedia',
    body: 'Ada pembaruan jadwal liputan acara.'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const notifOptions = {
    body: data.body || 'Pembaruan jadwal liputan tim multimedia.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: data.tag || 'bm-push-' + Date.now(),
    renotify: true,
    data: data.data || { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Jadwal Bakid Multimedia', notifOptions)
  );
});


