import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { NAMA_BULAN, formatTanggalIndo } from '../../utils/dateUtils';

const HARI_SINGKAT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

/**
 * Custom Date Picker Component
 * Replaces native <input type="date">
 */
export default function DatePicker({
  label,
  value, // YYYY-MM-DD
  onChange,
  className = '',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize view year & month from current value
  const initialDate = useMemo(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDate = (d) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const dateStr = `${viewYear}-${monthStr}-${dayStr}`;
    onChange({ target: { value: dateStr } });
    setIsOpen(false);
  };

  const handleToday = (e) => {
    e.stopPropagation();
    const now = new Date();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const dayStr = String(now.getDate()).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${monthStr}-${dayStr}`;
    onChange({ target: { value: dateStr } });
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setIsOpen(false);
  };

  // Days in month calculation
  const daysInMonth = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }
    return days;
  }, [viewYear, viewMonth]);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[12px] font-medium text-[#0B0C0E] mb-1">
          {label} {required && <span className="text-[#E5484D]">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 px-3 bg-white border border-[#E5E7EB] rounded-[6px] text-[13px] text-left flex items-center justify-between gap-2 transition-colors ${
          isOpen ? 'border-[#F6821F] ring-1 ring-[#F6821F]' : 'hover:border-[#D1D5DB]'
        }`}
      >
        <span className={`truncate ${value ? 'text-[#0B0C0E] font-medium' : 'text-[#9CA3AF]'}`}>
          {value ? formatTanggalIndo(value) : 'Pilih tanggal...'}
        </span>
        <CalendarIcon className={`w-4 h-4 text-[#9CA3AF] shrink-0 ${isOpen ? 'text-[#F6821F]' : ''}`} />
      </button>

      {/* Calendar Dropdown / Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 sm:left-auto right-0 sm:w-72 bg-white border border-[#E5E7EB] rounded-[8px] shadow-cf-dropdown p-3 animate-cf-modal">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-[#0B0C0E]">
              {NAMA_BULAN[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-6 h-6 flex items-center justify-center text-[#6B7280] hover:text-[#0B0C0E] hover:bg-[#F6F6F7] rounded-[4px]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-6 h-6 flex items-center justify-center text-[#6B7280] hover:text-[#0B0C0E] hover:bg-[#F6F6F7] rounded-[4px]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {HARI_SINGKAT.map((h, i) => (
              <span key={i} className={`text-[10px] font-medium ${i === 0 ? 'text-[#E5484D]' : 'text-[#9CA3AF]'}`}>
                {h}
              </span>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((d, i) => {
              if (d === null) {
                return <div key={`empty-${i}`} className="h-7" />;
              }

              const monthStr = String(viewMonth + 1).padStart(2, '0');
              const dayStr = String(d).padStart(2, '0');
              const dateStr = `${viewYear}-${monthStr}-${dayStr}`;

              const isSelected = dateStr === value;
              const isToday = dateStr === todayStr;

              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => handleSelectDate(d)}
                  className={`h-7 text-[12px] rounded-[4px] flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#F6821F] text-white font-semibold'
                      : isToday
                      ? 'bg-[#FFF5EA] text-[#DB6E0F] font-semibold border border-[#FBD6B0]'
                      : 'hover:bg-[#F6F6F7] text-[#0B0C0E]'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Shortcut Footer */}
          <div className="mt-2 pt-2 border-t border-[#E5E7EB] flex items-center justify-between">
            <button
              type="button"
              onClick={handleToday}
              className="text-[11px] font-medium text-[#F6821F] hover:underline"
            >
              Pilih Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-[#6B7280] hover:text-[#0B0C0E]"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
