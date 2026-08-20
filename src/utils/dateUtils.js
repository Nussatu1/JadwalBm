// Helper utilitas tanggal dan waktu dalam Bahasa Indonesia

export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Normalisasi string tanggal dari format apapun (YYYY-MM-DD, ISO string, atau Date string "Fri Aug 21 2026...")
 */
export function parseAnyDate(dateVal) {
  if (!dateVal) return null;
  const str = String(dateVal).trim();
  if (!str) return null;

  // 1. Format YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10) - 1;
    const d = parseInt(ymdMatch[3], 10);
    return new Date(y, m, d);
  }

  // 2. Format standar Date JavaScript (misal "Fri Aug 21 2026 00:00:00 GMT...")
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d;
    }
  } catch (e) {}

  return null;
}

/**
 * Membersihkan format jam jika Google Sheets mengembalikannya sebagai objek Date (misal: "Sat Dec 30 1899 09:00:00...")
 */
export function cleanTimeString(timeVal) {
  if (!timeVal) return '';
  const str = String(timeVal).trim();
  if (!str) return '';

  if (str.toLowerCase() === 'selesai' || str.toLowerCase().includes('selesai')) {
    return 'Selesai';
  }

  // 1. Ekstrak pola jam:menit HH:MM dari string apapun
  const match = str.match(/(?:^|\s|T)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (match) {
    const hh = match[1].padStart(2, '0');
    const mm = match[2];
    return `${hh}:${mm}`;
  }

  // 2. Jika merupakan objek Date / string tanggal
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
  } catch (e) {}

  return str;
}

/**
 * Format tanggal YYYY-MM-DD / Date String ke format lokal Indonesia: "Jumat, 21 Agustus 2026"
 */
export function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-';
  const d = parseAnyDate(dateStr);
  if (!d) return String(dateStr);
  const hari = NAMA_HARI[d.getDay()];
  const day = d.getDate();
  const bulan = NAMA_BULAN[d.getMonth()];
  const year = d.getFullYear();
  return `${hari}, ${day} ${bulan} ${year}`;
}

/**
 * Format tanggal ringkas: "21 Agu 2026"
 */
export function formatTanggalRingkas(dateStr) {
  if (!dateStr) return '-';
  const d = parseAnyDate(dateStr);
  if (!d) return String(dateStr);
  const day = d.getDate();
  const monthShort = NAMA_BULAN[d.getMonth()].substring(0, 3);
  const year = d.getFullYear();
  return `${day} ${monthShort} ${year}`;
}

/**
 * Format rentang jam, misal: "13:00 - Selesai" atau "09:00 - 12:00 WIB"
 */
export function formatJam(jamMulai, jamSelesai) {
  const start = cleanTimeString(jamMulai);
  const end = cleanTimeString(jamSelesai);

  const isEndSelesai = end === 'Selesai' || end.toLowerCase().includes('selesai');

  if (!start && !end) return 'Waktu belum ditentukan';
  if (start && (isEndSelesai || !end)) return `${start} - Selesai`;
  if (!start && isEndSelesai) return 'Sampai Selesai';
  if (!start && end) return `Sampai ${end} WIB`;
  return `${start} - ${end} WIB`;
}

/**
 * Ambil tanggal hari ini dalam format YYYY-MM-DD
 */
export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Cek apakah sebuah acara sedang berlangsung atau akan datang dalam rentang jam tertentu
 */
export function isEventUpcomingOrLive(event, hoursWindow = 48) {
  if (!event.tanggal || event.status === 'Selesai' || event.status === 'Batal') {
    return { isLive: false, isUpcoming: false, hoursLeft: null };
  }

  const d = parseAnyDate(event.tanggal);
  if (!d) return { isLive: false, isUpcoming: false, hoursLeft: null };

  const now = new Date();
  const eventYear = d.getFullYear();
  const eventMonth = d.getMonth();
  const eventDay = d.getDate();

  const startClean = cleanTimeString(event.jam_mulai);
  let startHour = 0, startMin = 0;
  if (startClean) {
    const timeParts = startClean.split(':');
    startHour = parseInt(timeParts[0], 10) || 0;
    startMin = parseInt(timeParts[1], 10) || 0;
  }

  const endClean = cleanTimeString(event.jam_selesai);
  let endHour = 23, endMin = 59;
  if (endClean) {
    const timeParts = endClean.split(':');
    endHour = parseInt(timeParts[0], 10) || 23;
    endMin = parseInt(timeParts[1], 10) || 59;
  }

  const startDateTime = new Date(eventYear, eventMonth, eventDay, startHour, startMin, 0);
  const endDateTime = new Date(eventYear, eventMonth, eventDay, endHour, endMin, 0);

  const isLive = (now >= startDateTime && now <= endDateTime) || event.status === 'Berlangsung';

  const diffMs = startDateTime - now;
  const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));

  const isUpcoming = diffMs > 0 && diffMs <= (hoursWindow * 60 * 60 * 1000);

  return { isLive, isUpcoming, hoursLeft };
}
