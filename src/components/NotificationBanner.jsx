import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { isEventUpcomingOrLive } from '../utils/dateUtils';

/**
 * Minimalist Live Event Banner
 * Only pinned on Tab Daftar when there is an ongoing event
 */
export default function NotificationBanner({ onSelectEvent }) {
  const { events } = useEvents();

  // Find events that are currently live / Berlangsung
  const liveEvents = useMemo(() => {
    return events.filter(event => {
      if (event.status === 'Batal' || event.status === 'Selesai') return false;
      if (event.status === 'Berlangsung') return true;
      const { isLive } = isEventUpcomingOrLive(event);
      return isLive;
    });
  }, [events]);

  if (liveEvents.length === 0) return null;

  return (
    <div className="space-y-1.5 mb-2.5">
      {liveEvents.map(event => (
        <div
          key={event.id}
          onClick={() => onSelectEvent && onSelectEvent(event)}
          className="bg-[#FFFBEB] border border-[#FDE68A] hover:border-[#F59E0B] rounded-[6px] px-3 py-2 flex items-center justify-between gap-2.5 transition-all cursor-pointer group shadow-cf-card"
        >
          {/* Left: Pulse Indicator & Event Info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Live Indicator Dot */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D97706] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D97706]" />
            </span>

            <span className="text-[10px] font-semibold text-[#92400E] uppercase tracking-wider shrink-0">
              LIVE
            </span>

            <span className="text-[#D1D5DB] shrink-0">•</span>

            {/* Event Name */}
            <span className="text-[13px] font-semibold text-[#0B0C0E] truncate group-hover:text-[#D97706] transition-colors">
              {event.nama_acara}
            </span>

            {/* Time / Place Preview */}
            {(event.jam_mulai || event.lokasi_nama) && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[12px] text-[#78350F] truncate shrink-0">
                <span>•</span>
                {event.jam_mulai && <span>{event.jam_mulai} WIB</span>}
                {event.lokasi_nama && <span>({event.lokasi_nama})</span>}
              </span>
            )}
          </div>

          {/* Right: Chevron */}
          <div className="flex items-center gap-1 shrink-0 text-[#92400E] text-[11px] font-medium">
            <span className="hidden xs:inline">Lihat Detail</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      ))}
    </div>
  );
}
