import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  CalendarDays,
  CheckCircle2,
  SearchX,
  RotateCcw
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useEvents } from './context/EventContext';
import Header from './components/Header';
import NotificationBanner from './components/NotificationBanner';
import EventCard from './components/EventCard';
import CalendarView from './components/CalendarView';
import MemberManagement from './components/MemberManagement';
import EventFormPage from './components/EventFormPage';
import SettingsPage from './components/SettingsPage';
import EventDetailModal from './components/EventDetailModal';
import LoginModal from './components/LoginModal';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import SplashScreen from './components/SplashScreen';
import InstallPrompt from './components/InstallPrompt';
import InAppNotificationBanner from './components/InAppNotificationBanner';
import {
  checkAndTriggerEventNotifications,
  subscribeUserToPush,
  initAudioUnlock,
  registerSWMessageListener
} from './utils/notificationService';

export default function App() {
  const { isAdmin } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const { 
    events,
    filteredEvents, 
    loading, 
    searchQuery, 
    setSearchQuery,
    hideCompleted,
    setHideCompleted
  } = useEvents();

  // Active view tab: 'calendar' | 'list' | 'tambah' | 'anggota' | 'pengaturan'
  const [activeTab, setActiveTab] = useState('calendar');

  // Modals & Navigation state
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Inisialisasi audio unlock + SW message listener saat app pertama dimuat
  useEffect(() => {
    initAudioUnlock();
    registerSWMessageListener();
  }, []);

  // Auto-register Push Subscription only on mobile (avoids Chrome PC AbortError)
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (
      isMobile &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      const timer = setTimeout(() => {
        subscribeUserToPush().catch(() => {});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Background Push Notification Periodic Checker (Every 60s)
  useEffect(() => {
    if (events && events.length > 0) {
      checkAndTriggerEventNotifications(events);
    }
    const interval = setInterval(() => {
      if (events && events.length > 0) {
        checkAndTriggerEventNotifications(events);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [events]);

  const handleOpenCreateEvent = () => {
    setEditingEvent(null);
    setActiveTab('tambah');
  };

  const handleOpenEditEvent = (event) => {
    setEditingEvent(event);
    setActiveTab('tambah');
  };

  const handleSelectEvent = (event) => {
    setSelectedEventForDetail(event);
  };

  const handleFormSuccess = () => {
    setEditingEvent(null);
    setActiveTab('list');
  };

  const handleFormCancel = () => {
    setEditingEvent(null);
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7] text-[#0B0C0E] pb-20 sm:pb-24">
      {/* Opening / Splash Screen Animation */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} duration={2000} />
      )}

      {/* In-App Visual Floating Push Notification Banner */}
      <InAppNotificationBanner />

      {/* PWA Install Banner */}
      <InstallPrompt />

      {/* Toast Notification Container */}
      <Toast />

      {/* Header */}
      <Header
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 space-y-3">
        {/* Tab 1: DAFTAR */}
        {activeTab === 'list' && (
          <div className="space-y-2.5">
            {/* Minimalist Live Event Banner (Only pinned on Tab Daftar) */}
            <NotificationBanner onSelectEvent={handleSelectEvent} />

            {/* Search Bar & Actions */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari acara, lokasi, anggota, atau gear..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[13px] text-[#0B0C0E] focus:outline-none focus:border-[#F6821F] focus:ring-1 focus:ring-[#F6821F] shadow-cf-card"
                />
              </div>

              {/* Toggle Sembunyikan Acara Selesai */}
              <button
                type="button"
                onClick={() => setHideCompleted(!hideCompleted)}
                className={`h-9 px-2.5 rounded-[6px] border text-[12px] font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-cf-card ${
                  hideCompleted
                    ? 'bg-[#0B0C0E] border-[#0B0C0E] text-white'
                    : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:text-[#0B0C0E] hover:bg-[#F6F6F7]'
                }`}
                title={hideCompleted ? "Acara Selesai Disembunyikan (Klik untuk Tampilkan)" : "Klik untuk Sembunyikan Acara Selesai"}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${hideCompleted ? 'text-[#0F9D58]' : 'text-[#9CA3AF]'}`} />
                <span className="hidden sm:inline">{hideCompleted ? 'Selesai: Sembunyi' : 'Selesai: Tampil'}</span>
              </button>

              {/* Desktop Quick Add Button */}
              {isAdmin && (
                <button
                  onClick={handleOpenCreateEvent}
                  className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 bg-[#F6821F] hover:bg-[#DB6E0F] active:bg-[#C25B08] text-white text-[12px] font-medium rounded-[6px] transition-colors shrink-0 shadow-cf-card"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Acara</span>
                </button>
              )}
            </div>

            {/* Event List */}
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-[8px] p-3.5 border border-[#E5E7EB] animate-pulse space-y-2">
                    <div className="h-3.5 bg-[#E5E7EB] rounded w-1/4" />
                    <div className="h-4.5 bg-[#E5E7EB] rounded w-3/4" />
                    <div className="h-3 bg-[#E5E7EB] rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-8 text-center space-y-3 shadow-cf-card">
                {searchQuery ? (
                  <>
                    <div className="w-11 h-11 rounded-full bg-[#FFF5EA] border border-[#FBD6B0] text-[#F6821F] flex items-center justify-center mx-auto shadow-sm">
                      <SearchX className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-[#0B0C0E] text-[14px]">
                        Pencarian Tidak Ditemukan
                      </h3>
                      <p className="text-[12px] text-[#6B7280] max-w-xs mx-auto">
                        Tidak ada acara yang cocok dengan kata kunci <span className="font-semibold text-[#0B0C0E]">"{searchQuery}"</span>.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="inline-flex items-center gap-1.5 h-8 px-3 bg-white hover:bg-[#F6F6F7] text-[#0B0C0E] border border-[#E5E7EB] text-[12px] font-medium rounded-[6px] transition-colors shadow-cf-card"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
                        <span>Reset Pencarian</span>
                      </button>
                      {hideCompleted && (
                        <button
                          type="button"
                          onClick={() => setHideCompleted(false)}
                          className="inline-flex items-center gap-1 h-8 px-3 bg-white hover:bg-[#F6F6F7] text-[#0F9D58] border border-[#B7EBD0] text-[12px] font-medium rounded-[6px] transition-colors"
                        >
                          <span>Tampilkan Acara Selesai</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-11 h-11 rounded-full bg-[#F6F6F7] border border-[#E5E7EB] text-[#6B7280] flex items-center justify-center mx-auto shadow-sm">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-[#0B0C0E] text-[14px]">
                        Belum Ada Agenda Acara
                      </h3>
                      <p className="text-[12px] text-[#6B7280] max-w-xs mx-auto">
                        {hideCompleted 
                          ? 'Semua acara saat ini berstatus selesai.'
                          : 'Jadwal liputan tim multimedia belum ditambahkan.'}
                      </p>
                    </div>
                    {hideCompleted && (
                      <button
                        type="button"
                        onClick={() => setHideCompleted(false)}
                        className="inline-flex items-center gap-1 h-8 px-3 bg-white hover:bg-[#F6F6F7] text-[#0F9D58] border border-[#B7EBD0] text-[12px] font-medium rounded-[6px] transition-colors"
                      >
                        <span>Tampilkan Acara Selesai</span>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={handleOpenCreateEvent}
                        className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-[#F6821F] text-white text-[12px] font-medium rounded-[6px] hover:bg-[#DB6E0F] transition-colors shadow-cf-card"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Acara Baru</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onSelect={handleSelectEvent}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: KALENDER */}
        {activeTab === 'calendar' && (
          <CalendarView onSelectEvent={handleSelectEvent} />
        )}

        {/* Tab 3: TAMBAH ACARA */}
        {activeTab === 'tambah' && (
          <EventFormPage
            initialData={editingEvent}
            onCancel={handleFormCancel}
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Tab 4: ANGGOTA */}
        {activeTab === 'anggota' && (
          <MemberManagement />
        )}

        {/* Tab 5: PENGATURAN & NOTIFIKASI */}
        {activeTab === 'pengaturan' && (
          <SettingsPage />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={Boolean(selectedEventForDetail)}
        onClose={() => setSelectedEventForDetail(null)}
        event={selectedEventForDetail}
        onEdit={handleOpenEditEvent}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
