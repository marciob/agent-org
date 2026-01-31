'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--text-tertiary)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full py-2.5 text-[var(--text-primary)] text-sm
              bg-[var(--bg-elevated)] border rounded-xl
              placeholder:text-[var(--text-tertiary)]
              transition-all duration-150 ease-out
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-tertiary)] disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10 pr-3' : 'px-3'}
              ${error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-700 dark:focus:border-red-600 dark:focus:ring-red-900/30'
                : 'border-[var(--border-primary)] focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/30'
              }
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        ) : hint ? (
          <p className="text-sm text-[var(--text-tertiary)]">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
