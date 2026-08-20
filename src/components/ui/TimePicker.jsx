import React, { useState, useRef, useEffect } from 'react';
import { Clock, Check } from 'lucide-react';

const COMMON_PRESETS = ['07:00', '08:00', '08:30', '09:00', '13:00', '16:00', '19:30', '20:00'];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

/**
 * Custom Time Picker Component
 * Replaces native <input type="time">
 */
export default function TimePicker({
  label,
  value, // HH:mm
  onChange,
  className = '',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [currentHour, setCurrentHour] = useState(() => {
    return value ? value.split(':')[0] || '08' : '08';
  });

  const [currentMinute, setCurrentMinute] = useState(() => {
    return value ? value.split(':')[1] || '00' : '00';
  });

  useEffect(() => {
    if (value) {
      const parts = value.split(':');
      if (parts.length >= 2) {
        setCurrentHour(parts[0]);
        setCurrentMinute(parts[1]);
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
          {value ? `${value} WIB` : 'Pilih jam...'}
        </span>
        <Clock className={`w-4 h-4 text-[#9CA3AF] shrink-0 ${isOpen ? 'text-[#F6821F]' : ''}`} />
      </button>

      {/* Time Picker Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 sm:left-auto right-0 sm:w-64 bg-white border border-[#E5E7EB] rounded-[8px] shadow-cf-dropdown p-3 animate-cf-modal">
          {/* Quick presets */}
          <div className="mb-2.5">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-[#6B7280] mb-1">Pilihan Cepat</p>
            <div className="flex flex-wrap gap-1">
              {COMMON_PRESETS.map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handlePresetSelect(p)}
                  className={`text-[11px] px-1.5 py-0.5 rounded-[4px] border transition-colors ${
                    value === p
                      ? 'bg-[#FFF5EA] border-[#FBD6B0] text-[#DB6E0F] font-semibold'
                      : 'bg-[#F6F6F7] border-[#E5E7EB] text-[#374151] hover:bg-[#E5E7EB]'
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
                      currentHour === h
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
                      currentMinute === m
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
          <div className="mt-2.5 pt-2 border-t border-[#E5E7EB] flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-7 px-3 bg-[#F6821F] hover:bg-[#DB6E0F] text-white text-[11px] font-medium rounded-[4px] transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
