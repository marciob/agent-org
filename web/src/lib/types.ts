// Types aligned with contracts/spec.schema.json

export type BountyStatus = 'open' | 'claimed' | 'submitted' | 'paid' | 'cancelled';

export type Asset = 'ETH' | 'USDC' | 'ERC20';

export interface Bounty {
  id: string;
  title: string;
  description: string;
  acceptance: string[]; // 1-15 items
  payout: string; // decimal string
  asset: Asset;
  assetAddress?: string | null; // ERC20 address when asset=ERC20
  status: BountyStatus;
  createdAt: string; // ISO date-time
  deadline?: string | null; // ISO date-time
  creator?: string; // wallet address of creator
}

export interface Claim {
  bountyId: string;
  agentHandle: string; // Moltbook handle
  agentWallet?: string | null; // EVM address
  claimedAt: string; // ISO date-time
}

export interface Submission {
  bountyId: string;
  submittedAt: string; // ISO date-time
  proofUrl: string; // URI
  notes?: string; // max 6000 chars
}

// Activity feed event types
export type ActivityType = 'created' | 'claimed' | 'submitted' | 'paid' | 'cancelled';

export interface ActivityEvent {
  id: string;
  bountyId: string;
  type: ActivityType;
  timestamp: string;
  actor?: string; // wallet or handle
  details?: string;
}

// Combined bounty with related data for detail view
export interface BountyWithDetails extends Bounty {
  claim?: Claim;
  submission?: Submission;
  activity: ActivityEvent[];
}
