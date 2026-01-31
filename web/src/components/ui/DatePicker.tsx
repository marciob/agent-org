'use client';

import { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

interface QuickOption {
  label: string;
  getValue: () => Date;
}

const quickOptions: QuickOption[] = [
  { label: 'Tomorrow', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
  { label: '3 Days', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 3); return d; } },
  { label: '1 Week', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
  { label: '2 Weeks', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 14); return d; } },
  { label: '1 Month', getValue: () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; } },
];

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDisplayDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Select deadline...',
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('23:59');
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape to close
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleQuickSelect = (option: QuickOption) => {
    const date = option.getValue();
    date.setHours(23, 59, 0, 0);
    onChange(formatDateForInput(date));
    setIsOpen(false);
  };

  const handleCustomDateApply = () => {
    if (customDate) {
      const [hours, minutes] = customTime.split(':').map(Number);
      const date = new Date(customDate);
      date.setHours(hours, minutes, 0, 0);
      onChange(formatDateForInput(date));
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2
          px-3 py-2.5 text-sm text-left
          bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg
          hover:border-[var(--border-secondary)]
          focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20
          transition-all duration-150
          ${isOpen ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20' : ''}
        `}
      >
        <span className={`flex items-center gap-2 ${value ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleClear();
              }
            }}
            className="p-0.5 hover:bg-[var(--bg-hover)] rounded transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="
            absolute z-50 w-full sm:w-80 mt-1 right-0
            bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl
            shadow-[var(--shadow-dropdown)]
            p-4 animate-slide-down
          "
        >
          {/* Quick select buttons */}
          <div className="mb-4">
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-2">
              Quick Select
            </p>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleQuickSelect(option)}
                  className="
                    px-3 py-1.5 text-sm font-medium rounded-lg
                    bg-[var(--bg-hover)] text-[var(--text-secondary)]
                    hover:bg-[var(--accent-light)] hover:text-[var(--accent-primary)]
                    transition-colors
                  "
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border-primary)] my-3" />

          {/* Custom date selection */}
          <div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-2">
              Custom Date
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={today}
                className="
                  flex-1 px-3 py-2 text-sm
                  bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg
                  text-[var(--text-primary)]
                  focus:outline-none focus:border-[var(--accent-primary)]
                "
              />
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="
                  w-24 px-3 py-2 text-sm
                  bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg
                  text-[var(--text-primary)]
                  focus:outline-none focus:border-[var(--accent-primary)]
                "
              />
            </div>
            <button
              type="button"
              onClick={handleCustomDateApply}
              disabled={!customDate}
              className="
                w-full py-2 text-sm font-medium rounded-lg
                bg-[var(--accent-primary)] text-white
                hover:bg-[var(--accent-primary-hover)]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              Apply
            </button>
          </div>

          {/* Clear option */}
          {value && (
            <>
              <div className="border-t border-[var(--border-primary)] my-3" />
              <button
                type="button"
                onClick={handleClear}
                className="
                  w-full py-2 text-sm font-medium rounded-lg
                  text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]
                  transition-colors
                "
              >
                Clear Deadline
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
