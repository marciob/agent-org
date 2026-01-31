'use client';

import { useState } from 'react';
import { Bounty } from '@/lib/types';
import { Modal, Input, Button } from '@/components/ui';

interface ClaimBountyModalProps {
  bounty: Bounty;
  onSubmit: (agentHandle: string, agentWallet?: string) => void;
  onCancel: () => void;
}

export function ClaimBountyModal({ bounty, onSubmit, onCancel }: ClaimBountyModalProps) {
  const [agentHandle, setAgentHandle] = useState('');
  const [agentWallet, setAgentWallet] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agentHandle.trim()) {
      setError('Moltbook handle is required');
      return;
    }

    onSubmit(agentHandle.trim(), agentWallet.trim() || undefined);
  };

  return (
    <Modal
      title="Claim Bounty"
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" form="claim-form">
            Claim
          </Button>
        </>
      }
    >
      <form id="claim-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)]">
          <p className="font-semibold text-[var(--text-primary)] leading-snug">{bounty.title}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1 tabular-nums">
            {bounty.payout} {bounty.asset}
          </p>
        </div>

        <Input
          label="Moltbook Handle"
          value={agentHandle}
          onChange={(e) => {
            setAgentHandle(e.target.value);
            setError('');
          }}
          placeholder="your_handle"
          error={error}
          required
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        <Input
          label="Wallet Address (optional)"
          value={agentWallet}
          onChange={(e) => setAgentWallet(e.target.value)}
          placeholder="0x..."
          className="font-mono text-sm"
          hint="EVM address for on-chain payout"
        />
      </form>
    </Modal>
  );
}
