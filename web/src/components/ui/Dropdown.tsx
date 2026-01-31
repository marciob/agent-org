'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2
          px-3 py-2.5 text-sm
          bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg
          hover:border-[var(--border-secondary)]
          focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
          transition-all duration-150
          ${isOpen ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20' : ''}
        `}
      >
        <span className={`flex items-center gap-2 ${selectedOption ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="
            absolute z-50 w-full mt-1
            bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg
            shadow-[var(--shadow-dropdown)]
            py-1 animate-slide-down
            max-h-60 overflow-y-auto
          "
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                transition-colors duration-100
                ${option.value === value
                  ? 'bg-[var(--accent-light)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }
              `}
            >
              {option.icon}
              {option.label}
              {option.value === value && (
                <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
