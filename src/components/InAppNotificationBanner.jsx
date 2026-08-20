import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export default function InAppNotificationBanner() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleInAppNotif = (e) => {
      if (e.detail) {
        setNotification({
          id: Date.now(),
          title: e.detail.title,
          body: e.detail.body
        });
      }
    };

    window.addEventListener('in-app-notification', handleInAppNotif);
    return () => {
      window.removeEventListener('in-app-notification', handleInAppNotif);
    };
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-[72px] left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-40 animate-cf-modal">
      <div className="bg-[#0B0C0E] text-white p-3.5 rounded-[10px] shadow-2xl border border-white/15 flex items-start gap-3">
        {/* Logo Emblem */}
        <div className="w-9 h-9 rounded-[7px] bg-[#F6821F] p-1.5 flex items-center justify-center shrink-0 shadow">
          <img src="/favicon.svg" alt="BM" className="w-full h-full object-contain" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F9D58] animate-pulse" />
            <h4 className="text-[13px] font-semibold text-white leading-tight truncate">
              {notification.title}
            </h4>
          </div>
          <p className="text-[11.5px] text-[#D1D5DB] leading-snug">
            {notification.body}
          </p>
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={() => setNotification(null)}
          className="w-6 h-6 flex items-center justify-center text-[#9CA3AF] hover:text-white rounded transition-colors -mr-1"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
