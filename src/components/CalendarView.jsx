import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { NAMA_BULAN, formatTanggalIndo, formatJam, parseAnyDate } from '../utils/dateUtils';
import { useEvents } from '../context/EventContext';
import StatusBadge from './StatusBadge';

const HARI_SINGKAT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function CalendarView({ onSelectEvent }) {
  const { events } = useEvents();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
  };

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      if (e.tanggal) {
        const d = parseAnyDate(e.tanggal);
        if (d) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (!map[key]) map[key] = [];
          map[key].push(e);
        }
      }
    });
    return map;
  }, [events]);

  const daysInMonth = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateStr: null });
    }

    for (let d = 1; d <= totalDays; d++) {
      const monthFormatted = String(currentMonth + 1).padStart(2, '0');
      const dayFormatted = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;
      const dayEvents = eventsByDate[dateStr] || [];

      days.push({
        day: d,
        dateStr,
        events: dayEvents,
        hasEvents: dayEvents.length > 0
      });
    }

    return days;
  }, [currentYear, currentMonth, eventsByDate]);

  const selectedDayEvents = useMemo(() => {
    return eventsByDate[selectedDateStr] || [];
  }, [eventsByDate, selectedDateStr]);

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="space-y-3">
      {/* Calendar Card */}
      <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-4 shadow-cf-card">
        {/* Month Header Navigation */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-semibold text-[#0B0C0E]">
              {NAMA_BULAN[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={handleToday}
              className="text-[12px] font-medium px-2 py-0.5 bg-[#F6F6F7] hover:bg-[#E5E7EB] text-[#374151] border border-[#E5E7EB] rounded-[4px] transition-colors"
            >
              Hari Ini
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              aria-label="Bulan Sebelumnya"
              className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#0B0C0E] hover:bg-[#F6F6F7] border border-[#E5E7EB] rounded-[6px] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              aria-label="Bulan Berikutnya"
              className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#0B0C0E] hover:bg-[#F6F6F7] border border-[#E5E7EB] rounded-[6px] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {HARI_SINGKAT.map((h, idx) => (
            <div
              key={idx}
              className={`text-[11px] font-medium py-1 ${
                idx === 0 ? 'text-[#E5484D]' : 'text-[#6B7280]'
              }`}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((item, idx) => {
            if (!item.day) {
              return <div key={`empty-${idx}`} className="h-10 sm:h-12 rounded-[6px]" />;
            }

            const isToday = item.dateStr === todayStr;
            const isSelected = item.dateStr === selectedDateStr;
            const hasEvents = item.hasEvents;

            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDateStr(item.dateStr)}
                className={`relative h-10 sm:h-12 rounded-[6px] flex flex-col items-center justify-center p-1 transition-colors border ${
                  isSelected
                    ? 'bg-[#F6821F] border-[#F6821F] text-white font-semibold'
                    : isToday
                    ? 'bg-[#FFF5EA] border-[#FBD6B0] text-[#DB6E0F] font-semibold'
                    : 'bg-white hover:bg-[#F6F6F7] border-[#E5E7EB] text-[#0B0C0E]'
                }`}
              >
                <span className="text-[12px] sm:text-[13px]">{item.day}</span>

                {/* Event Dots */}
                {hasEvents && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {item.events.slice(0, 3).map((ev, eIdx) => {
                      let dotColor = isSelected ? 'bg-white' : 'bg-[#F6821F]';
                      if (ev.status === 'Berlangsung') dotColor = isSelected ? 'bg-white' : 'bg-[#F6C000]';
                      if (ev.status === 'Batal') dotColor = isSelected ? 'bg-white' : 'bg-[#E5484D]';

                      return (
                        <span
                          key={eIdx}
                          className={`w-1 h-1 rounded-full ${dotColor}`}
                        />
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0B0C0E]">
            <CalendarIcon className="w-4 h-4 text-[#F6821F]" />
            <span>{formatTanggalIndo(selectedDateStr)}</span>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 bg-[#F6F6F7] text-[#6B7280] border border-[#E5E7EB] rounded-full">
            {selectedDayEvents.length} Acara
          </span>
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-6 text-center">
            <p className="text-[13px] text-[#6B7280]">
              Tidak ada agenda acara pada tanggal ini.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {selectedDayEvents.map(event => (
              <div
                key={event.id}
                onClick={() => onSelectEvent && onSelectEvent(event)}
                className="bg-white rounded-[6px] border border-[#E5E7EB] px-3.5 py-2.5 hover:border-[#D1D5DB] active:bg-[#F6F6F7] cursor-pointer transition-all flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <h4 className="text-[14px] font-semibold text-[#0B0C0E] group-hover:text-[#F6821F] transition-colors truncate">
                      {event.nama_acara}
                    </h4>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {event.kategori && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-[#6B7280] bg-[#F6F6F7] border border-[#E5E7EB]">
                          {event.kategori}
                        </span>
                      )}
                      <StatusBadge status={event.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280] truncate">
                    <span className="shrink-0">{event.jam_mulai ? `${event.jam_mulai} WIB` : 'Waktu menyusul'}</span>
                    {event.lokasi_nama && (
                      <>
                        <span className="text-[#D1D5DB]">•</span>
                        <span className="truncate text-[#4B5563]">{event.lokasi_nama}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-[#9CA3AF] group-hover:text-[#0B0C0E] transition-colors">
                  <ChevronRightIcon className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
