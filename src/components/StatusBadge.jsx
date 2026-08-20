import React from 'react';

/**
 * Cloudflare-style Status Badge
 * - Terjadwal: Info Blue (#2E7DD1)
 * - Berlangsung: Warning Yellow (#F6C000)
 * - Selesai: Gray (#6B7280)
 * - Batal: Danger Red (#E5484D)
 */
export default function StatusBadge({ status, className = '' }) {
  const getStyle = (st) => {
    switch (st) {
      case 'Berlangsung':
        return {
          bg: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
          dot: 'bg-[#D97706]',
          label: 'Berlangsung'
        };
      case 'Terjadwal':
        return {
          bg: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
          dot: 'bg-[#3B82F6]',
          label: 'Terjadwal'
        };
      case 'Selesai':
        return {
          bg: 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB]',
          dot: 'bg-[#9CA3AF]',
          label: 'Selesai'
        };
      case 'Batal':
        return {
          bg: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
          dot: 'bg-[#EF4444]',
          label: 'Batal'
        };
      default:
        return {
          bg: 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB]',
          dot: 'bg-[#9CA3AF]',
          label: st || 'Lainnya'
        };
    }
  };

  const current = getStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium border ${current.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`}></span>
      <span className="leading-none">{current.label}</span>
    </span>
  );
}
