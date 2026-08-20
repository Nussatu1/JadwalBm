import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import Modal from './ui/Modal';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return;
    }

    // Check if dismissed before in this session
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed') === 'true';

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        // Show banner after 3 seconds of visiting
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // Check if iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIos && !deferredPrompt) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      setShowIosGuide(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  return (
    <>
      {/* Sleek Floating Install Banner */}
      {showBanner && (
        <div className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-40 animate-cf-modal">
          <div className="bg-[#0B0C0E] text-white p-3 rounded-[10px] shadow-2xl border border-white/15 flex items-center gap-3">
            {/* Logo Emblem */}
            <div className="w-10 h-10 rounded-[8px] bg-[#F6821F] p-2 flex items-center justify-center shrink-0">
              <img src="/favicon.svg" alt="BM" className="w-full h-full object-contain" />
            </div>

            {/* Info Text */}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white leading-tight truncate">
                Pasang Jadwal BM
              </p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5 leading-tight">
                Akses cepat dari layar utama HP
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="h-7 px-3 bg-[#F6821F] hover:bg-[#DB6E0F] active:bg-[#C25B08] text-white text-[12px] font-medium rounded-[5px] transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-7 h-7 flex items-center justify-center text-[#9CA3AF] hover:text-white rounded-[5px] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Installation Guide Modal */}
      <Modal
        isOpen={showIosGuide}
        onClose={() => setShowIosGuide(false)}
        title="Pasang di Layar Utama HP"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center py-1">
          <div className="w-14 h-14 rounded-[14px] bg-[#F6821F] p-3 mx-auto flex items-center justify-center shadow-lg">
            <img src="/favicon.svg" alt="BM" className="w-full h-full object-contain" />
          </div>

          <div className="space-y-1">
            <h3 className="text-[15px] font-semibold text-[#0B0C0E]">
              Jadwal Acara Bakid Multimedia
            </h3>
            <p className="text-[12px] text-[#6B7280]">
              Untuk menginstall di iPhone / iPad (Safari):
            </p>
          </div>

          <div className="p-3 bg-[#F6F6F7] rounded-[8px] border border-[#E5E7EB] text-left text-[12px] text-[#374151] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#0B0C0E] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <span>Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline text-[#2E7DD1]" /> di bilah navigasi Safari.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#0B0C0E] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <span>Pilih opsi <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#0B0C0E] font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <span>Ketuk <strong>Tambah</strong> di pojok kanan atas.</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowIosGuide(false)}
            className="w-full h-9 bg-[#F6821F] text-white text-[13px] font-medium rounded-[6px] hover:bg-[#DB6E0F] transition-colors"
          >
            Mengerti
          </button>
        </div>
      </Modal>
    </>
  );
}
