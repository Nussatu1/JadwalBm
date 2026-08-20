import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const { authToken, isAdmin, teamMemberName } = useAuth();

  const [events, setEvents] = useState([]);
  const [anggota, setAnggota] = useState([]);
  const [config, setConfig] = useState({ whatsapp_group_link: 'https://chat.whatsapp.com/' });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [hideCompleted, setHideCompletedState] = useState(() => {
    return localStorage.getItem('bakid_hide_completed') === 'true';
  });

  const setHideCompleted = (val) => {
    setHideCompletedState(val);
    localStorage.setItem('bakid_hide_completed', val ? 'true' : 'false');
  };

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  const hideToast = () => {
    setToast(null);
  };

  /**
   * Fetch all initial data
   */
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    setError(null);
    try {
      const [eventsRes, anggotaRes, configRes] = await Promise.allSettled([
        api.getEvents(),
        api.getAnggota(),
        api.getConfig()
      ]);

      if (eventsRes.status === 'fulfilled' && eventsRes.value.success) {
        setEvents(eventsRes.value.data || []);
      }
      if (anggotaRes.status === 'fulfilled' && anggotaRes.value.success) {
        setAnggota(anggotaRes.value.data || []);
      }
      if (configRes.status === 'fulfilled' && configRes.value.success) {
        setConfig(configRes.value.data || { whatsapp_group_link: 'https://chat.whatsapp.com/' });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Gagal memuat data dari server. Menampilkan data lokal.');
      showToast('Gagal memuat data dari server.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Events (Pencarian nama acara, lokasi, deskripsi, anggota, gear + Sembunyikan Selesai)
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // 1. Sembunyikan acara dengan status "Selesai" jika toggle dinyalakan
      if (hideCompleted && e.status === 'Selesai') {
        return false;
      }

      // 2. Pencarian Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (e.nama_acara || '').toLowerCase().includes(q);
        const matchLoc = (e.lokasi_nama || '').toLowerCase().includes(q);
        const matchDesc = (e.deskripsi || '').toLowerCase().includes(q);
        const matchAnggota = (e.anggota_diutus || '').toLowerCase().includes(q);
        const matchAlat = (e.alat_media || '').toLowerCase().includes(q);
        const matchKat = (e.kategori || '').toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchDesc && !matchAnggota && !matchAlat && !matchKat) {
          return false;
        }
      }

      return true;
    });
  }, [events, searchQuery, hideCompleted]);

  // ==========================================
  // EVENT CRUD ACTIONS
  // ==========================================
  const createEvent = async (eventData) => {
    try {
      const res = await api.createEvent(eventData, authToken);
      if (res.success) {
        showToast('Acara berhasil dibuat!', 'success');
        await loadData(true);
        return { success: true };
      } else {
        showToast(res.message || 'Gagal membuat acara', 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const updateEvent = async (id, eventData) => {
    try {
      const res = await api.updateEvent(id, eventData, authToken);
      if (res.success) {
        showToast('Acara berhasil diperbarui!', 'success');
        await loadData(true);
        return { success: true };
      } else {
        showToast(res.message || 'Gagal update acara', 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const deleteEvent = async (id) => {
    try {
      const res = await api.deleteEvent(id, authToken);
      if (res.success) {
        showToast('Acara berhasil dihapus!', 'success');
        await loadData(true);
        return { success: true };
      } else {
        showToast(res.message || 'Gagal menghapus acara', 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const cancelEvent = async (id) => {
    try {
      const res = await api.cancelEvent(id, authToken);
      if (res.success) {
        showToast('Status acara diubah menjadi Batal', 'info');
        await loadData(true);
        return { success: true };
      } else {
        showToast(res.message || 'Gagal membatalkan acara', 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const completeEvent = async (id) => {
    try {
      const res = await api.updateEvent(id, { status: 'Selesai' }, authToken);
      if (res.success) {
        showToast('Status acara diubah menjadi Selesai!', 'success');
        await loadData(true);
        return { success: true };
      } else {
        showToast(res.message || 'Gagal mengubah status acara', 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // ==========================================
  // ANGGOTA CRUD ACTIONS
  // ==========================================
  const createAnggota = async (anggotaData) => {
    try {
      const res = await api.createAnggota(anggotaData, authToken);
      if (res.success) {
        showToast('Anggota baru berhasil ditambahkan!', 'success');
        await loadData(true);
        return { success: true };
      } else {
        showToast(res.message || 'Gagal menambah anggota', 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const updateAnggota = async (id, data) => {
    try {
      const res = await api.updateAnggota(id, data, authToken);
      if (res.success) {
        showToast('Data anggota diperbarui!', 'success');
        await loadData(true);
        return { success: true };
      } else {
        showToast(res.message || 'Gagal update anggota', 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const deleteAnggota = async (id) => {
    try {
      const res = await api.deleteAnggota(id, authToken);
      if (res.success) {
        showToast('Anggota dihapus!', 'success');
        await loadData(true);
        return { success: true };
      } else {
        showToast(res.message || 'Gagal menghapus anggota', 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  // ==========================================
  // CONFIG ACTIONS
  // ==========================================
  const updateConfig = async (newConfigData) => {
    try {
      const res = await api.updateConfig(newConfigData, authToken);
      if (res.success) {
        showToast('Konfigurasi berhasil disimpan!', 'success');
        await loadData(true);
        return { success: true };
      } else {
        showToast(res.message || 'Gagal simpan konfigurasi', 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        filteredEvents,
        anggota,
        config,
        loading,
        refreshing,
        error,
        searchQuery,
        setSearchQuery,
        hideCompleted,
        setHideCompleted,
        toast,
        showToast,
        hideToast,
        loadData,
        createEvent,
        updateEvent,
        deleteEvent,
        cancelEvent,
        completeEvent,
        createAnggota,
        updateAnggota,
        deleteAnggota,
        updateConfig
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents harus digunakan di dalam EventProvider');
  }
  return context;
}
