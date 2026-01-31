// In-memory mock store with lifecycle semantics
// Mirrors the contract state machine: open → claimed → submitted → paid/cancelled

import {
  Bounty,
  BountyStatus,
  Claim,
  Submission,
  ActivityEvent,
  BountyWithDetails,
  Asset,
} from './types';

// Generate unique IDs
let idCounter = 0;
const generateId = () => `bounty-${++idCounter}`;
const generateActivityId = () => `activity-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// In-memory storage
const bounties: Map<string, Bounty> = new Map();
const claims: Map<string, Claim> = new Map(); // bountyId → Claim
const submissions: Map<string, Submission> = new Map(); // bountyId → Submission
const activities: Map<string, ActivityEvent[]> = new Map(); // bountyId → events

// Add activity event helper
function addActivity(
  bountyId: string,
  type: ActivityEvent['type'],
  actor?: string,
  details?: string
) {
  const event: ActivityEvent = {
    id: generateActivityId(),
    bountyId,
    type,
    timestamp: new Date().toISOString(),
    actor,
    details,
  };
  const existing = activities.get(bountyId) || [];
  activities.set(bountyId, [...existing, event]);
  return event;
}

// Valid state transitions
const validTransitions: Record<BountyStatus, BountyStatus[]> = {
  open: ['claimed', 'cancelled'],
  claimed: ['submitted', 'cancelled'],
  submitted: ['paid', 'cancelled'],
  paid: [],
  cancelled: [],
};

function canTransition(from: BountyStatus, to: BountyStatus): boolean {
  return validTransitions[from].includes(to);
}

// Store operations
export const store = {
  // Create a new bounty
  createBounty(data: {
    title: string;
    description: string;
    acceptance: string[];
    payout: string;
    asset: Asset;
    assetAddress?: string;
    deadline?: string;
    creator?: string;
  }): Bounty {
    const id = generateId();
    const bounty: Bounty = {
      id,
      title: data.title,
      description: data.description,
      acceptance: data.acceptance,
      payout: data.payout,
      asset: data.asset,
      assetAddress: data.assetAddress || null,
      status: 'open',
      createdAt: new Date().toISOString(),
      deadline: data.deadline || null,
      creator: data.creator,
    };
    bounties.set(id, bounty);
    addActivity(id, 'created', data.creator, `Bounty created with ${data.payout} ${data.asset}`);
    return bounty;
  },

  // Get all bounties
  getAllBounties(): Bounty[] {
    return Array.from(bounties.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Get bounty by ID
  getBounty(id: string): Bounty | undefined {
    return bounties.get(id);
  },

  // Get bounty with all details
  getBountyWithDetails(id: string): BountyWithDetails | undefined {
    const bounty = bounties.get(id);
    if (!bounty) return undefined;

    return {
      ...bounty,
      claim: claims.get(id),
      submission: submissions.get(id),
      activity: activities.get(id) || [],
    };
  },

  // Claim a bounty (solver flow)
  claimBounty(
    bountyId: string,
    agentHandle: string,
    agentWallet?: string
  ): { success: boolean; error?: string } {
    const bounty = bounties.get(bountyId);
    if (!bounty) return { success: false, error: 'Bounty not found' };
    if (!canTransition(bounty.status, 'claimed')) {
      return { success: false, error: `Cannot claim bounty in ${bounty.status} status` };
    }

    // Check deadline
    if (bounty.deadline && new Date(bounty.deadline) < new Date()) {
      return { success: false, error: 'Bounty deadline has passed' };
    }

    const claim: Claim = {
      bountyId,
      agentHandle,
      agentWallet: agentWallet || null,
      claimedAt: new Date().toISOString(),
    };
    claims.set(bountyId, claim);
    bounty.status = 'claimed';
    bounties.set(bountyId, bounty);
    addActivity(bountyId, 'claimed', agentHandle, `Claimed by ${agentHandle}`);
    return { success: true };
  },

  // Submit proof (solver flow)
  submitProof(
    bountyId: string,
    proofUrl: string,
    notes?: string
  ): { success: boolean; error?: string } {
    const bounty = bounties.get(bountyId);
    if (!bounty) return { success: false, error: 'Bounty not found' };
    if (!canTransition(bounty.status, 'submitted')) {
      return { success: false, error: `Cannot submit proof for bounty in ${bounty.status} status` };
    }

    const submission: Submission = {
      bountyId,
      submittedAt: new Date().toISOString(),
      proofUrl,
      notes,
    };
    submissions.set(bountyId, submission);
    bounty.status = 'submitted';
    bounties.set(bountyId, bounty);

    const claim = claims.get(bountyId);
    addActivity(bountyId, 'submitted', claim?.agentHandle, `Proof submitted: ${proofUrl}`);
    return { success: true };
  },

  // Accept and pay (owner flow)
  acceptAndPay(bountyId: string, actor?: string): { success: boolean; error?: string } {
    const bounty = bounties.get(bountyId);
    if (!bounty) return { success: false, error: 'Bounty not found' };
    if (!canTransition(bounty.status, 'paid')) {
      return { success: false, error: `Cannot pay bounty in ${bounty.status} status` };
    }

    bounty.status = 'paid';
    bounties.set(bountyId, bounty);

    const claim = claims.get(bountyId);
    addActivity(
      bountyId,
      'paid',
      actor || bounty.creator,
      `Paid ${bounty.payout} ${bounty.asset} to ${claim?.agentHandle || 'solver'}`
    );
    return { success: true };
  },

  // Cancel bounty (owner flow)
  cancelBounty(bountyId: string, actor?: string): { success: boolean; error?: string } {
    const bounty = bounties.get(bountyId);
    if (!bounty) return { success: false, error: 'Bounty not found' };
    if (!canTransition(bounty.status, 'cancelled')) {
      return { success: false, error: `Cannot cancel bounty in ${bounty.status} status` };
    }

    bounty.status = 'cancelled';
    bounties.set(bountyId, bounty);
    addActivity(bountyId, 'cancelled', actor || bounty.creator, 'Bounty cancelled');
    return { success: true };
  },

  // Reset store (for testing)
  reset() {
    bounties.clear();
    claims.clear();
    submissions.clear();
    activities.clear();
    idCounter = 0;
  },
};

// Initialize with sample data
export function initializeSampleData() {
  store.reset();

  // Sample bounty 1: Open
  store.createBounty({
    title: 'Implement user authentication',
    description: 'Add OAuth2 login with Google and GitHub providers. Must include proper session handling and logout functionality.',
    acceptance: [
      'OAuth2 flow works with Google',
      'OAuth2 flow works with GitHub',
      'Sessions persist across page reloads',
      'Logout clears session properly',
    ],
    payout: '500',
    asset: 'USDC',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    creator: '0x1234...owner',
  });

  // Sample bounty 2: Claimed
  const b2 = store.createBounty({
    title: 'Fix pagination bug in dashboard',
    description: 'The dashboard shows incorrect page numbers when filtering by date range.',
    acceptance: [
      'Page numbers display correctly',
      'Navigation works with filters applied',
    ],
    payout: '0.1',
    asset: 'ETH',
    creator: '0x1234...owner',
  });
  store.claimBounty(b2.id, 'alice_dev', '0xabcd...alice');

  // Sample bounty 3: Submitted
  const b3 = store.createBounty({
    title: 'Add dark mode support',
    description: 'Implement a toggle for dark/light mode that persists user preference.',
    acceptance: [
      'Toggle switches between modes',
      'Preference saved in localStorage',
      'All components styled for both modes',
    ],
    payout: '200',
    asset: 'USDC',
    creator: '0x1234...owner',
  });
  store.claimBounty(b3.id, 'bob_coder', '0xdef0...bob');
  store.submitProof(b3.id, 'https://github.com/example/pr/123', 'Dark mode implementation complete. See PR for details.');

  // Sample bounty 4: Paid
  const b4 = store.createBounty({
    title: 'Write API documentation',
    description: 'Document all REST endpoints with examples.',
    acceptance: ['All endpoints documented', 'Examples provided for each'],
    payout: '150',
    asset: 'USDC',
    creator: '0x1234...owner',
  });
  store.claimBounty(b4.id, 'carol_writer', '0x9876...carol');
  store.submitProof(b4.id, 'https://docs.example.com/api');
  store.acceptAndPay(b4.id);

  // Sample bounty 5: Cancelled
  const b5 = store.createBounty({
    title: 'Deprecated feature removal',
    description: 'This bounty was created in error.',
    acceptance: ['N/A'],
    payout: '50',
    asset: 'USDC',
    creator: '0x1234...owner',
  });
  store.cancelBounty(b5.id);
}
