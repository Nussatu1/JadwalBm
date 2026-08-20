import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Custom Modal & Mobile Bottom Sheet Component
 * - Mobile: Slides from bottom as Bottom Sheet with top pull-indicator
 * - Desktop: Centered card modal with 8px radius
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-150">
      {/* Backdrop tap to close */}
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      {/* Modal / Bottom Sheet Container */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white rounded-t-[16px] sm:rounded-[8px] border-t sm:border border-[#E5E7EB] shadow-cf-modal max-h-[90vh] flex flex-col overflow-hidden animate-cf-modal`}
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile Pull/Drag Indicator */}
        <div className="pt-2.5 pb-1 sm:hidden flex justify-center">
          <div className="w-10 h-1 bg-[#D1D5DB] rounded-full" />
        </div>

        {/* Header */}
        {(title || showClose) && (
          <div className="px-5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
            <div>
              {title && (
                <h3 className="text-[16px] font-semibold text-[#0B0C0E] leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[12px] text-[#6B7280] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>

            {showClose && (
              <button
                onClick={onClose}
                aria-label="Tutup"
                className="w-7 h-7 flex items-center justify-center text-[#6B7280] hover:text-[#0B0C0E] hover:bg-[#F6F6F7] rounded-[4px] transition-colors -mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 text-[13px]">
          {children}
        </div>
      </div>
    </div>
  );
}
