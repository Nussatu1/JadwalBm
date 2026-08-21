import React, { useState, useRef, useEffect } from 'react';
import { Clock, Check } from 'lucide-react';

const COMMON_PRESETS = ['07:00', '08:00', '08:30', '09:00', '13:00', '16:00', '19:30', '20:00'];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

/**
 * Custom Time Picker Component with optional "Selesai" choice
 * Replaces native <input type="time">
 */
export default function TimePicker({
  label,
  value, // HH:mm or 'Selesai'
  onChange,
  className = '',
  required = false,
  allowSelesai = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isSelesai = value === 'Selesai' || value?.toLowerCase?.() === 'selesai';

  const [currentHour, setCurrentHour] = useState(() => {
    if (value && !isSelesai) {
      return value.split(':')[0] || '08';
    }
    return '08';
  });

  const [currentMinute, setCurrentMinute] = useState(() => {
    if (value && !isSelesai) {
      return value.split(':')[1] || '00';
    }
    return '00';
  });

  useEffect(() => {
    if (value && !isSelesai) {
      const parts = value.split(':');
      if (parts.length >= 2) {
        setCurrentHour(parts[0]);
        setCurrentMinute(parts[1]);
      }
    }
  }, [value, isSelesai]);

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

  const updateTime = (h, m) => {
    const timeStr = `${h}:${m}`;
    onChange({ target: { value: timeStr } });
  };

  const handleHourSelect = (h) => {
    setCurrentHour(h);
    updateTime(h, currentMinute);
  };

  const handleMinuteSelect = (m) => {
    setCurrentMinute(m);
    updateTime(currentHour, m);
  };

  const handlePresetSelect = (preset) => {
    const parts = preset.split(':');
    setCurrentHour(parts[0]);
    setCurrentMinute(parts[1]);
    onChange({ target: { value: preset } });
    setIsOpen(false);
  };

  const handleSelectSelesai = () => {
    onChange({ target: { value: 'Selesai' } });
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Header: Label + Quick Selesai Badge/Button */}
      <div className="flex items-center justify-between mb-1">
        {label ? (
          <label className="block text-[12px] font-medium text-[#0B0C0E] dark:text-slate-200">
            {label} {required && <span className="text-[#E5484D]">*</span>}
          </label>
        ) : <div />}

        {allowSelesai && (
          <button
            type="button"
            onClick={handleSelectSelesai}
            className={`text-[11px] px-2 py-0.5 rounded-[5px] border transition-all cursor-pointer select-none flex items-center gap-1 active:scale-95 ${
              isSelesai
                ? 'bg-[#EBF9F1] border-[#B7EBD0] text-[#0F9D58] font-bold shadow-2xs'
                : 'bg-[#FFF5EA] border-[#FBD6B0] text-[#DB6E0F] font-semibold hover:bg-[#FFE8CC]'
            }`}
          >
            <span>✨ Selesai</span>
            {isSelesai && <Check className="w-3 h-3 text-[#0F9D58]" />}
          </button>
        )}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 px-3 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[6px] text-[13px] text-left flex items-center justify-between gap-2 transition-colors ${
          isOpen ? 'border-[#F6821F] ring-1 ring-[#F6821F]' : 'hover:border-[#D1D5DB]'
        }`}
      >
        <span className={`truncate ${value ? 'text-[#0B0C0E] dark:text-slate-100 font-medium' : 'text-[#9CA3AF]'}`}>
          {isSelesai ? (
            <span className="inline-flex items-center gap-1 text-[#0F9D58] font-bold">
              <Check className="w-3.5 h-3.5" /> Selesai
            </span>
          ) : value ? (
            `${value} WIB`
          ) : (
            'Pilih jam...'
          )}
        </span>
        <Clock className={`w-4 h-4 text-[#9CA3AF] shrink-0 ${isOpen ? 'text-[#F6821F]' : ''}`} />
      </button>

      {/* Time Picker Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 right-0 sm:left-auto sm:right-0 sm:w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 rounded-[8px] shadow-cf-dropdown p-3 animate-cf-modal">
          {/* Quick presets */}
          <div className="mb-2.5">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-[#6B7280] dark:text-slate-400 mb-1">Pilihan Cepat</p>
            <div className="flex flex-wrap gap-1">
              {allowSelesai && (
                <button
                  type="button"
                  onClick={handleSelectSelesai}
                  className={`text-[11px] px-2 py-0.5 rounded-[4px] border transition-colors cursor-pointer ${
                    isSelesai
                      ? 'bg-[#EBF9F1] border-[#B7EBD0] text-[#0F9D58] font-bold'
                      : 'bg-[#FFF5EA] border-[#FBD6B0] text-[#DB6E0F] font-semibold hover:bg-[#FFE8CC]'
                  }`}
                >
                  ✨ Selesai
                </button>
              )}
              {COMMON_PRESETS.map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handlePresetSelect(p)}
                  className={`text-[11px] px-1.5 py-0.5 rounded-[4px] border transition-colors cursor-pointer ${
                    value === p
                      ? 'bg-[#FFF5EA] border-[#FBD6B0] text-[#DB6E0F] font-semibold'
                      : 'bg-[#F6F6F7] dark:bg-slate-800 border-[#E5E7EB] dark:border-slate-700 text-[#374151] dark:text-slate-200 hover:bg-[#E5E7EB]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Hour and Minute Selectors */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB]">
            {/* Hours Column */}
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#6B7280] mb-1 text-center">Jam</p>
              <div className="h-32 overflow-y-auto border border-[#E5E7EB] rounded-[4px] p-0.5 space-y-0.5">
                {HOURS.map(h => (
                  <button
                    type="button"
                    key={h}
                    onClick={() => handleHourSelect(h)}
                    className={`w-full text-[12px] py-1 rounded-[2px] transition-colors text-center ${
                      currentHour === h && !isSelesai
                        ? 'bg-[#F6821F] text-white font-semibold'
                        : 'hover:bg-[#F6F6F7] text-[#0B0C0E]'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#6B7280] mb-1 text-center">Menit</p>
              <div className="h-32 overflow-y-auto border border-[#E5E7EB] rounded-[4px] p-0.5 space-y-0.5">
                {MINUTES.map(m => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => handleMinuteSelect(m)}
                    className={`w-full text-[12px] py-1 rounded-[2px] transition-colors text-center ${
                      currentMinute === m && !isSelesai
                        ? 'bg-[#F6821F] text-white font-semibold'
                        : 'hover:bg-[#F6F6F7] text-[#0B0C0E]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Done Button */}
          <div className="mt-2.5 pt-2 border-t border-[#E5E7EB] flex justify-end gap-1.5">
            {allowSelesai && (
              <button
                type="button"
                onClick={handleSelectSelesai}
                className="h-7 px-2.5 bg-[#EBF9F1] hover:bg-[#D4F4E2] text-[#0F9D58] text-[11px] font-semibold rounded-[4px] border border-[#B7EBD0] transition-colors mr-auto"
              >
                Pilih Selesai
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-7 px-3 bg-[#F6821F] hover:bg-[#DB6E0F] text-white text-[11px] font-medium rounded-[4px] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
