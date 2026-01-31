'use client';

import { Bounty, BountyStatus } from '@/lib/types';
import { StatusBadge } from './StatusBadge';

interface BountyCardProps {
  bounty: Bounty;
  onClick: () => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// Status indicator colors for the left icon
const statusIconColors: Record<BountyStatus, string> = {
  open: 'bg-emerald-500',
  claimed: 'bg-blue-500',
  submitted: 'bg-amber-500',
  paid: 'bg-purple-500',
  cancelled: 'bg-gray-400',
};

export function BountyCard({ bounty, onClick }: BountyCardProps) {
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="
        w-full bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]
        p-4 sm:p-5
        card-hover cursor-pointer
        hover:border-[var(--border-secondary)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2
      "
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex gap-4">
        {/* Left: Status indicator icon */}
        <div className="hidden sm:flex shrink-0">
          <div className={`w-12 h-12 rounded-xl ${statusIconColors[bounty.status]} flex items-center justify-center`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0">
          {/* Title row with time */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1 text-base">
              {bounty.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[var(--text-tertiary)]">
                {formatTimeAgo(bounty.createdAt)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Bookmark functionality
                }}
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded transition-colors"
                aria-label="Bookmark"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Asset and criteria info */}
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            {bounty.asset} • {bounty.acceptance.length} acceptance criteria
          </p>

          {/* Description */}
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
            {bounty.description}
          </p>

          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-3.5-8v2H11v2h2v-2h1a2.5 2.5 0 100-5h-4a.5.5 0 110-1h5.5V8H13V6h-2v2h-1a2.5 2.5 0 000 5h4a.5.5 0 010 1H8.5z"/>
              </svg>
              {bounty.payout} {bounty.asset}
            </span>
            <StatusBadge status={bounty.status} size="sm" />
            {bounty.deadline && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(bounty.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Right: Action button */}
        <div className="hidden sm:flex items-center shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="
              px-4 py-2 rounded-lg text-sm font-medium
              bg-[var(--accent-primary)] text-white
              hover:bg-[var(--accent-primary-hover)]
              transition-colors duration-150
              flex items-center gap-1.5
            "
          >
            Apply
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
