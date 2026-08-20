import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Custom Select / Dropdown Component
 * Replaces native <select>
 */
export default function Select({
  label,
  value,
  onChange,
  options = [], // [{ value: '...', label: '...' }] or string array
  placeholder = 'Pilih opsi...',
  className = '',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));

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

  const handleSelect = (val) => {
    onChange({ target: { value: val } });
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
        <span className={`truncate ${selectedOption ? 'text-[#0B0C0E] font-medium' : 'text-[#9CA3AF]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-150 ${isOpen ? 'rotate-180 text-[#F6821F]' : ''}`} />
      </button>

      {/* Popover / Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#E5E7EB] rounded-[6px] shadow-cf-dropdown py-1 max-h-48 overflow-y-auto animate-cf-modal">
          {normalizedOptions.map(opt => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-3 py-2 text-left text-[13px] flex items-center justify-between gap-2 transition-colors ${
                  isSelected
                    ? 'bg-[#FFF5EA] text-[#DB6E0F] font-medium'
                    : 'text-[#0B0C0E] hover:bg-[#F6F6F7]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 text-[#F6821F] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
