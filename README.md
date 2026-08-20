# 🎬 Jadwal Acara Bakid Multimedia

Aplikasi web mobile-first responsive untuk mengelola dan memantau jadwal liputan & acara tim **Bakid Multimedia**. Terintegrasi langsung dengan **Google Sheets** melalui **Google Apps Script (GAS) Web App** sebagai backend database gratis dan real-time.

---

## ✨ Fitur Utama

- 📱 **Mobile-First Responsive Design**: Tampilan nyaman diakses satu tangan di smartphone, dengan Bottom Navigation Bar.
- ⚡ **Real-Time Data with Google Sheets**: Database disimpan di spreadsheet Google Sheets yang mudah diedit langsung jika diperlukan.
- 🔐 **Dual Role & Auth Sederhana**:
  - **Admin**: Login dengan password (terenkripsi SHA-256), memiliki hak akses penuh membuat, mengedit, menghapus, dan membatalkan jadwal acara serta master data anggota.
  - **Tim (Viewer)**: Tanpa password, langsung dapat melihat jadwal, kalender, memfilter agenda pribadi, dan membagikan rincian acara.
- 📅 **Kalender Bulanan Interaktif**: Titik penanda acara di setiap tanggal, klik tanggal untuk melihat rincian acara pada hari tersebut.
- 🏷️ **Filter & Pencarian**: Filter cepat berdasarkan Kategori, Status (Terjadwal, Berlangsung, Selesai, Batal), nama acara, penugasan tim, atau gear yang dipakai.
- 📍 **Lokasi & Google Maps**: Tombol langsung membuka Google Maps lokasi liputan di tab baru.
- 👥 **Penugasan Anggota**: Multi-select dari Master Anggota atau input nama manual.
- 🎥 **Media Gear / Alat Tagging**: Tagging alat yang digunakan (Sony A7III, Drone, Mic Wireless, dsb.).
- 📢 **Banner Notifikasi Berlangsung & Mendatang**: Sorotan otomatis di bagian atas untuk acara yang sedang berlangsung dan dalam 24-48 jam ke depan.
- 💬 **Kirim ke WhatsApp Manual**: Tombol yang langsung memformat rincian acara lengkap dengan emoji, lokasi, tugas tim, dan link Google Maps ke WhatsApp Web/App.

---

## 🚀 Panduan Memulai Cepat (Local Development)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```

3. **Buka Browser**:
   Kunjungi `http://localhost:3000` (atau port yang tertera di terminal).

---

## 🛠️ Panduan Setup Google Sheets & Backend

Silakan baca file panduan lengkap di:
👉 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**
