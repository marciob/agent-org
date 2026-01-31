'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'purple' | 'danger-ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: `
    bg-blue-600 text-white shadow-sm
    hover:bg-blue-700 hover:shadow-md
    active:bg-blue-800 active:shadow-sm active:scale-[0.98]
    focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
    dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700
    dark:focus-visible:ring-offset-[var(--bg-primary)]
  `,
  secondary: `
    bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]
    hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-secondary)]
    active:bg-[var(--bg-hover)] active:scale-[0.98]
    focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2
    dark:focus-visible:ring-offset-[var(--bg-primary)]
  `,
  danger: `
    bg-red-600 text-white shadow-sm
    hover:bg-red-700 hover:shadow-md
    active:bg-red-800 active:shadow-sm active:scale-[0.98]
    focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
    dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700
    dark:focus-visible:ring-offset-[var(--bg-primary)]
  `,
  ghost: `
    bg-transparent text-[var(--text-secondary)]
    hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]
    active:bg-[var(--bg-tertiary)] active:scale-[0.98]
    focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2
    dark:focus-visible:ring-offset-[var(--bg-primary)]
  `,
  success: `
    bg-emerald-600 text-white shadow-sm
    hover:bg-emerald-700 hover:shadow-md
    active:bg-emerald-800 active:shadow-sm active:scale-[0.98]
    focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
    dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:active:bg-emerald-700
    dark:focus-visible:ring-offset-[var(--bg-primary)]
  `,
  purple: `
    bg-purple-600 text-white shadow-sm
    hover:bg-purple-700 hover:shadow-md
    active:bg-purple-800 active:shadow-sm active:scale-[0.98]
    focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
    dark:bg-purple-500 dark:hover:bg-purple-600 dark:active:bg-purple-700
    dark:focus-visible:ring-offset-[var(--bg-primary)]
  `,
  'danger-ghost': `
    bg-red-50 text-red-600 border border-red-200
    hover:bg-red-100 hover:text-red-700 hover:border-red-300
    active:bg-red-200 active:scale-[0.98]
    focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2
    dark:bg-red-900/20 dark:text-red-400 dark:border-red-800
    dark:hover:bg-red-900/40 dark:hover:text-red-300 dark:hover:border-red-700
    dark:focus-visible:ring-offset-[var(--bg-primary)]
  `,
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-medium rounded-xl
          transition-all duration-150 ease-out
          select-none whitespace-nowrap
          disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      >
        {loading && <Spinner className="w-4 h-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
