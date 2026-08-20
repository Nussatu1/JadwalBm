// Helper utilitas tanggal dan waktu dalam Bahasa Indonesia

export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Format tanggal YYYY-MM-DD ke format lokal Indonesia: "Senin, 24 Agustus 2026"
 */
export function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      
      const hari = NAMA_HARI[date.getDay()];
      const bulan = NAMA_BULAN[month];
      return `${hari}, ${day} ${bulan} ${year}`;
    }
    const d = new Date(dateStr);
    return `${NAMA_HARI[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Format tanggal ringkas: "24 Agu 2026"
 */
export function formatTanggalRingkas(dateStr) {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const monthShort = NAMA_BULAN[parseInt(parts[1], 10) - 1].substring(0, 3);
      return `${parseInt(parts[2], 10)} ${monthShort} ${parts[0]}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Format rentang jam, misal: "08:00 - 12:00 WIB"
 */
export function formatJam(jamMulai, jamSelesai) {
  if (!jamMulai && !jamSelesai) return 'Waktu belum ditentukan';
  if (jamMulai && !jamSelesai) return `${jamMulai} WIB - Selesai`;
  if (!jamMulai && jamSelesai) return `Sampai ${jamSelesai} WIB`;
  return `${jamMulai} - ${jamSelesai} WIB`;
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

  const now = new Date();
  const dateParts = event.tanggal.split('-');
  const eventYear = parseInt(dateParts[0], 10);
  const eventMonth = parseInt(dateParts[1], 10) - 1;
  const eventDay = parseInt(dateParts[2], 10);

  let startHour = 0, startMin = 0;
  if (event.jam_mulai) {
    const timeParts = event.jam_mulai.split(':');
    startHour = parseInt(timeParts[0], 10) || 0;
    startMin = parseInt(timeParts[1], 10) || 0;
  }

  let endHour = 23, endMin = 59;
  if (event.jam_selesai) {
    const timeParts = event.jam_selesai.split(':');
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
