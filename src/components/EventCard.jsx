import React from 'react';
import { ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatTanggalRingkas, formatJam } from '../utils/dateUtils';

export default function EventCard({ event, onSelect }) {
  const timeFormatted = formatJam(event.jam_mulai, event.jam_selesai);

  return (
    <div 
      onClick={() => onSelect && onSelect(event)}
      className="bg-white rounded-[8px] border border-[#E5E7EB] p-3 hover:border-[#D1D5DB] active:bg-[#F6F6F7] transition-all cursor-pointer group shadow-cf-card"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Main Content: 2 Clean Rows */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Row 1: Title & Status Badge */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[14px] font-semibold text-[#0B0C0E] leading-tight truncate group-hover:text-[#F6821F] transition-colors">
              {event.nama_acara}
            </h3>
            <div className="shrink-0">
              <StatusBadge status={event.status} />
            </div>
          </div>

          {/* Row 2: Category • Date • Time • Place */}
          <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280] truncate">
            {event.kategori && (
              <>
                <span className="text-[10.5px] font-medium text-[#4B5563] bg-[#F6F6F7] border border-[#E5E7EB] px-1.5 py-0.2 rounded-[4px] shrink-0">
                  {event.kategori}
                </span>
                <span className="text-[#D1D5DB]">•</span>
              </>
            )}
            <span className="shrink-0 font-medium text-[#374151]">
              {formatTanggalRingkas(event.tanggal)}
            </span>
            <span className="text-[#D1D5DB]">•</span>
            <span className="shrink-0">
              {timeFormatted}
            </span>
            {event.lokasi_nama && (
              <>
                <span className="text-[#D1D5DB]">•</span>
                <span className="truncate text-[#4B5563]">
                  {event.lokasi_nama}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Chevron Right */}
        <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#0B0C0E] transition-colors shrink-0 -mr-0.5" />
      </div>
    </div>
  );
}
