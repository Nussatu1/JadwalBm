// Service Worker for Jadwal Acara Bakid Multimedia PWA
const CACHE_NAME = 'jadwal-bm-v2';
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

// Install Event: Cache Core Shell Assets (termasuk notif.mp3 untuk audio offline)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event: Bersihkan cache lama
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

// Fetch Event: Network-First for API, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET dan API calls dari aggressive cache
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

// Notification Click: Fokus atau buka jendela app
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

/**
 * Putar audio custom notif.mp3 dari cache Service Worker.
 *
 * Teknik: ambil dari SW cache → decode ke AudioBuffer → mainkan via AudioContext.
 * Ini menggantikan suara notifikasi default Android/sistem — persis seperti
 * yang dilakukan aplikasi DANA, GoPay, dan super-app lainnya.
 *
 * Catatan: AudioContext di Service Worker didukung oleh Chrome Android 66+.
 * Jika tidak tersedia (browser lama), fungsi ini diam-diam gagal (silent fail).
 */
async function playCustomSound() {
  try {
    // 1. Ambil file audio dari SW cache (offline-ready, tanpa network)
    const cache = await caches.open(CACHE_NAME);
    let audioResponse = await cache.match('/notif.mp3');
    if (!audioResponse || !audioResponse.ok) {
      // Fallback: ambil dari network jika tidak ada di cache
      audioResponse = await fetch('/notif.mp3');
    }
    const arrayBuffer = await audioResponse.arrayBuffer();

    // 2. Dekode dan putar via AudioContext
    const AudioCtx = self.AudioContext || self.webkitAudioContext;
    if (!AudioCtx) return; // Browser tidak mendukung — diam

    const ctx = new AudioCtx();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start(0);

    // 3. Tutup AudioContext setelah selesai (hemat memori)
    source.onended = () => ctx.close();
  } catch (e) {
    // Silent fail — jangan throw agar showNotification tetap tampil
    console.warn('[SW] Custom sound playback failed (expected on some browsers):', e.message);
  }
}

/**
 * Server Web Push Event
 *
 * Strategi suara kustom:
 * - silent: true  → mematikan suara bawaan Android/sistem
 * - playCustomSound() → memutar notif.mp3 sebagai gantinya
 *
 * HP akan tetap bergetar (vibrate) dan notifikasi tetap muncul di panel,
 * hanya suaranya diganti dari default ke notif.mp3 milik aplikasi ini.
 */
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
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: data.tag || 'bm-push-' + Date.now(),
    renotify: true,
    // KUNCI UTAMA: matikan suara default sistem Android
    // Suara kustom dimainkan oleh playCustomSound() di bawah
    silent: true,
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    Promise.all([
      // Tampilkan notifikasi (tanpa suara sistem)
      self.registration.showNotification(data.title || 'Jadwal Bakid Multimedia', notifOptions),
      // Mainkan notif.mp3 kustom sebagai gantinya
      playCustomSound()
    ])
  );
});
