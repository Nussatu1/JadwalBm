import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users,
  ChevronRight as ChevronRightIcon,
  Sparkles
} from 'lucide-react';
import { NAMA_BULAN, formatTanggalIndo, cleanTimeString, parseAnyDate, formatJam } from '../utils/dateUtils';
import { useEvents } from '../context/EventContext';
import StatusBadge from './StatusBadge';

const HARI_SINGKAT = [
  { name: 'Min', label: 'Minggu', isWeekend: true },
  { name: 'Sen', label: 'Senin' },
  { name: 'Sel', label: 'Selasa' },
  { name: 'Rab', label: 'Rabu' },
  { name: 'Kam', label: 'Kamis' },
  { name: 'Jum', label: 'Jumat', isSpecial: true },
  { name: 'Sab', label: 'Sabtu' }
];

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

  // Group events by normalized YYYY-MM-DD
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

  // Total events in the currently viewed month
  const totalEventsInMonth = useMemo(() => {
    let count = 0;
    events.forEach(e => {
      if (e.tanggal) {
        const d = parseAnyDate(e.tanggal);
        if (d && d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          count++;
        }
      }
    });
    return count;
  }, [events, currentYear, currentMonth]);

  // Generate full calendar grid including previous & next month dates
  const daysInMonth = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // 1. Trailing days from previous month (samar/muted)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const mFormatted = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dFormatted = String(dayNum).padStart(2, '0');
      const dateStr = `${prevDate.getFullYear()}-${mFormatted}-${dFormatted}`;
      const dayEvents = eventsByDate[dateStr] || [];

      days.push({
        day: dayNum,
        dateStr,
        isOtherMonth: true,
        events: dayEvents,
        hasEvents: dayEvents.length > 0
      });
    }

    // 2. Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const monthFormatted = String(currentMonth + 1).padStart(2, '0');
      const dayFormatted = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;
      const dayEvents = eventsByDate[dateStr] || [];

      days.push({
        day: d,
        dateStr,
        isOtherMonth: false,
        events: dayEvents,
        hasEvents: dayEvents.length > 0
      });
    }

    // 3. Leading days from next month to complete the 7-column grid (samar/muted)
    const totalCells = Math.ceil(days.length / 7) * 7;
    const nextDaysNeeded = totalCells - days.length;
    for (let d = 1; d <= nextDaysNeeded; d++) {
      const nextDate = new Date(currentYear, currentMonth + 1, d);
      const mFormatted = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dFormatted = String(d).padStart(2, '0');
      const dateStr = `${nextDate.getFullYear()}-${mFormatted}-${dFormatted}`;
      const dayEvents = eventsByDate[dateStr] || [];

      days.push({
        day: d,
        dateStr,
        isOtherMonth: true,
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
  const isViewingCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  return (
    <div className="space-y-3.5">
      {/* ── Main Calendar Card ── */}
      <div className="bg-white rounded-[10px] border border-[#E5E7EB] shadow-cf-card overflow-hidden">
        {/* Header: Month & Year Navigator */}
        <div className="p-4 pb-3 flex items-center justify-between border-b border-[#E5E7EB] bg-gradient-to-b from-[#FAFAFA] to-white">
          <div className="flex items-center gap-2.5">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[17px] font-bold text-[#0B0C0E] tracking-tight">
                {NAMA_BULAN[currentMonth]}
              </h2>
              <span className="text-[15px] font-medium text-[#6B7280]">
                {currentYear}
              </span>
            </div>

            {totalEventsInMonth > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FFF5EA] text-[#DB6E0F] border border-[#FBD6B0]">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{totalEventsInMonth} Agenda</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {!isViewingCurrentMonth && (
              <button
                type="button"
                onClick={handleToday}
                className="text-[11.5px] font-medium px-2.5 py-1 bg-white hover:bg-[#F6F6F7] text-[#0B0C0E] border border-[#E5E7EB] rounded-[6px] transition-all shadow-2xs"
              >
                Hari Ini
              </button>
            )}

            <div className="flex items-center bg-[#F6F6F7] p-0.5 rounded-[7px] border border-[#E5E7EB]">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Bulan Sebelumnya"
                className="w-7 h-7 flex items-center justify-center text-[#6B7280] hover:text-[#0B0C0E] hover:bg-white rounded-[5px] transition-all shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Bulan Berikutnya"
                className="w-7 h-7 flex items-center justify-center text-[#6B7280] hover:text-[#0B0C0E] hover:bg-white rounded-[5px] transition-all shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Subheader Bar */}
        <div className="px-3 pt-3">
          <div className="grid grid-cols-7 gap-1 text-center bg-[#F9FAFB] rounded-[7px] py-1.5 border border-[#F3F4F6]">
            {HARI_SINGKAT.map((h, idx) => (
              <div
                key={idx}
                className={`text-[11px] font-semibold tracking-wider uppercase ${
                  h.isWeekend
                    ? 'text-[#E5484D]'
                    : h.isSpecial
                    ? 'text-[#0F9D58]'
                    : 'text-[#6B7280]'
                }`}
              >
                {h.name}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Dates Grid with Rounded Individual Cells */}
        <div className="p-3 pt-2">
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {daysInMonth.map((item, idx) => {
              const isToday = item.dateStr === todayStr;
              const isSelected = item.dateStr === selectedDateStr;
              const hasEvents = item.hasEvents;
              const isOther = item.isOtherMonth;

              return (
                <button
                  type="button"
                  key={item.dateStr || idx}
                  onClick={() => setSelectedDateStr(item.dateStr)}
                  className={`group relative h-11 sm:h-13 rounded-[7px] sm:rounded-[8px] flex flex-col items-center justify-between p-1 sm:p-1.5 transition-all duration-150 border select-none ${
                    isSelected
                      ? 'bg-[#F6821F] border-[#F6821F] text-white font-bold shadow-sm scale-[1.02] z-10'
                      : isToday
                      ? 'bg-[#FFF5EA] border-[#FBD6B0] text-[#DB6E0F] font-bold'
                      : isOther
                      ? 'bg-[#FAFAFA] border-[#F3F4F6] hover:bg-[#F3F4F6] text-[#9CA3AF]'
                      : 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] text-[#0B0C0E]'
                  }`}
                >
                  {/* Date Number */}
                  <span className={`text-[12px] sm:text-[13px] leading-none mt-0.5 ${
                    isSelected
                      ? 'text-white font-bold'
                      : isToday
                      ? 'text-[#DB6E0F] font-bold'
                      : isOther
                      ? 'text-[#9CA3AF] opacity-60'
                      : 'text-[#0B0C0E]'
                  }`}>
                    {item.day}
                  </span>

                  {/* Event Indicator Dots */}
                  <div className="w-full flex items-center justify-center gap-0.5 min-h-[5px] mb-0.5">
                    {hasEvents && (
                      <div className="flex items-center gap-0.5">
                        {item.events.slice(0, 3).map((ev, eIdx) => {
                          let dotBg = isSelected
                            ? 'bg-white'
                            : isOther
                            ? 'bg-[#9CA3AF]/60'
                            : ev.status === 'Berlangsung'
                            ? 'bg-[#F59E0B]'
                            : ev.status === 'Batal'
                            ? 'bg-[#E5484D]'
                            : ev.status === 'Selesai'
                            ? 'bg-[#0F9D58]'
                            : 'bg-[#F6821F]';

                          return (
                            <span
                              key={eIdx}
                              className={`w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125 ${dotBg}`}
                            />
                          );
                        })}
                        {item.events.length > 3 && (
                          <span className={`text-[8px] font-bold leading-none ${isSelected ? 'text-white' : isOther ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>
                            +
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Selected Date Agenda Section ── */}
      <div className="space-y-2.5">
        {/* Section Header with Date Badge */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[6px] bg-[#F6F6F7] border border-[#E5E7EB] flex items-center justify-center text-[#F6821F] shrink-0">
              <CalendarIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-[13.5px] font-bold text-[#0B0C0E] leading-tight">
                {formatTanggalIndo(selectedDateStr)}
              </h3>
              {selectedDateStr === todayStr && (
                <span className="text-[10.5px] font-semibold text-[#F6821F] uppercase tracking-wider">
                  Hari Ini
                </span>
              )}
            </div>
          </div>

          <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-[#F6F6F7] text-[#4B5563] border border-[#E5E7EB] rounded-full">
            {selectedDayEvents.length} Agenda
          </span>
        </div>

        {/* Event Cards List */}
        {selectedDayEvents.length === 0 ? (
          <div className="bg-white rounded-[8px] border border-[#E5E7EB] p-7 text-center space-y-2 shadow-cf-card">
            <div className="w-10 h-10 rounded-full bg-[#F6F6F7] border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center mx-auto">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[13px] font-semibold text-[#0B0C0E]">
                Tidak Ada Agenda
              </p>
              <p className="text-[11.5px] text-[#6B7280]">
                Belum ada jadwal liputan pada tanggal ini.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDayEvents.map(event => {
              const startTime = cleanTimeString(event.jam_mulai);
              const endTime = cleanTimeString(event.jam_selesai);
              const isLive = event.status === 'Berlangsung';

              return (
                <div
                  key={event.id}
                  onClick={() => onSelectEvent && onSelectEvent(event)}
                  className={`bg-white rounded-[8px] border p-3.5 hover:border-[#D1D5DB] active:bg-[#F9FAFB] cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-cf-card ${
                    isLive 
                      ? 'border-l-4 border-l-[#F59E0B] border-t-[#E5E7EB] border-r-[#E5E7EB] border-b-[#E5E7EB]' 
                      : 'border-l-4 border-l-[#F6821F] border-t-[#E5E7EB] border-r-[#E5E7EB] border-b-[#E5E7EB]'
                  }`}
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* Title & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[14px] font-semibold text-[#0B0C0E] group-hover:text-[#F6821F] transition-colors truncate">
                        {event.nama_acara}
                      </h4>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {event.kategori && (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded text-[#4B5563] bg-[#F6F6F7] border border-[#E5E7EB]">
                            {event.kategori}
                          </span>
                        )}
                        <StatusBadge status={event.status} />
                      </div>
                    </div>

                    {/* Time & Location Row */}
                    <div className="flex items-center gap-3 text-[12px] text-[#6B7280] flex-wrap">
                      <div className="flex items-center gap-1 shrink-0 text-[#374151] font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        <span>{formatJam(event.jam_mulai, event.jam_selesai)}</span>
                      </div>

                      {event.lokasi_nama && (
                        <div className="flex items-center gap-1 truncate text-[#4B5563]">
                          <MapPin className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                          <span className="truncate">{event.lokasi_nama}</span>
                        </div>
                      )}

                      {event.anggota_diutus && (
                        <div className="flex items-center gap-1 text-[11px] text-[#6B7280] truncate">
                          <Users className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                          <span className="truncate">
                            {event.anggota_diutus.split(',').length} Petugas
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-[#9CA3AF] group-hover:text-[#0B0C0E] group-hover:translate-x-0.5 transition-all">
                    <ChevronRightIcon className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
