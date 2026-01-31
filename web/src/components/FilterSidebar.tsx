'use client';

import { useState } from 'react';
import { BountyStatus } from '@/lib/types';

interface FilterSidebarProps {
  selectedStatus: BountyStatus | 'all';
  onStatusChange: (status: BountyStatus | 'all') => void;
  selectedAsset: string;
  onAssetChange: (asset: string) => void;
  payoutRange: [number, number];
  onPayoutRangeChange: (range: [number, number]) => void;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--border-primary)] pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <span className="text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        <svg
          className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="space-y-2">{children}</div>}
    </div>
  );
}

interface RadioOptionProps {
  label: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}

function RadioOption({ label, value, checked, onChange, count }: RadioOptionProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={`
          w-4 h-4 rounded-full border-2 flex items-center justify-center
          transition-colors duration-150
          ${checked
            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]'
            : 'border-[var(--border-secondary)] group-hover:border-[var(--text-tertiary)]'
          }
        `}
      >
        {checked && (
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        )}
      </div>
      <span className={`text-sm ${checked ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-[var(--text-tertiary)] ml-auto">{count}</span>
      )}
    </label>
  );
}

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function CheckboxOption({ label, checked, onChange }: CheckboxOptionProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={`
          w-4 h-4 rounded border flex items-center justify-center
          transition-colors duration-150
          ${checked
            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]'
            : 'border-[var(--border-secondary)] group-hover:border-[var(--text-tertiary)]'
          }
        `}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm ${checked ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
        {label}
      </span>
    </label>
  );
}

export function FilterSidebar({
  selectedStatus,
  onStatusChange,
  selectedAsset,
  onAssetChange,
  payoutRange,
  onPayoutRangeChange,
}: FilterSidebarProps) {
  const statusOptions: { value: BountyStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'claimed', label: 'Claimed' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const assetOptions = [
    { value: 'all', label: 'All Assets' },
    { value: 'USDC', label: 'USDC' },
    { value: 'ETH', label: 'ETH' },
    { value: 'ERC20', label: 'Other ERC20' },
  ];

  const payoutPresets = [
    { label: 'Any amount', range: [0, 10000] as [number, number] },
    { label: 'Under $100', range: [0, 100] as [number, number] },
    { label: '$100 - $500', range: [100, 500] as [number, number] },
    { label: '$500 - $1,000', range: [500, 1000] as [number, number] },
    { label: '$1,000+', range: [1000, 10000] as [number, number] },
  ];

  const isPayoutRangeSelected = (range: [number, number]) =>
    payoutRange[0] === range[0] && payoutRange[1] === range[1];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Filter</h2>
        <button
          onClick={() => {
            onStatusChange('all');
            onAssetChange('all');
            onPayoutRangeChange([0, 10000]);
          }}
          className="text-xs text-[var(--accent-primary)] hover:underline"
        >
          Reset all
        </button>
      </div>

      <FilterSection title="Status">
        {statusOptions.map((option) => (
          <RadioOption
            key={option.value}
            label={option.label}
            value={option.value}
            checked={selectedStatus === option.value}
            onChange={() => onStatusChange(option.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Payout Range">
        {payoutPresets.map((preset) => (
          <RadioOption
            key={preset.label}
            label={preset.label}
            value={preset.label}
            checked={isPayoutRangeSelected(preset.range)}
            onChange={() => onPayoutRangeChange(preset.range)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Asset Type">
        {assetOptions.map((option) => (
          <CheckboxOption
            key={option.value}
            label={option.label}
            checked={selectedAsset === option.value}
            onChange={() => onAssetChange(option.value)}
          />
        ))}
      </FilterSection>

      {/* Featured promo box like reference */}
      <div className="mt-6 p-4 rounded-xl hero-gradient text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🤖</span>
          <span className="font-semibold text-sm">AI Agent Ready!</span>
        </div>
        <p className="text-xs text-white/90 mb-3">
          Let AI agents claim and complete bounties on your behalf automatically.
        </p>
        <button className="w-full py-2 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
}
