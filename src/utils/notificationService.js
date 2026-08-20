/**
 * Web Push & Background Notification Service for Jadwal Bakid Multimedia
 * Handles permission, custom audio (/notif.mp3), and background checks.
 */

import { parseAnyDate, cleanTimeString, getTodayString } from './dateUtils';

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

let sharedAudio = null;
let isAudioUnlocked = false;

/**
 * Prime & unlock Audio on the first user interaction (touch/click)
 * Required by Mobile Safari & Chrome autoplay security policies.
 */
export function initAudioUnlock() {
  if (typeof window === 'undefined') return;

  const unlock = () => {
    try {
      if (!sharedAudio) {
        sharedAudio = new Audio('/notif.mp3');
        sharedAudio.volume = 1.0;
        sharedAudio.preload = 'auto';
      }
      // Play and immediately pause to unlock browser audio pipeline
      sharedAudio.play().then(() => {
        sharedAudio.pause();
        sharedAudio.currentTime = 0;
        isAudioUnlocked = true;
      }).catch(() => {
        // Will unlock on next interaction
      });
    } catch (e) {}

    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
  };

  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
}

// Auto-register audio unlock on module load
if (typeof window !== 'undefined') {
  initAudioUnlock();
}

export function playCustomAudioNotification() {
  try {
    if (!sharedAudio) {
      sharedAudio = new Audio('/notif.mp3');
      sharedAudio.volume = 1.0;
    }
    sharedAudio.currentTime = 0;
    const playPromise = sharedAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch((e) => {
        console.warn('Audio play prevented by browser autoplay policy:', e);
      });
    }
    return true;
  } catch (e) {
    console.error('Failed to play notification audio:', e);
    return false;
  }
}

export function getNotificationSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(saved) } : DEFAULT_NOTIF_SETTINGS;
  } catch (e) {
    return DEFAULT_NOTIF_SETTINGS;
  }
}

export function saveNotificationSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings:', e);
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { supported: false, granted: false, status: 'unsupported' };
  }

  if (Notification.permission === 'granted') {
    return { supported: true, granted: true, status: 'granted' };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      supported: true,
      granted: permission === 'granted',
      status: permission
    };
  } catch (e) {
    return { supported: true, granted: false, status: 'denied' };
  }
}

export async function showSystemNotification(title, body, options = {}) {
  const settings = getNotificationSettings();

  // Play audio
  playCustomAudioNotification();

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const notifOptions = {
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [300, 100, 300, 100, 300], // Strong vibration pattern
    silent: false, // Ensure device rings / vibrates
    tag: options.tag || 'bakid-notif-' + Date.now(),
    renotify: true,
    data: options.data || {},
    ...options
  };

  // Try Service Worker showNotification first (Works best on Android PWA)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, notifOptions);
      return true;
    } catch (e) {
      // Fallback
    }
  }

  try {
    new Notification(title, notifOptions);
    return true;
  } catch (e) {
    console.error('Notification error:', e);
    return false;
  }
}

function getSentLog() {
  try {
    const log = localStorage.getItem(STORAGE_KEYS.SENT_LOG);
    return log ? JSON.parse(log) : {};
  } catch (e) {
    return {};
  }
}

function markSent(notifKey) {
  try {
    const log = getSentLog();
    log[notifKey] = Date.now();
    localStorage.setItem(STORAGE_KEYS.SENT_LOG, JSON.stringify(log));
  } catch (e) {}
}

/**
 * Check all events and trigger push notifications based on settings
 */
export function checkAndTriggerEventNotifications(events) {
  if (!events || !events.length) return;
  const settings = getNotificationSettings();
  if (!settings.enabled || Notification.permission !== 'granted') return;

  const now = new Date();
  const todayStr = getTodayString();
  const sentLog = getSentLog();

  events.forEach((event) => {
    if (!event.tanggal || event.status === 'Batal') return;

    const eventDate = parseAnyDate(event.tanggal);
    if (!eventDate) return;

    const eventDateStr = event.tanggal.slice(0, 10);
    const startClean = cleanTimeString(event.jam_mulai);
    const endClean = cleanTimeString(event.jam_selesai);

    // Calculate Day Difference
    const oneDayMs = 24 * 60 * 60 * 1000;
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventZero = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const diffDays = Math.round((eventZero - todayZero) / oneDayMs);

    // 1. Notifikasi H-1
    if (settings.notifyHMinus1 && diffDays === 1) {
      const keyH1 = `h1_${event.id}_${eventDateStr}`;
      if (!sentLog[keyH1]) {
        showSystemNotification(
          `🔔 Pengingat H-1: ${event.nama_acara}`,
          `Besok ${startClean ? 'pukul ' + startClean + ' WIB' : ''}${event.lokasi_nama ? ' di ' + event.lokasi_nama : ''}. Harap siapkan perlengkapan tim.`,
          { tag: keyH1 }
        );
        markSent(keyH1);
      }
    }

    // 2. Notifikasi Hari Ini Mulai (Saat jam mulai tiba)
    if (settings.notifyEventStart && diffDays === 0 && startClean) {
      const [sHour, sMin] = startClean.split(':').map(Number);
      const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sHour, sMin, 0);
      const diffMinutes = Math.round((now - startDateTime) / (60 * 1000));

      if (diffMinutes >= 0 && diffMinutes <= 15) {
        const keyStart = `start_${event.id}_${todayStr}`;
        if (!sentLog[keyStart]) {
          showSystemNotification(
            `🔴 Acara Dimulai: ${event.nama_acara}`,
            `Sedang berlangsung sekarang di ${event.lokasi_nama || 'lokasi acara'}.`,
            { tag: keyStart }
          );
          markSent(keyStart);
        }
      }
    }

    // 3. Notifikasi Selesai (Manual status 'Selesai' atau otomatis lewat jam selesai)
    if (settings.notifyEventEnd) {
      const isManualFinished = event.status === 'Selesai';
      let isAutoFinished = false;

      if (diffDays === 0 && endClean) {
        const [eHour, eMin] = endClean.split(':').map(Number);
        const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eHour, eMin, 0);
        if (now >= endDateTime) {
          isAutoFinished = true;
        }
      }

      if (isManualFinished || isAutoFinished) {
        const keyEnd = `end_${event.id}_${eventDateStr}`;
        if (!sentLog[keyEnd]) {
          showSystemNotification(
            `✅ Acara Selesai: ${event.nama_acara}`,
            `Agenda liputan telah usai. Terima kasih atas kerja keras tim multimedia!`,
            { tag: keyEnd }
          );
          markSent(keyEnd);
        }
      }
    }
  });
}
