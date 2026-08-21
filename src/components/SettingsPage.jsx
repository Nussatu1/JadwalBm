import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Key, 
  Save, 
  RefreshCw, 
  User, 
  LogOut, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Send,
  Volume2,
  Radio,
  ChevronDown,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { api } from '../services/api';
import { sha256 } from '../utils/crypto';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  requestNotificationPermission, 
  showSystemNotification,
  playCustomAudioNotification,
  subscribeUserToPush,
  broadcastTestNotificationToAll
} from '../utils/notificationService';

export default function SettingsPage() {
  const { isAdmin, loginAdmin, logout, teamMemberName, setPersonalName } = useAuth();
  const { config, updateConfig, showToast, refreshing, loadData, anggota } = useEvents();

  // Notification Settings State
  const [notifSettings, setNotifSettings] = useState(getNotificationSettings);
  const [permissionStatus, setPermissionStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  // Profile / Custom Name State
  const [customName, setCustomName] = useState(teamMemberName || '');

  // Admin Login inline form
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Settings Save State
  const [waLink, setWaLink] = useState(config?.whatsapp_group_link || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Accordion Expand/Collapse States (all cleanly collapsed by default)
  const [isNotifExpanded, setIsNotifExpanded] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

  useEffect(() => {
    if (config?.whatsapp_group_link) {
      setWaLink(config.whatsapp_group_link);
    }
  }, [config]);

  // Handle Master Push Notification Toggle
  const handleToggleMasterNotif = async () => {
    if (!notifSettings.enabled) {
      const res = await requestNotificationPermission();
      setPermissionStatus(res.status);
      if (res.granted) {
        const updated = { ...notifSettings, enabled: true };
        setNotifSettings(updated);
        saveNotificationSettings(updated);
        
        // Register VAPID Web Push Subscription on Cloudflare Server
        subscribeUserToPush();

        showToast('Notifikasi push HP berhasil diaktifkan!', 'success');
        showSystemNotification(
          '🔔 Notifikasi Jadwal BM Aktif',
          'Anda akan menerima pengingat H-1, saat acara mulai, dan saat acara selesai.'
        );
      } else {
        showToast('Izin notifikasi tidak diberikan di browser/HP Anda.', 'error');
      }
    } else {
      const updated = { ...notifSettings, enabled: false };
      setNotifSettings(updated);
      saveNotificationSettings(updated);
      showToast('Notifikasi push dinonaktifkan.', 'info');
    }
  };

  const handleToggleSetting = (key) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTestNotification = async () => {
    const res = await requestNotificationPermission();
    if (res.granted) {
      showSystemNotification(
        '🔔 Tes Notifikasi: Jadwal BM',
        'Notifikasi berhasil berfungsi di HP/perangkat Anda! Siap menerima pengingat jadwal liputan.'
      );
      showToast('Notifikasi percobaan telah dikirim!', 'success');
    } else {
      showToast('Gagal mengirim: Izinkan notifikasi di browser/HP Anda terlebih dahulu.', 'error');
    }
  };

  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const handleBroadcastTest = async () => {
    setBroadcastLoading(true);
    const res = await broadcastTestNotificationToAll();
    setBroadcastLoading(false);
    if (res.success) {
      showToast(res.message || 'Sinyal tes disiarkan ke seluruh anggota!', 'success');
    } else {
      showToast(res.message || 'Gagal menyiarkan tes notifikasi', 'error');
    }
  };

  const [syncingPush, setSyncingPush] = useState(false);
  const handleSyncPushToken = async () => {
    setSyncingPush(true);
    const res = await subscribeUserToPush();
    setSyncingPush(false);
    if (res.success) {
      showToast('Perangkat HP ini berhasil terdaftar di server push!', 'success');
    } else {
      showToast(res.message || 'Gagal mendaftarkan push', 'error');
    }
  };

  // Handle Save Team Member Profile
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setPersonalName(customName.trim());
    showToast(
      customName.trim()
        ? `Profil diset sebagai "${customName.trim()}".`
        : 'Nama profil direset.',
      'info'
    );
  };

  // Handle Inline Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) {
      showToast('Silakan masukkan password admin', 'error');
      return;
    }
    setLoginLoading(true);
    const res = await loginAdmin(adminPasswordInput);
    setLoginLoading(false);
    if (res.success) {
      showToast('Berhasil masuk sebagai Admin!', 'success');
      setAdminPasswordInput('');
    } else {
      showToast(res.message || 'Password salah', 'error');
    }
  };

  // Handle Save App Configuration (WhatsApp & New Password)
  const handleSaveAppConfig = async (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      showToast('Konfirmasi password baru tidak cocok!', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      whatsapp_group_link: waLink
    };

    if (newPassword) {
      payload.new_password = newPassword;
      payload.new_password_hash = await sha256(newPassword);
    }

    const res = await updateConfig(payload);
    setSubmitting(false);

    if (res.success) {
      setNewPassword('');
      setConfirmPassword('');
      showToast('Pengaturan berhasil disimpan!', 'success');
    }
  };

  const isConnected = api.isConfigured();

  return (
    <div className="space-y-3.5 max-w-2xl mx-auto pb-8 animate-cf-modal">
      {/* ── Page Header ── */}
      <div className="bg-white rounded-[10px] border border-[#E5E7EB] p-4 shadow-cf-card flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-bold text-[#0B0C0E] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#F6821F]" />
            <span>Pengaturan</span>
          </h2>
          <p className="text-[12px] text-[#6B7280] mt-0.5">
            Kelola notifikasi, profil penugasan, dan konfigurasi sistem.
          </p>
        </div>

        {isAdmin && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DB6E0F] bg-[#FFF5EA] border border-[#FBD6B0] px-2.5 py-1 rounded-[6px] shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F6821F]" />
            <span>Admin</span>
          </span>
        )}
      </div>

      {/* ── UNIFIED SETTINGS CONTAINER (DIPISAHKAN GARIS SEPERTI PENGATURAN MOBILE NATIVE) ── */}
      <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-cf-card overflow-hidden divide-y divide-[#E5E7EB]">
        {/* ── 1. NOTIFIKASI PUSH OTOMATIS ── */}
        <div>
          {/* Accordion Row Trigger */}
          <div
            onClick={() => setIsNotifExpanded(!isNotifExpanded)}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-2 text-left hover:bg-[#F9FAFB] transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-[7px] bg-[#FFF5EA] text-[#F6821F] flex items-center justify-center shrink-0 border border-[#FBD6B0]/60 shadow-2xs">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13.5px] font-semibold text-[#0B0C0E] truncate">
                  Notifikasi Push Otomatis
                </h3>
                <p className="text-[11px] text-[#6B7280] truncate">
                  Pengingat di layar HP tanpa perlu buka web
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMasterNotif();
                }}
                className={`h-6.5 px-2.5 rounded-[5px] text-[11.5px] font-semibold transition-colors ${
                  notifSettings.enabled
                    ? 'bg-[#0F9D58] hover:bg-[#0B8043] text-white shadow-2xs'
                    : 'bg-[#F3F4F6] border border-[#E5E7EB] text-[#6B7280] hover:text-[#0B0C0E]'
                }`}
              >
                {notifSettings.enabled ? 'Aktif' : 'Nonaktif'}
              </button>

              <ChevronDown 
                className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${
                  isNotifExpanded ? 'rotate-180 text-[#0B0C0E]' : ''
                }`} 
              />
            </div>
          </div>

          {/* Content Body */}
          {isNotifExpanded && (
            <div className="p-4 pt-3.5 space-y-3.5 border-t border-[#E5E7EB] bg-[#FAFAFA]/50">
              {/* Sub-toggles */}
              <div className="space-y-2">
                {/* H-1 */}
                <label className="flex items-center justify-between p-2 rounded-[6px] hover:bg-white transition-colors cursor-pointer group border border-transparent hover:border-[#E5E7EB]">
                  <div className="space-y-0.5">
                    <p className="text-[12.5px] font-medium text-[#0B0C0E] group-hover:text-[#F6821F] transition-colors">
                      Pengingat H-1 (Besok Ada Acara)
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      Dikirimkan 1 hari sebelum agenda liputan dimulai
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!notifSettings.enabled}
                    checked={notifSettings.notifyHMinus1}
                    onChange={() => handleToggleSetting('notifyHMinus1')}
                    className="w-4 h-4 accent-[#F6821F] cursor-pointer disabled:opacity-40"
                  />
                </label>

                {/* Start Event */}
                <label className="flex items-center justify-between p-2 rounded-[6px] hover:bg-white transition-colors cursor-pointer group border border-transparent hover:border-[#E5E7EB]">
                  <div className="space-y-0.5">
                    <p className="text-[12.5px] font-medium text-[#0B0C0E] group-hover:text-[#F6821F] transition-colors">
                      Acara Hari Ini Mulai (On-Air)
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      Dikirim saat jam mulai acara telah tiba di hari H
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!notifSettings.enabled}
                    checked={notifSettings.notifyEventStart}
                    onChange={() => handleToggleSetting('notifyEventStart')}
                    className="w-4 h-4 accent-[#F6821F] cursor-pointer disabled:opacity-40"
                  />
                </label>

                {/* End Event */}
                <label className="flex items-center justify-between p-2 rounded-[6px] hover:bg-white transition-colors cursor-pointer group border border-transparent hover:border-[#E5E7EB]">
                  <div className="space-y-0.5">
                    <p className="text-[12.5px] font-medium text-[#0B0C0E] group-hover:text-[#F6821F] transition-colors">
                      Acara Selesai (Manual / Sesuai Jam)
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      Dikirim saat acara ditandai selesai atau melewati jam selesai
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!notifSettings.enabled}
                    checked={notifSettings.notifyEventEnd}
                    onChange={() => handleToggleSetting('notifyEventEnd')}
                    className="w-4 h-4 accent-[#F6821F] cursor-pointer disabled:opacity-40"
                  />
                </label>

                {/* Custom Sound Toggle */}
                <label className="flex items-center justify-between p-2 rounded-[6px] hover:bg-white transition-colors cursor-pointer group border border-transparent hover:border-[#E5E7EB] pt-2 border-t border-[#F3F4F6]">
                  <div className="space-y-0.5">
                    <p className="text-[12.5px] font-medium text-[#0B0C0E] group-hover:text-[#F6821F] transition-colors flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-[#F6821F]" />
                      <span>Gunakan Nada Kustom (notif.mp3)</span>
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      Memutar audio notif.mp3 khusus saat notifikasi masuk
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!notifSettings.enabled}
                    checked={notifSettings.customAudio !== false}
                    onChange={() => handleToggleSetting('customAudio')}
                    className="w-4 h-4 accent-[#F6821F] cursor-pointer disabled:opacity-40"
                  />
                </label>
              </div>

              {/* Pusat Uji Coba & Sinkronisasi */}
              <div className="pt-3 border-t border-[#E5E7EB] space-y-2">
                <p className="text-[10.5px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Uji Coba &amp; Sinkronisasi
                </p>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {/* 1. Daftar HP */}
                  <button
                    type="button"
                    onClick={handleSyncPushToken}
                    disabled={syncingPush}
                    className="h-9 px-1.5 rounded-[8px] border border-[#FBD6B0] bg-[#FFF5EA] hover:bg-[#FFE8CC] active:bg-[#FBD6B0] active:scale-[0.97] text-[#DB6E0F] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 select-none"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 shrink-0 text-[#F6821F] ${syncingPush ? 'animate-spin' : ''}`} />
                    <span className="text-[11px] font-semibold truncate">
                      {syncingPush ? 'Mendaftar...' : 'Daftar HP'}
                    </span>
                  </button>

                  {/* 2. Tes Audio */}
                  <button
                    type="button"
                    onClick={() => {
                      playCustomAudioNotification();
                      showToast('Memutar suara notif.mp3 🔊', 'info');
                    }}
                    className="h-9 px-1.5 rounded-[8px] border border-[#E5E7EB] bg-white hover:bg-[#F6F6F7] active:bg-[#E5E7EB] active:scale-[0.97] text-[#374151] flex items-center justify-center gap-1.5 transition-all select-none"
                  >
                    <Volume2 className="w-3.5 h-3.5 shrink-0 text-[#0F9D58]" />
                    <span className="text-[11px] font-medium truncate">Tes Audio</span>
                  </button>

                  {/* 3. Tes Notif */}
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="h-9 px-1.5 rounded-[8px] border border-[#E5E7EB] bg-white hover:bg-[#F6F6F7] active:bg-[#E5E7EB] active:scale-[0.97] text-[#374151] flex items-center justify-center gap-1.5 transition-all select-none"
                  >
                    <Send className="w-3.5 h-3.5 shrink-0 text-[#2E7DD1]" />
                    <span className="text-[11px] font-medium truncate">Tes Notif</span>
                  </button>
                </div>

                {/* Admin Broadcast Button */}
                {isAdmin && (
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={handleBroadcastTest}
                      disabled={broadcastLoading}
                      className="w-full h-9 px-4 bg-[#0B0C0E] hover:bg-[#27272A] active:bg-[#18181B] active:scale-[0.99] text-white text-[11.5px] font-semibold rounded-[8px] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Radio className={`w-3.5 h-3.5 text-[#F6821F] ${broadcastLoading ? 'animate-pulse' : ''}`} />
                      <span>{broadcastLoading ? 'Menyiarkan...' : 'Siarkan Tes ke Semua Anggota'}</span>
                    </button>
                    <p className="text-[10.5px] text-[#6B7280] text-center">
                      Mengirim push serentak ke semua perangkat terdaftar.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── 2. PROFIL TIM & AKSES ADMIN ── */}
        <div>
          {/* Accordion Row Trigger */}
          <div
            onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-2 text-left hover:bg-[#F9FAFB] transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-[7px] bg-[#EEF6FF] text-[#2E7DD1] flex items-center justify-center shrink-0 border border-[#C8E0FB] shadow-2xs">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13.5px] font-semibold text-[#0B0C0E] truncate">
                  Status & Personalisasi Profil
                </h3>
                <p className="text-[11px] text-[#6B7280] truncate">
                  {isAdmin ? 'Hak Akses Admin Aktif' : 'Mode Anggota Tim / Penonton'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DB6E0F] bg-[#FFF5EA] border border-[#FBD6B0] px-2 py-0.5 rounded-[5px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F6821F]" />
                  <span>Admin</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] px-2 py-0.5 rounded-[5px]">
                  Anggota
                </span>
              )}

              <ChevronDown 
                className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${
                  isProfileExpanded ? 'rotate-180 text-[#0B0C0E]' : ''
                }`} 
              />
            </div>
          </div>

          {/* Content Body */}
          {isProfileExpanded && (
            <div className="p-4 pt-3.5 space-y-3.5 border-t border-[#E5E7EB] bg-[#FAFAFA]/50">
              {/* Set Profil Tim */}
              <form onSubmit={handleSaveProfile} className="space-y-1.5">
                <label className="block text-[12px] font-medium text-[#0B0C0E]">
                  Nama Anda (Personalisasi Profil)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    list="settings-member-suggestions"
                    placeholder="Pilih atau ketik nama Anda..."
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    className="flex-1 h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[12.5px] text-[#0B0C0E] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
                  />
                  <datalist id="settings-member-suggestions">
                    {anggota.map(a => (
                      <option key={a.id} value={a.nama} />
                    ))}
                  </datalist>
                  <button
                    type="submit"
                    className="h-9 px-4 bg-[#F6821F] hover:bg-[#DB6E0F] text-white text-[12px] font-semibold rounded-[6px] transition-colors shadow-2xs shrink-0"
                  >
                    Simpan
                  </button>
                </div>
              </form>

              {/* Login Admin (Hanya tampil jika belum login) */}
              {!isAdmin && (
                <form onSubmit={handleAdminLogin} className="pt-3 border-t border-[#E5E7EB] space-y-1.5">
                  <label className="block text-[12px] font-medium text-[#0B0C0E]">
                    Masuk sebagai Admin
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        placeholder="Masukkan password admin..."
                        value={adminPasswordInput}
                        onChange={e => setAdminPasswordInput(e.target.value)}
                        className="w-full h-9 pl-3 pr-8 bg-white border border-[#E5E7EB] rounded-[6px] text-[12.5px] text-[#0B0C0E] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0B0C0E] p-1"
                      >
                        {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="h-9 px-4 bg-[#0B0C0E] hover:bg-[#27272A] text-white text-[12px] font-semibold rounded-[6px] transition-colors disabled:opacity-50 shrink-0"
                    >
                      {loginLoading ? 'Memverifikasi...' : 'Login Admin'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* ── 3. KONFIGURASI WHATSAPP & PASSWORD (ADMIN ONLY) ── */}
        {isAdmin && (
          <div>
            {/* Accordion Row Trigger */}
            <div
              onClick={() => setIsConfigExpanded(!isConfigExpanded)}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-2 text-left hover:bg-[#F9FAFB] transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-[7px] bg-[#EBF9F1] text-[#0F9D58] flex items-center justify-center shrink-0 border border-[#B7EBD0] shadow-2xs">
                  <Key className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[13.5px] font-semibold text-[#0B0C0E] truncate">
                    Konfigurasi WhatsApp & Password Admin
                  </h3>
                  <p className="text-[11px] text-[#6B7280] truncate">
                    Ubah tautan grup WA dan perbarui kata sandi admin
                  </p>
                </div>
              </div>

              <div className="shrink-0 ml-2">
                <ChevronDown 
                  className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${
                    isConfigExpanded ? 'rotate-180 text-[#0B0C0E]' : ''
                  }`} 
                />
              </div>
            </div>

            {/* Form Body */}
            {isConfigExpanded && (
              <form onSubmit={handleSaveAppConfig} className="p-4 pt-3.5 space-y-3.5 border-t border-[#E5E7EB] bg-[#FAFAFA]/50">
                {/* Link Grup WA */}
                <div className="space-y-1">
                  <label className="block text-[12px] font-medium text-[#0B0C0E] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#0F9D58]" />
                    <span>Link Grup WhatsApp Bakid Multimedia</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://chat.whatsapp.com/..."
                    value={waLink}
                    onChange={e => setWaLink(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[12px] font-mono text-[#0B0C0E] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
                  />
                </div>

                {/* Ganti Password */}
                <div className="pt-3 border-t border-[#E5E7EB] space-y-2.5">
                  <label className="block text-[12px] font-medium text-[#0B0C0E]">
                    Ganti Password Admin (Opsional)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Password baru (kosongkan jika tidak diubah)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full h-9 pl-3 pr-8 bg-white border border-[#E5E7EB] rounded-[6px] text-[12.5px] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0B0C0E] p-1"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Konfirmasi password baru"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full h-9 pl-3 pr-8 bg-white border border-[#E5E7EB] rounded-[6px] text-[12.5px] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0B0C0E] p-1"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-8.5 px-4 bg-[#F6821F] hover:bg-[#DB6E0F] active:bg-[#C25B08] text-white text-[12px] font-semibold rounded-[6px] flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Menyimpan...' : 'Simpan Konfigurasi'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── 4. STATUS KONEKSI BACKEND & SINKRONISASI ── */}
        <div className="p-3.5 sm:p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[13px] font-semibold text-[#0B0C0E]">
              {isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-[#0F9D58]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#F6821F]" />
              )}
              <span>Status Koneksi Cloud Backend</span>
            </div>
            <button
              type="button"
              onClick={() => loadData(true)}
              className="h-7 px-2.5 bg-[#F6F6F7] hover:bg-[#E5E7EB] text-[#0B0C0E] rounded-[5px] border border-[#E5E7EB] text-[11px] font-medium flex items-center gap-1 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-[#F6821F]' : ''}`} />
              <span>Sync Data</span>
            </button>
          </div>
          <p className="text-[11.5px] text-[#6B7280]">
            {isConnected
              ? 'Terhubung aman dengan Google Apps Script & Google Sheets melalui Cloudflare Edge Proxy.'
              : 'Mode Demo / Offline (Local Storage).'}
          </p>
        </div>
      </div>

      {/* ── 5. TOMBOL LOGOUT ADMIN (STANDALONE DI PALING BAWAH) ── */}
      {isAdmin && (
        <div className="pt-2">
          <button
            type="button"
            onClick={logout}
            className="w-full h-11 px-4 bg-white hover:bg-[#FEF2F2] active:bg-[#FEE2E2] text-[#DC2626] hover:text-[#B91C1C] border border-[#FCA5A5] rounded-[10px] text-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs group"
          >
            <div className="w-6 h-6 rounded-full bg-[#FEE2E2] group-hover:bg-[#FECACA] flex items-center justify-center transition-colors">
              <LogOut className="w-3.5 h-3.5 text-[#DC2626]" />
            </div>
            <span>Keluar dari Hak Akses Admin</span>
          </button>
        </div>
      )}
    </div>
  );
}
