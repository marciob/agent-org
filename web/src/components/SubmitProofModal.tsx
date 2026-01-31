'use client';

import { useState } from 'react';
import { Bounty } from '@/lib/types';
import { Modal, Input, Textarea, Button } from '@/components/ui';

interface SubmitProofModalProps {
  bounty: Bounty;
  onSubmit: (proofUrl: string, notes?: string) => void;
  onCancel: () => void;
}

export function SubmitProofModal({ bounty, onSubmit, onCancel }: SubmitProofModalProps) {
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofUrl.trim()) {
      setError('Proof URL is required');
      return;
    }

    if (!validateUrl(proofUrl.trim())) {
      setError('Please enter a valid URL');
      return;
    }

    onSubmit(proofUrl.trim(), notes.trim() || undefined);
  };

  return (
    <Modal
      title="Submit Proof"
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" form="proof-form" variant="success">
            Submit Proof
          </Button>
        </>
      }
    >
      <form id="proof-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
          <p className="font-semibold text-gray-900 leading-snug">{bounty.title}</p>
          <p className="text-emerald-600 font-bold mt-1 tabular-nums">
            {bounty.payout} {bounty.asset}
          </p>
        </div>

        <Input
          label="Proof URL"
          value={proofUrl}
          onChange={(e) => {
            setProofUrl(e.target.value);
            setError('');
          }}
          placeholder="https://github.com/..."
          error={error}
          required
          hint="Link to PR, demo, or deliverable"
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
        />

        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={6000}
          placeholder="Additional context or instructions..."
          showCount
        />
      </form>
    </Modal>
  );
}
