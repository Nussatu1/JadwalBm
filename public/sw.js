// Service Worker — Jadwal Acara Bakid Multimedia PWA
// v4: Stale-While-Revalidate — update langsung tersedia di buka berikutnya
const CACHE_NAME = 'jadwal-bm-v4';
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

// ─── Install: cache semua aset statis ────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((err) => console.warn('[SW] Cache install partial error:', err))
  );
  // skipWaiting: SW baru langsung aktif tanpa tunggu tab lama ditutup
  self.skipWaiting();
});

// ─── Activate: hapus cache lama ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: Stale-While-Revalidate ───────────────────────────────────────────
// Serve dari cache dulu (cepat), update cache di background.
// Sehingga pengguna selalu dapat versi terbaru di buka berikutnya.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass: non-GET, API calls, Google domain
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('script.google')
  ) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);

      // Fetch dari network di background — selalu update cache
      const networkFetch = fetch(event.request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            cache.put(event.request, res.clone());
          }
          return res;
        })
        .catch(() => null);

      // Stale-While-Revalidate:
      // - Ada cache → langsung return cache, network update di background
      // - Tidak ada cache → tunggu network
      return cached || networkFetch;
    })
  );
});

// ─── Notification Click: buka/fokus app ──────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Fokus ke tab yang sudah terbuka jika ada
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Buka tab baru jika belum ada
      return clients.openWindow(targetUrl);
    })
  );
});

// ─── Push: Terima push server → tampilkan notifikasi ─────────────────────────
//
// ARSITEKTUR SUARA:
//   - Saat app TERBUKA  → in-app banner + custom Audio() dari notificationService.js
//   - Saat app TERTUTUP → push ini tampil, suara dari sistem (silent: false)
//
// AudioContext di background Service Worker TIDAK DIDUKUNG di Android Chrome
// saat app tertutup. Menggunakan silent: false adalah cara yang benar untuk PWA.
// Custom audio hanya bisa dimainkan saat app aktif (lihat notificationService.js).
//
self.addEventListener('push', (event) => {
  // Parse payload dari server
  let data = {
    title: '📢 Jadwal Bakid Multimedia',
    body: 'Ada pembaruan jadwal liputan acara.',
    icon: '/icon-192x192.png',
    url: '/',
    tag: 'bm-push'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (_) {
      // Jika bukan JSON valid, gunakan teks mentah sebagai body
      data.body = event.data.text() || data.body;
    }
  }

  const notifOptions = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 400],
    tag: data.tag || 'bm-push-' + Date.now(),
    renotify: true,
    requireInteraction: false,
    // silent: false → suara sistem aktif (default Android)
    // Custom audio diputar oleh notificationService.js saat app terbuka
    silent: false,
    data: {
      url: data.url || '/'
    }
  };

  // Pastikan showNotification selalu jalan (tidak diblok oleh fungsi lain)
  event.waitUntil(
    self.registration.showNotification(data.title, notifOptions)
  );

  // Kirim pesan ke semua tab yang terbuka agar in-app audio juga dimainkan
  // (fire-and-forget, tidak memblok event.waitUntil)
  clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    clientList.forEach((client) => {
      client.postMessage({
        type: 'PUSH_RECEIVED',
        title: data.title,
        body: data.body
      });
    });
  });
});
