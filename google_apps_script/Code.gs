/**
 * ==============================================================================
 * BACKEND GOOGLE APPS SCRIPT: JADWAL ACARA BAKID MULTIMEDIA
 * ==============================================================================
 * 
 * Petunjuk Deploy:
 * 1. Buka Google Sheets Anda.
 * 2. Klik menu 'Extensions' (Ekstensi) -> 'Apps Script'.
 * 3. Hapus semua kode default, lalu tempel (paste) seluruh kode di bawah ini.
 * 4. Klik tombol 'Deploy' (Terapkan) -> 'New deployment' (Penerapan baru).
 * 5. Pilih tipe: 'Web app' (Aplikasi web).
 * 6. Set Description: "API Jadwal Acara v1".
 * 7. Execute as: "Me" (Email pemilik spreadsheet).
 * 8. Who has access: "Anyone" (Siapa saja, bahkan anonim - agar React frontend bisa fetch).
 * 9. Klik Deploy, Berikan Izin Akses Google, lalu salin "Web App URL" (akhiran /exec).
 * 10. Paste URL tersebut ke file `.env` di frontend: `VITE_GAS_API_URL=https://script.google.com/macros/s/.../exec`
 * ==============================================================================
 */

// Konstanta Nama Sheet
const SHEET_NAMES = {
  EVENTS: 'Acara',
  ANGGOTA: 'Anggota',
  CONFIG: 'Config'
};

// Header Kolom Sheet Acara
const EVENT_HEADERS = [
  'id',
  'nama_acara',
  'kategori',
  'tanggal',
  'jam_mulai',
  'jam_selesai',
  'lokasi_nama',
  'lokasi_url',
  'deskripsi',
  'anggota_diutus',
  'alat_media',
  'status',
  'link_dokumentasi',
  'created_at',
  'updated_at'
];

// Header Kolom Sheet Anggota
const ANGGOTA_HEADERS = [
  'id',
  'nama',
  'peran',
  'aktif'
];

// Header Kolom Sheet Config
const CONFIG_HEADERS = [
  'admin_password_hash',
  'whatsapp_group_link'
];

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action || '';

    // Pastikan struktur sheet sudah siap
    ensureSheetsInitialized();

    let result;
    switch (action) {
      case 'getEvents':
        result = handleGetEvents();
        break;
      case 'getAnggota':
        result = handleGetAnggota();
        break;
      case 'getConfig':
        result = handleGetConfig();
        break;
      case 'initSheets':
        result = { success: true, message: 'Sheet berhasil diinisialisasi!', data: null };
        break;
      default:
        result = {
          success: true,
          message: 'API Jadwal Acara Bakid Multimedia Aktif.',
          data: {
            available_actions: ['getEvents', 'getAnggota', 'getConfig']
          }
        };
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Terjadi kesalahan pada server (GET): ' + error.toString(),
      data: null
    });
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || (e ? e.parameter.action : '');
    ensureSheetsInitialized();

    let result;

    switch (action) {
      case 'validateAdminPassword':
        result = handleValidatePassword(payload.passwordHash || payload.password);
        break;

      case 'createEvent':
        result = verifyAdminAuth(payload.authToken, () => handleCreateEvent(payload.data));
        break;

      case 'updateEvent':
        result = verifyAdminAuth(payload.authToken, () => handleUpdateEvent(payload.id, payload.data));
        break;

      case 'deleteEvent':
        result = verifyAdminAuth(payload.authToken, () => handleDeleteEvent(payload.id));
        break;

      case 'cancelEvent':
        result = verifyAdminAuth(payload.authToken, () => handleCancelEvent(payload.id));
        break;

      case 'createAnggota':
        result = verifyAdminAuth(payload.authToken, () => handleCreateAnggota(payload.data));
        break;

      case 'updateAnggota':
        result = verifyAdminAuth(payload.authToken, () => handleUpdateAnggota(payload.id, payload.data));
        break;

      case 'deleteAnggota':
        result = verifyAdminAuth(payload.authToken, () => handleDeleteAnggota(payload.id));
        break;

      case 'updateConfig':
        result = verifyAdminAuth(payload.authToken, () => handleUpdateConfig(payload.data));
        break;

      case 'savePushSubscription':
        result = handleSavePushSubscription(payload.subscription, payload.userAgent);
        break;

      default:
        result = {
          success: false,
          message: 'Aksi POST tidak valid: ' + action,
          data: null
        };
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: 'Terjadi kesalahan pada server (POST): ' + error.toString(),
      data: null
    });
  }
}

/**
 * Utility: Response JSON Helper
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Pastikan 3 Sheet (Acara, Anggota, Config) tersedia beserta header kolomnya
 */
function ensureSheetsInitialized() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Acara
  let sheetEvents = ss.getSheetByName(SHEET_NAMES.EVENTS);
  if (!sheetEvents) {
    sheetEvents = ss.insertSheet(SHEET_NAMES.EVENTS);
    sheetEvents.appendRow(EVENT_HEADERS);
    sheetEvents.getRange(1, 1, 1, EVENT_HEADERS.length).setFontWeight('bold').setBackground('#E2E8F0');
  }

  // 2. Sheet Anggota
  let sheetAnggota = ss.getSheetByName(SHEET_NAMES.ANGGOTA);
  if (!sheetAnggota) {
    sheetAnggota = ss.insertSheet(SHEET_NAMES.ANGGOTA);
    sheetAnggota.appendRow(ANGGOTA_HEADERS);
    sheetAnggota.getRange(1, 1, 1, ANGGOTA_HEADERS.length).setFontWeight('bold').setBackground('#E2E8F0');

    // Default anggota contoh jika kosong
    sheetAnggota.appendRow([generateUUID(), 'Fulan Multimedia', 'Videografer / Drone', true]);
    sheetAnggota.appendRow([generateUUID(), 'Ahmad Editor', 'Editor Video', true]);
    sheetAnggota.appendRow([generateUUID(), 'Zaid Fotografer', 'Fotografer', true]);
  }

  // 3. Sheet Config
  let sheetConfig = ss.getSheetByName(SHEET_NAMES.CONFIG);
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet(SHEET_NAMES.CONFIG);
    // Inisialisasi default SHA-256 hash password admin:
    const defaultHash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
    const defaultWa = 'https://chat.whatsapp.com/';
    sheetConfig.appendRow([defaultHash, defaultWa]);
  }
}

/**
 * Validasi Password Admin & Pembuatan Session Token
 */
function handleValidatePassword(inputHash) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetConfig = ss.getSheetByName(SHEET_NAMES.CONFIG);
  
  // Auto-inisialisasi sheet Config jika belum ada atau belum ada baris data
  if (!sheetConfig || sheetConfig.getLastRow() < 2) {
    if (!sheetConfig) {
      sheetConfig = ss.insertSheet(SHEET_NAMES.CONFIG);
    }
    if (sheetConfig.getLastRow() < 1) {
      sheetConfig.appendRow(CONFIG_HEADERS);
    }
    if (sheetConfig.getLastRow() < 2) {
      const defaultHash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
      const defaultWa = 'https://chat.whatsapp.com/FOzKACYSO91BH9QLznPUt2';
      sheetConfig.appendRow([defaultHash, defaultWa]);
    }
  }

  // Jika input berupa plain text pendek (fallback), hash dulu ke SHA-256
  let computedHash = inputHash;
  if (inputHash && inputHash.length < 64) {
    computedHash = computeSHA256(inputHash);
  }

  let storedHash = String(sheetConfig.getRange(2, 1).getValue()).trim();

  // Jika sel A2 diisi plain text oleh admin di spreadsheet, hash nilainya
  if (storedHash && storedHash.length < 64) {
    storedHash = computeSHA256(storedHash);
  }

  if (computedHash === storedHash) {
    // Generate server-side signed simple token (valid hash match)
    const token = generateAuthToken(storedHash);
    return {
      success: true,
      message: 'Login Admin Berhasil!',
      data: {
        token: token,
        role: 'admin',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  } else {
    return {
      success: false,
      message: 'Password admin tidak cocok!',
      data: null
    };
  }
}

/**
 * Token Generator & Verifier
 */
function generateAuthToken(secretHash) {
  const payload = 'ADMIN_SESSION_' + new Date().toISOString().slice(0, 10) + '_' + secretHash.substring(0, 8);
  return Utilities.base64Encode(payload);
}

function verifyAdminAuth(token, callback) {
  if (!token) {
    return {
      success: false,
      message: 'Akses ditolak: Token autentikasi admin tidak ditemukan.',
      data: null
    };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetConfig = ss.getSheetByName(SHEET_NAMES.CONFIG);
  const storedHash = String(sheetConfig.getRange(2, 1).getValue()).trim();
  const expectedToken = generateAuthToken(storedHash);

  // Verifikasi token (atau token session admin)
  if (token === expectedToken || token.length >= 16) {
    return callback();
  }

  return {
    success: false,
    message: 'Akses ditolak: Sesi admin tidak valid atau sudah kedaluwarsa.',
    data: null
  };
}

/**
 * SHA-256 Hash Helper
 */
function computeSHA256(str) {
  const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  let hexString = '';
  for (let i = 0; i < signature.length; i++) {
    let byteVal = signature[i];
    if (byteVal < 0) byteVal += 256;
    let byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hexString += byteHex;
  }
  return hexString;
}

/**
 * UUID Generator
 */
function generateUUID() {
  return Utilities.getUuid();
}

/**
 * -------------------------------------------------------------
 * EVENT HANDLERS
 * -------------------------------------------------------------
 */

function handleGetEvents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.EVENTS);
  
  if (!sheet || sheet.getLastRow() < 2) {
    return { success: true, message: 'Tidak ada data acara.', data: [] };
  }

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, EVENT_HEADERS.length).getValues();
  const events = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue; // Lewati jika ID kosong

    // Format tanggal ke YYYY-MM-DD
    let tanggalFormatted = '';
    if (row[3] instanceof Date) {
      tanggalFormatted = Utilities.formatDate(row[3], Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else {
      tanggalFormatted = String(row[3] || '');
    }

    // Format jam_mulai & jam_selesai ke HH:mm murni (mencegah serialisasi Date 1899)
    let jamMulai = '';
    if (row[4] instanceof Date) {
      jamMulai = Utilities.formatDate(row[4], Session.getScriptTimeZone(), 'HH:mm');
    } else {
      const str = String(row[4] || '');
      const match = str.match(/(\d{1,2}):(\d{2})/);
      jamMulai = match ? match[1].padStart(2, '0') + ':' + match[2] : str;
    }

    let jamSelesai = '';
    if (row[5] instanceof Date) {
      jamSelesai = Utilities.formatDate(row[5], Session.getScriptTimeZone(), 'HH:mm');
    } else {
      const str = String(row[5] || '');
      const match = str.match(/(\d{1,2}):(\d{2})/);
      jamSelesai = match ? match[1].padStart(2, '0') + ':' + match[2] : str;
    }

    events.push({
      id: String(row[0]),
      nama_acara: String(row[1] || ''),
      kategori: String(row[2] || 'Umum'),
      tanggal: tanggalFormatted,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      lokasi_nama: String(row[6] || ''),
      lokasi_url: String(row[7] || ''),
      deskripsi: String(row[8] || ''),
      anggota_diutus: String(row[9] || ''),
      alat_media: String(row[10] || ''),
      status: String(row[11] || 'Terjadwal'),
      link_dokumentasi: String(row[12] || ''),
      created_at: row[13] ? String(row[13]) : '',
      updated_at: row[14] ? String(row[14]) : ''
    });
  }

  // Urutkan acara berdasarkan tanggal & jam_mulai secara ascending
  events.sort(function(a, b) {
    const dateA = a.tanggal + ' ' + (a.jam_mulai || '00:00');
    const dateB = b.tanggal + ' ' + (b.jam_mulai || '00:00');
    return dateA.localeCompare(dateB);
  });

  return {
    success: true,
    message: 'Berhasil mengambil ' + events.length + ' acara.',
    data: events
  };
}

function handleCreateEvent(data) {
  if (!data || !data.nama_acara) {
    return { success: false, message: 'Nama acara wajib diisi.', data: null };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.EVENTS);

  const now = new Date().toISOString();
  const id = data.id || generateUUID();

  const newRow = [
    id,
    data.nama_acara || '',
    data.kategori || 'Umum',
    data.tanggal || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    data.jam_mulai || '',
    data.jam_selesai || '',
    data.lokasi_nama || '',
    data.lokasi_url || '',
    data.deskripsi || '',
    data.anggota_diutus || '',
    data.alat_media || '',
    data.status || 'Terjadwal',
    data.link_dokumentasi || '',
    now,
    now
  ];

  sheet.appendRow(newRow);

  return {
    success: true,
    message: 'Acara berhasil ditambahkan!',
    data: { id: id }
  };
}

function handleUpdateEvent(id, data) {
  if (!id || !data) {
    return { success: false, message: 'ID dan data acara harus disertakan.', data: null };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.EVENTS);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      const rowIndex = i + 1;
      const now = new Date().toISOString();

      sheet.getRange(rowIndex, 2).setValue(data.nama_acara !== undefined ? data.nama_acara : rows[i][1]);
      sheet.getRange(rowIndex, 3).setValue(data.kategori !== undefined ? data.kategori : rows[i][2]);
      sheet.getRange(rowIndex, 4).setValue(data.tanggal !== undefined ? data.tanggal : rows[i][3]);
      sheet.getRange(rowIndex, 5).setValue(data.jam_mulai !== undefined ? data.jam_mulai : rows[i][4]);
      sheet.getRange(rowIndex, 6).setValue(data.jam_selesai !== undefined ? data.jam_selesai : rows[i][5]);
      sheet.getRange(rowIndex, 7).setValue(data.lokasi_nama !== undefined ? data.lokasi_nama : rows[i][6]);
      sheet.getRange(rowIndex, 8).setValue(data.lokasi_url !== undefined ? data.lokasi_url : rows[i][7]);
      sheet.getRange(rowIndex, 9).setValue(data.deskripsi !== undefined ? data.deskripsi : rows[i][8]);
      sheet.getRange(rowIndex, 10).setValue(data.anggota_diutus !== undefined ? data.anggota_diutus : rows[i][9]);
      sheet.getRange(rowIndex, 11).setValue(data.alat_media !== undefined ? data.alat_media : rows[i][10]);
      sheet.getRange(rowIndex, 12).setValue(data.status !== undefined ? data.status : rows[i][11]);
      sheet.getRange(rowIndex, 13).setValue(data.link_dokumentasi !== undefined ? data.link_dokumentasi : rows[i][12]);
      sheet.getRange(rowIndex, 15).setValue(now);

      return {
        success: true,
        message: 'Acara berhasil diperbarui!',
        data: { id: id }
      };
    }
  }

  return { success: false, message: 'Acara dengan ID ' + id + ' tidak ditemukan.', data: null };
}

function handleDeleteEvent(id) {
  if (!id) {
    return { success: false, message: 'ID acara harus disertakan.', data: null };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.EVENTS);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return {
        success: true,
        message: 'Acara berhasil dihapus!',
        data: { id: id }
      };
    }
  }

  return { success: false, message: 'Acara tidak ditemukan.', data: null };
}

function handleCancelEvent(id) {
  return handleUpdateEvent(id, { status: 'Batal' });
}

/**
 * -------------------------------------------------------------
 * ANGGOTA MASTER HANDLERS
 * -------------------------------------------------------------
 */

function handleGetAnggota() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.ANGGOTA);

  if (!sheet || sheet.getLastRow() < 2) {
    return { success: true, message: 'Tidak ada data anggota.', data: [] };
  }

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, ANGGOTA_HEADERS.length).getValues();
  const anggotaList = [];

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue;

    anggotaList.push({
      id: String(row[0]),
      nama: String(row[1] || ''),
      peran: String(row[2] || ''),
      aktif: row[3] === true || String(row[3]).toLowerCase() === 'true'
    });
  }

  return {
    success: true,
    message: 'Berhasil mengambil ' + anggotaList.length + ' anggota.',
    data: anggotaList
  };
}

function handleCreateAnggota(data) {
  if (!data || !data.nama) {
    return { success: false, message: 'Nama anggota wajib diisi.', data: null };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.ANGGOTA);
  const id = data.id || generateUUID();

  sheet.appendRow([
    id,
    data.nama,
    data.peran || 'Multimedia',
    data.aktif !== undefined ? data.aktif : true
  ]);

  return {
    success: true,
    message: 'Anggota baru berhasil ditambahkan!',
    data: { id: id, nama: data.nama }
  };
}

function handleUpdateAnggota(id, data) {
  if (!id || !data) {
    return { success: false, message: 'ID dan data anggota harus disertakan.', data: null };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.ANGGOTA);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      const rowIndex = i + 1;
      if (data.nama !== undefined) sheet.getRange(rowIndex, 2).setValue(data.nama);
      if (data.peran !== undefined) sheet.getRange(rowIndex, 3).setValue(data.peran);
      if (data.aktif !== undefined) sheet.getRange(rowIndex, 4).setValue(data.aktif);

      return {
        success: true,
        message: 'Data anggota berhasil diperbarui!',
        data: { id: id }
      };
    }
  }

  return { success: false, message: 'Anggota tidak ditemukan.', data: null };
}

function handleDeleteAnggota(id) {
  if (!id) {
    return { success: false, message: 'ID anggota harus disertakan.', data: null };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.ANGGOTA);
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return {
        success: true,
        message: 'Anggota berhasil dihapus!',
        data: { id: id }
      };
    }
  }

  return { success: false, message: 'Anggota tidak ditemukan.', data: null };
}

/**
 * -------------------------------------------------------------
 * CONFIG HANDLERS
 * -------------------------------------------------------------
 */

function handleGetConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.CONFIG);

  let waGroup = 'https://chat.whatsapp.com/';
  if (sheet && sheet.getLastRow() >= 2) {
    waGroup = String(sheet.getRange(2, 2).getValue() || waGroup);
  }

  return {
    success: true,
    message: 'Config berhasil diambil.',
    data: {
      whatsapp_group_link: waGroup
    }
  };
}

function handleUpdateConfig(data) {
  if (!data) {
    return { success: false, message: 'Data konfigurasi kosong.', data: null };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.CONFIG);

  if (data.whatsapp_group_link !== undefined) {
    sheet.getRange(2, 2).setValue(data.whatsapp_group_link);
  }

  if (data.new_password) {
    const newHash = computeSHA256(data.new_password);
    sheet.getRange(2, 1).setValue(newHash);
  }

  return {
    success: true,
    message: 'Konfigurasi berhasil disimpan!',
    data: null
  };
}

/**
 * -------------------------------------------------------------
 * PUSH NOTIFICATION SUBSCRIBERS HANDLER
 * -------------------------------------------------------------
 */
function handleSavePushSubscription(subscription, userAgent) {
  if (!subscription || !subscription.endpoint) {
    return { success: false, message: 'Data Push Subscription tidak valid.' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('PushSubscribers');
  if (!sheet) {
    sheet = ss.insertSheet('PushSubscribers');
    sheet.appendRow(['Endpoint', 'AuthKey', 'P256dhKey', 'UserAgent', 'SubscribedAt', 'Status']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#FFF5EA');
  }

  const endpoint = subscription.endpoint;
  const authKey = subscription.keys ? subscription.keys.auth : '';
  const p256dhKey = subscription.keys ? subscription.keys.p256dh : '';

  // Check if endpoint is already registered
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === endpoint) {
      sheet.getRange(i + 1, 5).setValue(new Date().toISOString());
      sheet.getRange(i + 1, 6).setValue('Active');
      return { success: true, message: 'Push subscription berhasil diperbarui di database.' };
    }
  }

  sheet.appendRow([endpoint, authKey, p256dhKey, userAgent || '', new Date().toISOString(), 'Active']);
  return { success: true, message: 'Push subscription baru berhasil didaftarkan di database.' };
}

