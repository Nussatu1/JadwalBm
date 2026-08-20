# 📖 Panduan Setup: Jadwal Acara Bakid Multimedia

Dokumen ini berisi panduan lengkap langkah demi langkah untuk menyiapkan Google Sheets sebagai database, men-deploy Google Apps Script sebagai REST API, dan menghubungkannya dengan aplikasi React (Vite).

---

## 📑 Daftar Isi
1. [Langkah 1: Setup Google Spreadsheet](#1-setup-google-spreadsheet)
2. [Langkah 2: Memasang Kode Google Apps Script](#2-memasang-kode-google-apps-script)
3. [Langkah 3: Deploy Google Apps Script sebagai Web App](#3-deploy-google-apps-script-sebagai-web-app)
4. [Langkah 4: Menghubungkan Frontend React](#4-menghubungkan-frontend-react)
5. [Langkah 5: Deploy ke Vercel](#5-deploy-ke-vercel)
6. [Struktur Database & Password Default](#6-struktur-database--password-default)

---

## 1. Setup Google Spreadsheet

1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet, misalnya: `Database Jadwal Bakid Multimedia`.
3. Anda **tidak perlu membuat sheet/tabel secara manual** karena sistem Google Apps Script kami sudah dilengkapi fitur **auto-init** (akan otomatis membuat sheet `Acara`, `Anggota`, dan `Config` saat pertama kali dijalankan).
4. Namun jika Anda ingin mengecek atau membuatnya manual, strukturnya adalah sebagai berikut:

### Sheet 1: `Acara`
Header Baris 1:
`id`, `nama_acara`, `kategori`, `tanggal`, `jam_mulai`, `jam_selesai`, `lokasi_nama`, `lokasi_url`, `deskripsi`, `anggota_diutus`, `alat_media`, `status`, `link_dokumentasi`, `created_at`, `updated_at`

### Sheet 2: `Anggota`
Header Baris 1:
`id`, `nama`, `peran`, `aktif`

### Sheet 3: `Config`
Header Baris 1:
`admin_password_hash`, `whatsapp_group_link`

Baris 2 (Data Awal):
- Kolom A (`admin_password_hash`): `240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9` *(ini adalah hash SHA-256 untuk password default `admin123`)*
- Kolom B (`whatsapp_group_link`): `https://chat.whatsapp.com/GrupBakidMultimedia`

---

## 2. Memasang Kode Google Apps Script

1. Di Google Sheets Anda, klik menu bar atas: **Extensions** (Ekstensi) ➜ **Apps Script**.
2. Akan terbuka tab baru Google Apps Script Editor.
3. Hapus semua kode default `function myFunction() { ... }`.
4. Buka file [google_apps_script/Code.gs](file:///d:/APP/BM/google_apps_script/Code.gs) dari proyek ini, salin seluruh kodenya, dan tempel (paste) ke editor Apps Script.
5. Klik ikon **Save** (Disket / Ctrl+S) dan beri nama project Apps Script misalnya: `Bakid Schedule Backend`.

---

## 3. Deploy Google Apps Script sebagai Web App

> [!IMPORTANT]
> Ikuti pengaturan izin akses berikut agar frontend dapat mengakses data tanpa kendala izin (CORS):

1. Di pojok kanan atas Apps Script Editor, klik tombol biru **Deploy** (Terapkan) ➜ pilih **New deployment** (Penerapan baru).
2. Klik ikon gerigi (Select type) ➜ pilih **Web app**.
3. Konfigurasikan form:
   - **Description**: `API Bakid Multimedia v1`
   - **Execute as**: **Me (emailanda@gmail.com)**
   - **Who has access**: **Anyone** *(Siapa saja, bahkan pengguna tanpa login Google)*
4. Klik tombol **Deploy**.
5. Google akan meminta otorisasi:
   - Klik **Authorize access** (Tinjau izin).
   - Pilih akun Google Anda.
   - Jika muncul peringatan *"Google hasn't verified this app"*, klik **Advanced** (Lanjutan) di kiri bawah ➜ klik **Go to Bakid Schedule Backend (unsafe)**.
   - Klik **Allow** (Izinkan).
6. Setelah selesai, Anda akan mendapatkan **Web App URL** dengan format:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. **Salin (Copy)** URL tersebut!

---

## 4. Menghubungkan Frontend React

1. Buka folder proyek ini di komputer Anda.
2. Buat atau ubah file `.env` di root folder project:
   ```env
   VITE_GAS_API_URL=https://script.google.com/macros/s/AKfycbx.../exec
   VITE_DEFAULT_WA_GROUP=https://chat.whatsapp.com/LinkGrupAnda
   ```
3. Jalankan server lokal:
   ```bash
   npm install
   npm run dev
   ```
4. Aplikasi akan langsung tersinkronisasi dua arah dengan Google Sheets Anda!

---

## 5. Deploy ke Vercel

1. Push source code proyek ini ke repositori **GitHub** / **GitLab**.
2. Buka [Vercel](https://vercel.com) ➜ klik **Add New...** ➜ **Project**.
3. Import repository project Anda.
4. Di bagian **Environment Variables**, tambahkan:
   - `VITE_GAS_API_URL` = `https://script.google.com/macros/s/AKfycbx.../exec`
5. Klik **Deploy**. Selesai! Web app Anda sudah live dan siap digunakan oleh tim di HP maupun laptop.

---

## 6. Struktur Database & Password Default

- **Password Default Admin**: `admin123`
- **Ganti Password**: Admin dapat mengubah password langsung melalui menu Pengaturan di aplikasi, atau mengganti hash SHA-256 di Sheet `Config` Baris 2 Kolom A.
- **Mode Tim (Viewer)**: Anggota tim dapat langsung melihat jadwal, kalender, memfilter acara mereka, membuka lokasi Google Maps, dan membagikan broadcast ke WhatsApp tanpa perlu password.
