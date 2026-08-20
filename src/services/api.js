/**
 * API SERVICE FOR GOOGLE APPS SCRIPT WEB APP
 * Dengan fallback otomatis ke Local Storage jika URL backend belum dikonfigurasi.
 */

const GAS_API_URL = import.meta.env.VITE_GAS_API_URL || '';

// Mock Data Awal jika URL GAS belum disetting
const INITIAL_DEMO_EVENTS = [
  {
    id: 'demo-event-1',
    nama_acara: 'Pengajian Akbar & Haflah Ikhtitam',
    kategori: 'Pengajian',
    tanggal: new Date().toISOString().split('T')[0], // Hari ini
    jam_mulai: '08:30',
    jam_selesai: '12:00',
    lokasi_nama: 'Aula Utama Ponpes Miftahul Ulum Bakid',
    lokasi_url: 'https://maps.google.com/?q=Pondok+Pesantren+Miftahul+Ulum+Bakid',
    deskripsi: 'Live streaming YouTube 3 kamera, audio direct dari mixer masjid, dokumentasi foto untuk website.',
    anggota_diutus: 'Fulan Multimedia, Ahmad Editor, Zaid Fotografer',
    alat_media: 'Sony A7III, Blackmagic ATEM Mini, Mic Wireless Hollyland, Tripod Fluid Head',
    status: 'Berlangsung',
    link_dokumentasi: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-event-2',
    nama_acara: 'Wisuda Santri & Pelepasan Alumni',
    kategori: 'Wisuda',
    tanggal: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Besok
    jam_mulai: '07:00',
    jam_selesai: '13:00',
    lokasi_nama: 'Gedung Serbaguna Bakid',
    lokasi_url: 'https://maps.google.com/?q=Gedung+Serbaguna',
    deskripsi: 'Liputan video cinematic aftermovie wisuda + drone aerial shot + photo booth alumni.',
    anggota_diutus: 'Fulan Multimedia, Zaid Fotografer',
    alat_media: 'DJI Mini 3 Pro, Sony FX30, Godox Lighting, Monitor Feelworld',
    status: 'Terjadwal',
    link_dokumentasi: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-event-3',
    nama_acara: 'Kajian Rutin Malam Jumat',
    kategori: 'Kajian',
    tanggal: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    jam_mulai: '19:30',
    jam_selesai: '21:30',
    lokasi_nama: 'Masjid Jami Bakid',
    lokasi_url: 'https://maps.google.com/?q=Masjid+Jami',
    deskripsi: 'Live streaming Facebook & YouTube channel official.',
    anggota_diutus: 'Ahmad Editor',
    alat_media: 'Sony A6400, Capture Card Cam Link 4K, Laptop Streaming',
    status: 'Terjadwal',
    link_dokumentasi: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_DEMO_ANGGOTA = [
  { id: 'ang-1', nama: 'Fulan Multimedia', peran: 'Videografer & Drone', aktif: true },
  { id: 'ang-2', nama: 'Ahmad Editor', peran: 'Streaming Operator & Editor', aktif: true },
  { id: 'ang-3', nama: 'Zaid Fotografer', peran: 'Fotografer & Desain', aktif: true },
  { id: 'ang-4', nama: 'Umar Audio', peran: 'Audio Engineer', aktif: true }
];

// Helper LocalStorage Storage Manager
function getLocalData(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// Inisialisasi Mock Data jika belum ada
if (!localStorage.getItem('bakid_events_mock')) {
  setLocalData('bakid_events_mock', INITIAL_DEMO_EVENTS);
}
if (!localStorage.getItem('bakid_anggota_mock')) {
  setLocalData('bakid_anggota_mock', INITIAL_DEMO_ANGGOTA);
}
if (!localStorage.getItem('bakid_config_mock')) {
  setLocalData('bakid_config_mock', {
    admin_password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    whatsapp_group_link: import.meta.env.VITE_DEFAULT_WA_GROUP || 'https://chat.whatsapp.com/'
  });
}

/**
 * Eksekusi GET ke GAS Web App
 */
async function fetchGasGet(action, params = {}) {
  const query = new URLSearchParams({ action, ...params }).toString();
  const url = `${GAS_API_URL}?${query}`;

  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    headers: { 'Accept': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Eksekusi POST ke GAS Web App
 */
async function fetchGasPost(action, body = {}) {
  const payload = { action, ...body };

  // Catatan: GAS Web App memerlukan mode no-cors jika fetch biasa atau POST payload plain text / text/plain untuk bypass preflight OPTIONS
  const response = await fetch(GAS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

export const api = {
  isConfigured() {
    return Boolean(GAS_API_URL && GAS_API_URL.startsWith('https://script.google.com'));
  },

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  async validatePassword(passwordHash) {
    if (this.isConfigured()) {
      return await fetchGasPost('validateAdminPassword', { passwordHash });
    }

    // Mock Mode
    const config = getLocalData('bakid_config_mock', {});
    if (passwordHash === config.admin_password_hash) {
      return {
        success: true,
        message: 'Login Admin Berhasil (Demo Mode)!',
        data: {
          token: 'DEMO_ADMIN_SESSION_' + Date.now(),
          role: 'admin'
        }
      };
    } else {
      return {
        success: false,
        message: 'Password admin salah!',
        data: null
      };
    }
  },

  // ==========================================
  // EVENTS API
  // ==========================================
  async getEvents() {
    if (this.isConfigured()) {
      return await fetchGasGet('getEvents');
    }

    // Mock Mode
    const events = getLocalData('bakid_events_mock', INITIAL_DEMO_EVENTS);
    return {
      success: true,
      message: 'Berhasil memuat acara (Demo Mode)',
      data: events
    };
  },

  async createEvent(eventData, authToken) {
    if (this.isConfigured()) {
      return await fetchGasPost('createEvent', { data: eventData, authToken });
    }

    // Mock Mode
    const events = getLocalData('bakid_events_mock', []);
    const newEvent = {
      ...eventData,
      id: 'event_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    events.unshift(newEvent);
    setLocalData('bakid_events_mock', events);

    return {
      success: true,
      message: 'Acara berhasil ditambahkan!',
      data: { id: newEvent.id }
    };
  },

  async updateEvent(id, eventData, authToken) {
    if (this.isConfigured()) {
      return await fetchGasPost('updateEvent', { id, data: eventData, authToken });
    }

    // Mock Mode
    const events = getLocalData('bakid_events_mock', []);
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = {
        ...events[index],
        ...eventData,
        updated_at: new Date().toISOString()
      };
      setLocalData('bakid_events_mock', events);
      return { success: true, message: 'Acara berhasil diperbarui!', data: { id } };
    }
    return { success: false, message: 'Acara tidak ditemukan', data: null };
  },

  async deleteEvent(id, authToken) {
    if (this.isConfigured()) {
      return await fetchGasPost('deleteEvent', { id, authToken });
    }

    // Mock Mode
    const events = getLocalData('bakid_events_mock', []);
    const filtered = events.filter(e => e.id !== id);
    setLocalData('bakid_events_mock', filtered);
    return { success: true, message: 'Acara berhasil dihapus!', data: { id } };
  },

  async cancelEvent(id, authToken) {
    return await this.updateEvent(id, { status: 'Batal' }, authToken);
  },

  // ==========================================
  // MASTER ANGGOTA API
  // ==========================================
  async getAnggota() {
    if (this.isConfigured()) {
      return await fetchGasGet('getAnggota');
    }

    // Mock Mode
    const anggota = getLocalData('bakid_anggota_mock', INITIAL_DEMO_ANGGOTA);
    return {
      success: true,
      message: 'Berhasil memuat data anggota (Demo Mode)',
      data: anggota
    };
  },

  async createAnggota(anggotaData, authToken) {
    if (this.isConfigured()) {
      return await fetchGasPost('createAnggota', { data: anggotaData, authToken });
    }

    // Mock Mode
    const list = getLocalData('bakid_anggota_mock', []);
    const newAnggota = {
      ...anggotaData,
      id: 'ang_' + Date.now(),
      aktif: anggotaData.aktif !== undefined ? anggotaData.aktif : true
    };
    list.push(newAnggota);
    setLocalData('bakid_anggota_mock', list);
    return { success: true, message: 'Anggota berhasil ditambahkan!', data: newAnggota };
  },

  async updateAnggota(id, data, authToken) {
    if (this.isConfigured()) {
      return await fetchGasPost('updateAnggota', { id, data, authToken });
    }

    // Mock Mode
    const list = getLocalData('bakid_anggota_mock', []);
    const index = list.findIndex(a => a.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...data };
      setLocalData('bakid_anggota_mock', list);
      return { success: true, message: 'Anggota diperbarui!', data: { id } };
    }
    return { success: false, message: 'Anggota tidak ditemukan', data: null };
  },

  async deleteAnggota(id, authToken) {
    if (this.isConfigured()) {
      return await fetchGasPost('deleteAnggota', { id, authToken });
    }

    // Mock Mode
    const list = getLocalData('bakid_anggota_mock', []);
    const filtered = list.filter(a => a.id !== id);
    setLocalData('bakid_anggota_mock', filtered);
    return { success: true, message: 'Anggota dihapus!', data: { id } };
  },

  // ==========================================
  // CONFIG API
  // ==========================================
  async getConfig() {
    if (this.isConfigured()) {
      return await fetchGasGet('getConfig');
    }

    // Mock Mode
    const config = getLocalData('bakid_config_mock', {
      whatsapp_group_link: 'https://chat.whatsapp.com/'
    });
    return {
      success: true,
      message: 'Config loaded',
      data: config
    };
  },

  async updateConfig(configData, authToken) {
    if (this.isConfigured()) {
      return await fetchGasPost('updateConfig', { data: configData, authToken });
    }

    // Mock Mode
    const current = getLocalData('bakid_config_mock', {});
    if (configData.new_password_hash) {
      current.admin_password_hash = configData.new_password_hash;
    }
    if (configData.whatsapp_group_link) {
      current.whatsapp_group_link = configData.whatsapp_group_link;
    }
    setLocalData('bakid_config_mock', current);
    return { success: true, message: 'Pengaturan berhasil disimpan!', data: null };
  }
};
