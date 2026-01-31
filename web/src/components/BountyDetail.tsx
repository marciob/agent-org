'use client';

import { BountyWithDetails } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui';

interface BountyDetailProps {
  bounty: BountyWithDetails;
  onBack: () => void;
  onClaim: () => void;
  onSubmit: () => void;
  onAcceptPay: () => void;
  onCancel: () => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString();
}

export function BountyDetail({
  bounty,
  onBack,
  onClaim,
  onSubmit,
  onAcceptPay,
  onCancel,
}: BountyDetailProps) {
  const canClaim = bounty.status === 'open';
  const canSubmit = bounty.status === 'claimed';
  const canAcceptPay = bounty.status === 'submitted';
  const canCancel = ['open', 'claimed', 'submitted'].includes(bounty.status);

  return (
    <div className="h-full flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border-primary)] bg-[var(--bg-elevated)]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to bounties
        </button>
        <div className="flex items-center gap-3 mb-2">
          <StatusBadge status={bounty.status} />
          <span className="text-sm text-[var(--text-tertiary)]">
            Created {formatDate(bounty.createdAt)}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{bounty.title}</h2>
        <div className="mt-2 flex items-center gap-4">
          <span className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
            {bounty.payout} {bounty.asset}
          </span>
          {bounty.deadline && (
            <span className="text-sm text-[var(--text-tertiary)]">
              Deadline: {formatDate(bounty.deadline)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Description */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
            Description
          </h3>
          <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{bounty.description}</p>
        </section>

        {/* Acceptance Criteria */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
            Acceptance Criteria
          </h3>
          <ul className="space-y-2">
            {bounty.acceptance.map((criterion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-emerald-500 dark:text-emerald-400 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span className="text-[var(--text-secondary)]">{criterion}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Claim Info */}
        {bounty.claim && (
          <section className="bg-[var(--status-claimed-bg)] rounded-xl p-4 border border-blue-200 dark:border-blue-800/50">
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-2">
              Claimed By
            </h3>
            <div className="text-blue-900 dark:text-blue-100">
              <p className="font-medium">{bounty.claim.agentHandle}</p>
              {bounty.claim.agentWallet && (
                <p className="text-sm text-blue-600 dark:text-blue-400 font-mono">
                  {bounty.claim.agentWallet}
                </p>
              )}
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {formatDate(bounty.claim.claimedAt)}
              </p>
            </div>
          </section>
        )}

        {/* Submission Info */}
        {bounty.submission && (
          <section className="bg-[var(--status-submitted-bg)] rounded-xl p-4 border border-amber-200 dark:border-amber-800/50">
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-2">
              Submission
            </h3>
            <div className="text-amber-900 dark:text-amber-100">
              <a
                href={bounty.submission.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {bounty.submission.proofUrl}
              </a>
              {bounty.submission.notes && (
                <p className="mt-2 text-sm">{bounty.submission.notes}</p>
              )}
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                {formatDate(bounty.submission.submittedAt)}
              </p>
            </div>
          </section>
        )}

        {/* Activity Feed */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
            Activity
          </h3>
          <div className="space-y-3">
            {bounty.activity.length === 0 ? (
              <p className="text-[var(--text-tertiary)] text-sm">No activity yet</p>
            ) : (
              bounty.activity.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium text-[var(--text-primary)] capitalize">
                      {event.type}
                    </span>
                    {event.actor && (
                      <span className="text-[var(--text-secondary)]"> by {event.actor}</span>
                    )}
                    {event.details && (
                      <p className="text-[var(--text-tertiary)]">{event.details}</p>
                    )}
                    <p className="text-[var(--text-tertiary)] text-xs">
                      {formatDate(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex flex-wrap gap-3">
          {canClaim && (
            <Button onClick={onClaim}>Claim Bounty</Button>
          )}
          {canSubmit && (
            <Button variant="success" onClick={onSubmit}>Submit Proof</Button>
          )}
          {canAcceptPay && (
            <Button variant="purple" onClick={onAcceptPay}>Accept & Pay</Button>
          )}
          {canCancel && (
            <Button variant="danger-ghost" onClick={onCancel}>Cancel</Button>
          )}
        </div>
      </div>
    </div>
  );
}
