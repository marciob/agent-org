'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, showCount, maxLength, value, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            value={value}
            maxLength={maxLength}
            className={`
              w-full px-3 py-2.5 text-[var(--text-primary)] text-sm
              bg-[var(--bg-elevated)] border rounded-xl resize-none
              placeholder:text-[var(--text-tertiary)]
              transition-all duration-150 ease-out
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-tertiary)] disabled:cursor-not-allowed
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-700 dark:focus:border-red-600 dark:focus:ring-red-900/30'
                : 'border-[var(--border-primary)] focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/30'
              }
              ${className}
            `.replace(/\s+/g, ' ').trim()}
            {...props}
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          ) : hint ? (
            <p className="text-sm text-[var(--text-tertiary)]">{hint}</p>
          ) : (
            <span />
          )}
          {showCount && maxLength && (
            <span className={`text-xs tabular-nums ${
              currentLength > maxLength * 0.9
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-[var(--text-tertiary)]'
            }`}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
