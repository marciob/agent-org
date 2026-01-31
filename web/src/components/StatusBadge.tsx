'use client';

import { ReactElement } from 'react';
import { BountyStatus } from '@/lib/types';

const statusConfig: Record<BountyStatus, {
  label: string;
  lightClass: string;
  darkClass: string;
  icon: ReactElement;
}> = {
  open: {
    label: 'Open',
    lightClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    darkClass: 'dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  claimed: {
    label: 'Claimed',
    lightClass: 'bg-blue-50 text-blue-700 border-blue-200',
    darkClass: 'dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  submitted: {
    label: 'Submitted',
    lightClass: 'bg-amber-50 text-amber-700 border-amber-200',
    darkClass: 'dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  paid: {
    label: 'Paid',
    lightClass: 'bg-purple-50 text-purple-700 border-purple-200',
    darkClass: 'dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  cancelled: {
    label: 'Cancelled',
    lightClass: 'bg-gray-100 text-gray-600 border-gray-200',
    darkClass: 'dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

interface StatusBadgeProps {
  status: BountyStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, showIcon = true, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status];

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-3 py-1 text-sm gap-1.5';

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.lightClass}
        ${config.darkClass}
        ${sizeClasses}
      `.trim().replace(/\s+/g, ' ')}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
}
