'use client';

import { Bounty } from '@/lib/types';
import { StatusBadge } from './StatusBadge';

interface BountyListProps {
  bounties: Bounty[];
  onSelect: (bounty: Bounty) => void;
  selectedId?: string;
}

function formatDeadline(deadline: string | null | undefined): string {
  if (!deadline) return 'No deadline';
  const date = new Date(deadline);
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff < 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d left`;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h left`;

  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}m left`;
}

export function BountyList({ bounties, onSelect, selectedId }: BountyListProps) {
  if (bounties.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No bounties yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {bounties.map((bounty) => (
        <button
          key={bounty.id}
          onClick={() => onSelect(bounty)}
          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
            selectedId === bounty.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={bounty.status} />
                <span className="text-xs text-gray-500">
                  {formatDeadline(bounty.deadline)}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 truncate">{bounty.title}</h3>
              <p className="text-sm text-gray-500 truncate mt-1">
                {bounty.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-semibold text-gray-900">
                {bounty.payout} {bounty.asset}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
