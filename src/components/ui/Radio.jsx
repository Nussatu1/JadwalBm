import React from 'react';

/**
 * Custom Radio Component
 * Replaces native <input type="radio">
 */
export default function Radio({
  id,
  name,
  value,
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
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 rounded-full border transition-colors flex items-center justify-center ${
            checked
              ? 'border-[#F6821F] bg-white'
              : 'bg-white border-[#D1D5DB] hover:border-[#9CA3AF]'
          }`}
        >
          {checked && <div className="w-2 h-2 rounded-full bg-[#F6821F]" />}
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
