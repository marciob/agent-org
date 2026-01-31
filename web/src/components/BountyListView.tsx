'use client';

import { Bounty, BountyStatus } from '@/lib/types';
import { BountyCard } from './BountyCard';
import { FilterSidebar } from './FilterSidebar';
import { Button, Dropdown } from './ui';
import { SortOption } from '@/hooks/useBounties';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Payout' },
  { value: 'lowest', label: 'Lowest Payout' },
];

interface BountyListViewProps {
  bounties: Bounty[];
  filters: {
    status: BountyStatus | 'all';
    asset: string;
    payoutRange: [number, number];
    sortOption: SortOption;
    searchQuery: string;
  };
  onFilterChange: (updates: Partial<BountyListViewProps['filters']>) => void;
  onClearFilters: () => void;
  onBountyClick: (bounty: Bounty) => void;
  onCreateClick: () => void;
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-16 px-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
      <div className="w-16 h-16 mx-auto mb-5 rounded-xl bg-[var(--accent-light)] flex items-center justify-center">
        <svg className="w-8 h-8 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No bounties yet</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
        Create your first bounty to start rewarding agents for completing tasks.
      </p>
      <Button onClick={onCreateClick}>Create First Bounty</Button>
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
      <svg className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p className="text-[var(--text-secondary)] mb-3">No bounties match your filters</p>
      <button onClick={onClear} className="text-sm text-[var(--accent-primary)] hover:underline font-medium">
        Clear all filters
      </button>
    </div>
  );
}

export function BountyListView({
  bounties,
  filters,
  onFilterChange,
  onClearFilters,
  onBountyClick,
  onCreateClick,
}: BountyListViewProps) {
  const hasFilters = filters.searchQuery || filters.status !== 'all' || filters.asset !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-4">
              <FilterSidebar
                selectedStatus={filters.status}
                onStatusChange={(status) => onFilterChange({ status })}
                selectedAsset={filters.asset}
                onAssetChange={(asset) => onFilterChange({ asset })}
                payoutRange={filters.payoutRange}
                onPayoutRangeChange={(payoutRange) => onFilterChange({ payoutRange })}
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Explore All Bounties
              <span className="text-[var(--text-tertiary)] font-normal ml-2">({bounties.length} Available)</span>
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={onCreateClick}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Bounty
              </button>
              <Dropdown
                options={sortOptions}
                value={filters.sortOption}
                onChange={(v) => onFilterChange({ sortOption: v as SortOption })}
                placeholder="Sort By"
                className="w-40"
              />
            </div>
          </div>

          {bounties.length === 0 ? (
            hasFilters ? <NoResults onClear={onClearFilters} /> : <EmptyState onCreateClick={onCreateClick} />
          ) : (
            <div className="space-y-4">
              {bounties.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} onClick={() => onBountyClick(bounty)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
