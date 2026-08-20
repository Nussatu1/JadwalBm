import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Custom Centered Modal Component
 * - Mobile & Desktop: Centered popup in middle of screen (prevents mobile keyboard obstruction)
 * - Cloudflare Design: Rounded corners, #E5E7EB border, soft shadow, clean close button
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-md',
  showClose = true
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-150">
      {/* Backdrop tap to close */}
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Centered Modal Container */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white rounded-[10px] sm:rounded-[8px] border border-[#E5E7EB] shadow-cf-modal max-h-[88vh] flex flex-col overflow-hidden animate-cf-modal`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
            <div className="min-w-0 flex-1 pr-2">
              {title && (
                <div className="text-[15px] sm:text-[16px] font-semibold text-[#0B0C0E] leading-tight truncate">
                  {title}
                </div>
              )}
              {subtitle && (
                <p className="text-[12px] text-[#6B7280] mt-0.5 truncate">
                  {subtitle}
                </p>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="w-7 h-7 flex items-center justify-center text-[#6B7280] hover:text-[#0B0C0E] hover:bg-[#F6F6F7] rounded-[4px] transition-colors shrink-0 -mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 text-[13px]">
          {children}
        </div>
      </div>
    </div>
  );
}
