import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useEvents } from '../../context/EventContext';

/**
 * Custom Toast Component
 * Replaces native window.alert() with elegant auto-dismiss snackbar
 */
export default function Toast() {
  const { toast, hideToast } = useEvents();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#0F9D58] shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[#E5484D] shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-[#2E7DD1] shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-4 border-l-[#0F9D58]';
      case 'error':
        return 'border-l-4 border-l-[#E5484D]';
      default:
        return 'border-l-4 border-l-[#2E7DD1]';
    }
  };

  return (
    <div className="fixed top-3 right-3 left-3 sm:left-auto sm:w-80 z-50 animate-cf-modal">
      <div className={`bg-white border border-[#E5E7EB] shadow-cf-dropdown rounded-[6px] p-3 flex items-start gap-2.5 ${getBorderColor()}`}>
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 text-[13px] text-[#0B0C0E] font-medium leading-snug">
          {toast.message}
        </div>
        <button
          onClick={hideToast}
          aria-label="Tutup notifikasi"
          className="text-[#9CA3AF] hover:text-[#0B0C0E] p-0.5 rounded-[4px] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
