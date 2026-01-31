'use client';

import { useState } from 'react';
import { Asset } from '@/lib/types';
import { Input, Textarea, Button, Dropdown, DatePicker } from '@/components/ui';

interface CreateBountyFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    acceptance: string[];
    payout: string;
    asset: Asset;
    assetAddress?: string;
    deadline?: string;
  }) => void;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  acceptance?: string;
  payout?: string;
  assetAddress?: string;
}

const assetOptions = [
  { value: 'USDC', label: 'USDC' },
  { value: 'ETH', label: 'ETH' },
  { value: 'ERC20', label: 'Other ERC20' },
];

export function CreateBountyForm({ onSubmit, onCancel }: CreateBountyFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [acceptanceText, setAcceptanceText] = useState('');
  const [payout, setPayout] = useState('');
  const [asset, setAsset] = useState<Asset>('USDC');
  const [assetAddress, setAssetAddress] = useState('');
  const [deadline, setDeadline] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 120) {
      newErrors.title = 'Title must be 120 characters or less';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length > 6000) {
      newErrors.description = 'Description must be 6000 characters or less';
    }

    const criteria = acceptanceText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (criteria.length === 0) {
      newErrors.acceptance = 'At least one acceptance criterion is required';
    } else if (criteria.length > 15) {
      newErrors.acceptance = 'Maximum 15 acceptance criteria allowed';
    }

    if (!payout.trim()) {
      newErrors.payout = 'Payout amount is required';
    } else if (isNaN(parseFloat(payout)) || parseFloat(payout) <= 0) {
      newErrors.payout = 'Payout must be a positive number';
    }

    if (asset === 'ERC20' && !assetAddress.trim()) {
      newErrors.assetAddress = 'Token address is required for ERC20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const acceptance = acceptanceText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      acceptance,
      payout: payout.trim(),
      asset,
      assetAddress: asset === 'ERC20' ? assetAddress.trim() : undefined,
      deadline: deadline || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Create New Bounty</h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-xl hover:bg-[var(--bg-hover)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-1">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Brief title for the bounty"
          error={errors.title}
          required
        />
        <p className="text-xs text-[var(--text-tertiary)]">{title.length}/120</p>
      </div>

      <div className="space-y-1">
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={6000}
          rows={4}
          placeholder="Detailed description of what needs to be done"
          error={errors.description}
        />
        <p className="text-xs text-[var(--text-tertiary)]">{description.length}/6000</p>
      </div>

      <div className="space-y-1">
        <Textarea
          label="Acceptance Criteria"
          value={acceptanceText}
          onChange={(e) => setAcceptanceText(e.target.value)}
          rows={4}
          placeholder="One criterion per line (1-15 criteria)"
          error={errors.acceptance}
        />
        <p className="text-xs text-[var(--text-tertiary)]">Enter each acceptance criterion on a new line</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Payout Amount"
          value={payout}
          onChange={(e) => setPayout(e.target.value)}
          placeholder="100"
          error={errors.payout}
          required
        />
        <Dropdown
          label="Asset"
          value={asset}
          onChange={(value) => setAsset(value as Asset)}
          options={assetOptions}
        />
      </div>

      {asset === 'ERC20' && (
        <Input
          label="Token Address"
          value={assetAddress}
          onChange={(e) => setAssetAddress(e.target.value)}
          placeholder="0x..."
          error={errors.assetAddress}
          className="font-mono text-sm"
          required
        />
      )}

      <DatePicker
        label="Deadline (optional)"
        value={deadline}
        onChange={setDeadline}
        placeholder="No deadline set"
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          Create Bounty
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
