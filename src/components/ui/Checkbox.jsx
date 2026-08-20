import React from 'react';
import { Check } from 'lucide-react';

/**
 * Custom Checkbox Component
 * Replaces native <input type="checkbox">
 */
export default function Checkbox({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = ''
}) {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 rounded-[4px] border transition-colors flex items-center justify-center ${
            checked
              ? 'bg-[#F6821F] border-[#F6821F] text-white'
              : 'bg-white border-[#D1D5DB] hover:border-[#9CA3AF]'
          }`}
        >
          {checked && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>

      {(label || description) && (
        <div className="text-[12px] leading-tight">
          {label && <span className="font-medium text-[#0B0C0E]">{label}</span>}
          {description && <p className="text-[11px] text-[#6B7280] mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
}
