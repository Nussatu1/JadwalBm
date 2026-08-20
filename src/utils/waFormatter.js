import { formatTanggalIndo, formatJam } from './dateUtils';

/**
 * Format teks pesan broadcast WhatsApp untuk sebuah acara
 * @param {Object} event - Objek data acara
 * @returns {string} - Teks pesan WhatsApp yang sudah diformat rapi
 */
export function formatWhatsAppMessage(event) {
  if (!event) return '';

  const tanggal = formatTanggalIndo(event.tanggal);
  const jam = formatJam(event.jam_mulai, event.jam_selesai);
  
  let text = `📢 *JADWAL LIPUTAN & ACARA BAKID MULTIMEDIA*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `📌 *Acara:* ${event.nama_acara}\n`;
  if (event.kategori) {
    text += `🏷️ *Kategori:* ${event.kategori}\n`;
  }
  text += `📅 *Hari/Tgl:* ${tanggal}\n`;
  text += `⏰ *Waktu:* ${jam}\n`;
  
  if (event.lokasi_nama) {
    text += `📍 *Lokasi:* ${event.lokasi_nama}\n`;
  }
  if (event.lokasi_url) {
    text += `🗺️ *Google Maps:* ${event.lokasi_url}\n`;
  }

  if (event.anggota_diutus) {
    text += `\n👥 *Petugas Tim:*\n`;
    const anggotaList = event.anggota_diutus.split(',').map(s => s.trim()).filter(Boolean);
    anggotaList.forEach(nama => {
      text += `  • ${nama}\n`;
    });
  }

  if (event.alat_media) {
    text += `\n🎥 *Peralatan / Media Gear:*\n`;
    const alatList = event.alat_media.split(',').map(s => s.trim()).filter(Boolean);
    alatList.forEach(alat => {
      text += `  • ${alat}\n`;
    });
  }

  if (event.deskripsi) {
    text += `\n📝 *Brief / Catatan Tugas:*\n${event.deskripsi}\n`;
  }

  text += `\n⚡ *Status:* ${event.status || 'Terjadwal'}\n`;
  if (event.link_dokumentasi) {
    text += `📁 *Dokumentasi:* ${event.link_dokumentasi}\n`;
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Harap seluruh tim bertugas bersiap 30 menit sebelum acara._`;

  return text;
}

/**
 * Buka aplikasi WhatsApp dengan pesan terformat
 * @param {Object} event - Objek acara
 * @param {string} [phoneOrGroupUrl] - Nomor WA tujuan atau URL link grup WA
 */
export function shareToWhatsApp(event, phoneOrGroupUrl = '') {
  const message = formatWhatsAppMessage(event);
  const encodedText = encodeURIComponent(message);

  if (phoneOrGroupUrl && phoneOrGroupUrl.includes('chat.whatsapp.com/')) {
    // Link grup WA: buka langsung link undangan grup
    // WhatsApp akan membuka grup, user tinggal kirim pesan di sana
    // Format: https://chat.whatsapp.com/XXXXX?text=...
    const separator = phoneOrGroupUrl.includes('?') ? '&' : '?';
    const url = `${phoneOrGroupUrl}${separator}text=${encodedText}`;
    window.open(url, '_blank');
  } else if (phoneOrGroupUrl && phoneOrGroupUrl.replace(/\D/g, '').length > 5) {
    // Nomor telepon spesifik
    const cleanPhone = phoneOrGroupUrl.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(url, '_blank');
  } else {
    // Fallback: share umum WhatsApp (pilih kontak/grup di WA)
    const url = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, '_blank');
  }
}

