import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import Modal from './Modal';

/**
 * Custom Confirmation Dialog / Bottom Sheet
 * Replaces native window.confirm()
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger' // 'danger' | 'warning' | 'primary'
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return 'bg-[#E5484D] hover:bg-[#B9252A] active:bg-[#9B1E23] text-white';
      case 'warning':
        return 'bg-[#F6821F] hover:bg-[#DB6E0F] active:bg-[#C25B08] text-white';
      default:
        return 'bg-[#F6821F] hover:bg-[#DB6E0F] text-white';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-[#E5484D] shrink-0 mt-0.5" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-[#F6821F] shrink-0 mt-0.5" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={null}
      maxWidth="max-w-sm"
      showClose={false}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="space-y-1">
            <h4 className="text-[15px] font-semibold text-[#0B0C0E] leading-snug">
              {title}
            </h4>
            <p className="text-[13px] text-[#6B7280] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3.5 bg-white border border-[#E5E7EB] hover:bg-[#F6F6F7] text-[#0B0C0E] text-[12px] font-medium rounded-[6px] transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`h-8 px-4 text-[12px] font-medium rounded-[6px] transition-colors ${getButtonStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
