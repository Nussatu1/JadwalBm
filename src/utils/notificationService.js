/**
 * Notification Service — Jadwal Bakid Multimedia
 *
 * Menangani:
 * - Push Subscription (daftarkan HP ke FCM via VAPID)
 * - In-app audio notifikasi kustom (notif.mp3)
 * - Pengecekan jadwal berkala (H-1, mulai, selesai)
 * - Listener pesan dari Service Worker (PUSH_RECEIVED)
 */

import { parseAnyDate, cleanTimeString, getTodayString } from './dateUtils';

// ─── Konstanta ────────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  SETTINGS: 'bakid_notif_settings',
  SENT_LOG: 'bakid_sent_notifications_log'
};

export const DEFAULT_NOTIF_SETTINGS = {
  enabled: false,
  customAudio: true,
  notifyHMinus1: true,
  notifyEventStart: true,
  notifyEventEnd: true
};

export const VAPID_PUBLIC_KEY =
  'BLjGf9tE-tULNS-2Do6COan2IrUi2YNDMnjB4AkrSyK7Mw8I2b7nW0UKwC91LvNQh5BI5_JKviMZ3pQUysDsOSg';

// ─── Helper: decode VAPID public key ─────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

// ─── Push Subscription ────────────────────────────────────────────────────────
/**
 * Daftarkan HP ini ke FCM Web Push dan simpan token ke server.
 * Hanya berjalan di HP Android/iOS — Chrome PC sering gagal (AbortError).
 */
export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, message: 'Push Manager tidak didukung di browser ini.' };
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg?.pushManager) {
      return { success: false, message: 'PushManager tidak tersedia di Service Worker.' };
    }

    const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    // Ambil subscription lama atau buat baru
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });
    }

    const subJson = subscription.toJSON
      ? subscription.toJSON()
      : JSON.parse(JSON.stringify(subscription));

    const res = await fetch('/api/push?action=subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subJson)
    });

    const resData = await res.json().catch(() => ({ success: true }));
    console.log('[Push] Subscription synced:', resData.message);
    return { success: true, subscription: subJson, data: resData };

  } catch (e) {
    // AbortError/NotSupportedError = Chrome PC tanpa Google Push Service aktif
    if (e.name === 'AbortError' || e.name === 'NotSupportedError') {
      console.info('[Push] Tidak tersedia di browser ini:', e.message);
      return {
        success: false,
        message: 'Push notification hanya tersedia di Chrome HP Android. Browser PC tidak didukung.'
      };
    }
    console.warn('[Push] subscribeUserToPush error:', e.name, e.message);
    return { success: false, message: e.message };
  }
}

// ─── Broadcast Test ───────────────────────────────────────────────────────────
/**
 * Kirim push notifikasi ke semua perangkat yang terdaftar via Cloudflare.
 */
export async function broadcastTestNotificationToAll(title, body) {
  try {
    const res = await fetch('/api/push?action=broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title || '📢 Tes Broadcast: Jadwal Bakid Multimedia',
        body: body || 'Uji coba transmisi notifikasi serentak ke seluruh tim multimedia berhasil!'
      })
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: e.message };
  }
}

// ─── Audio Kustom ─────────────────────────────────────────────────────────────
// Singleton Audio instance — unlock sekali, pakai terus
let _audio = null;
let _audioUnlocked = false;

/**
 * Unlock audio pipeline pada interaksi pertama pengguna.
 * Dipanggil SEKALI saja dari App.jsx.
 */
export function initAudioUnlock() {
  if (typeof window === 'undefined' || _audioUnlocked) return;

  const unlock = () => {
    try {
      if (!_audio) {
        _audio = new Audio('/notif.mp3');
        _audio.volume = 1.0;
        _audio.preload = 'auto';
      }
      _audio.play()
        .then(() => {
          _audio.pause();
          _audio.currentTime = 0;
          _audioUnlocked = true;
        })
        .catch(() => {}); // Akan coba ulang di interaksi berikutnya
    } catch (_) {}
  };

  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
}

/**
 * Mainkan notif.mp3 — hanya berfungsi saat app terbuka (tab aktif).
 */
export function playCustomAudioNotification() {
  try {
    if (!_audio) {
      _audio = new Audio('/notif.mp3');
      _audio.volume = 1.0;
    }
    _audio.currentTime = 0;
    _audio.play().catch((e) => {
      console.info('[Audio] Autoplay blocked (expected):', e.message);
    });
    return true;
  } catch (e) {
    console.warn('[Audio] playCustomAudioNotification error:', e);
    return false;
  }
}

// ─── Listener untuk pesan dari Service Worker ─────────────────────────────────
/**
 * Saat SW menerima push sementara app terbuka, SW mengirim pesan PUSH_RECEIVED.
 * Di sini kita tangkap dan mainkan custom audio + tampilkan in-app banner.
 */
export function registerSWMessageListener() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'PUSH_RECEIVED') {
      // App sedang terbuka → mainkan audio kustom
      playCustomAudioNotification();

      // Dispatch in-app notification event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('in-app-notification', {
          detail: {
            title: event.data.title,
            body: event.data.body
          }
        }));
      }
    }
  });
}

// ─── Pengaturan Notifikasi ────────────────────────────────────────────────────
export function getNotificationSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved
      ? { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(saved) }
      : { ...DEFAULT_NOTIF_SETTINGS };
  } catch (_) {
    return { ...DEFAULT_NOTIF_SETTINGS };
  }
}

export function saveNotificationSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('[Notif] Gagal simpan settings:', e);
  }
}

// ─── Izin Notifikasi ──────────────────────────────────────────────────────────
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { supported: false, granted: false, status: 'unsupported' };
  }
  if (Notification.permission === 'granted') {
    return { supported: true, granted: true, status: 'granted' };
  }
  try {
    const permission = await Notification.requestPermission();
    return { supported: true, granted: permission === 'granted', status: permission };
  } catch (_) {
    return { supported: true, granted: false, status: 'denied' };
  }
}

// ─── System Notification (saat app terbuka) ───────────────────────────────────
/**
 * Tampilkan notifikasi sistem + audio + in-app banner saat app aktif.
 * Untuk push dari luar (app tertutup) ditangani oleh Service Worker.
 */
export async function showSystemNotification(title, body, options = {}) {
  // 1. Audio kustom
  playCustomAudioNotification();

  // 2. In-app visual banner
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('in-app-notification', {
      detail: { title, body, tag: options.tag }
    }));
  }

  // 3. OS notification (perlu izin)
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;

  const notifOptions = {
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 400],
    silent: true, // audio sudah diputar manual di atas
    tag: options.tag || 'bakid-' + Date.now(),
    renotify: true,
    data: options.data || {}
  };

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      await reg.showNotification(title, notifOptions);
      return true;
    }
  } catch (e) {
    console.warn('[Notif] SW showNotification gagal:', e);
  }

  // Fallback: Notification API langsung (Desktop Safari/Firefox)
  try {
    new Notification(title, notifOptions);
    return true;
  } catch (_) {
    return false;
  }
}

// ─── Log Notifikasi Terkirim ──────────────────────────────────────────────────
function getSentLog() {
  try {
    const log = localStorage.getItem(STORAGE_KEYS.SENT_LOG);
    return log ? JSON.parse(log) : {};
  } catch (_) {
    return {};
  }
}

function markSent(notifKey) {
  try {
    const log = getSentLog();
    log[notifKey] = Date.now();
    localStorage.setItem(STORAGE_KEYS.SENT_LOG, JSON.stringify(log));
  } catch (_) {}
}

// ─── Pengecekan Jadwal Berkala ────────────────────────────────────────────────
/**
 * Periksa semua acara dan kirim notifikasi lokal berdasarkan waktu.
 * Dipanggil setiap 60 detik dari App.jsx via setInterval.
 */
export function checkAndTriggerEventNotifications(events) {
  if (!events?.length) return;

  const settings = getNotificationSettings();
  if (!settings.enabled || Notification.permission !== 'granted') return;

  const now = new Date();
  const todayStr = getTodayString();
  const sentLog = getSentLog();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  events.forEach((event) => {
    if (!event.tanggal || event.status === 'Batal') return;

    const eventDate = parseAnyDate(event.tanggal);
    if (!eventDate) return;

    const eventDateStr = event.tanggal.slice(0, 10);
    const startClean = cleanTimeString(event.jam_mulai);
    const endClean = cleanTimeString(event.jam_selesai);

    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventZero = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const diffDays = Math.round((eventZero - todayZero) / ONE_DAY_MS);

    // H-1: pengingat sehari sebelum
    if (settings.notifyHMinus1 && diffDays === 1) {
      const key = `h1_${event.id}_${eventDateStr}`;
      if (!sentLog[key]) {
        showSystemNotification(
          `🔔 Pengingat H-1: ${event.nama_acara}`,
          `Besok${startClean ? ' pukul ' + startClean + ' WIB' : ''}${event.lokasi_nama ? ' di ' + event.lokasi_nama : ''}. Siapkan perlengkapan tim.`,
          { tag: key }
        );
        markSent(key);
      }
    }

    // Hari H: saat jam mulai tiba (window 15 menit)
    if (settings.notifyEventStart && diffDays === 0 && startClean) {
      const [sH, sM] = startClean.split(':').map(Number);
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sH, sM, 0);
      const diffMin = Math.round((now - startTime) / 60000);

      if (diffMin >= 0 && diffMin <= 15) {
        const key = `start_${event.id}_${todayStr}`;
        if (!sentLog[key]) {
          showSystemNotification(
            `🔴 Acara Dimulai: ${event.nama_acara}`,
            `Sedang berlangsung di ${event.lokasi_nama || 'lokasi acara'}.`,
            { tag: key }
          );
          markSent(key);
        }
      }
    }

    // Selesai: otomatis lewat jam atau manual status 'Selesai'
    if (settings.notifyEventEnd) {
      const isManual = event.status === 'Selesai';
      let isAuto = false;

      if (diffDays === 0 && endClean && endClean !== 'Selesai') {
        const [eH, eM] = endClean.split(':').map(Number);
        if (!isNaN(eH) && !isNaN(eM)) {
          const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eH, eM, 0);
          if (now >= endTime) isAuto = true;
        }
      }

      if (isManual || isAuto) {
        const key = `end_${event.id}_${eventDateStr}`;
        if (!sentLog[key]) {
          showSystemNotification(
            `✅ Acara Selesai: ${event.nama_acara}`,
            'Agenda liputan telah usai. Terima kasih atas kerja keras tim multimedia!',
            { tag: key }
          );
          markSent(key);
        }
      }
    }
  });
}
