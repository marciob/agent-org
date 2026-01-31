'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Bounty, BountyWithDetails, Asset, BountyStatus } from '@/lib/types';
import { store, initializeSampleData } from '@/lib/store';
import { ToastType } from '@/components/Toast';

export type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

interface FilterState {
  status: BountyStatus | 'all';
  asset: string;
  payoutRange: [number, number];
  sortOption: SortOption;
  searchQuery: string;
}

interface ToastState {
  message: string;
  type: ToastType;
}

export function useBounties() {
  const [isClient, setIsClient] = useState(false);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    asset: 'all',
    payoutRange: [0, 10000],
    sortOption: 'newest',
    searchQuery: '',
  });

  useEffect(() => {
    queueMicrotask(() => {
      initializeSampleData();
      setBounties(store.getAllBounties());
      setIsClient(true);
    });
  }, []);

  const filteredBounties = useMemo(() => {
    let result = [...bounties];
    const { searchQuery, status, asset, payoutRange, sortOption } = filters;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) => b.title.toLowerCase().includes(query) || b.description.toLowerCase().includes(query)
      );
    }
    if (status !== 'all') result = result.filter((b) => b.status === status);
    if (asset !== 'all') result = result.filter((b) => b.asset === asset);
    result = result.filter((b) => {
      const payout = parseFloat(b.payout);
      return payout >= payoutRange[0] && payout <= payoutRange[1];
    });

    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest': return parseFloat(b.payout) - parseFloat(a.payout);
        case 'lowest': return parseFloat(a.payout) - parseFloat(b.payout);
        default: return 0;
      }
    });
    return result;
  }, [bounties, filters]);

  const refreshBounties = useCallback(() => setBounties(store.getAllBounties()), []);
  const showToast = useCallback((message: string, type: ToastType) => setToast({ message, type }), []);
  const clearToast = useCallback(() => setToast(null), []);

  const getBountyDetails = useCallback((id: string) => store.getBountyWithDetails(id), []);

  const createBounty = useCallback((data: {
    title: string; description: string; acceptance: string[];
    payout: string; asset: Asset; assetAddress?: string; deadline?: string;
  }) => {
    const bounty = store.createBounty({ ...data, creator: '0xYourWallet' });
    refreshBounties();
    showToast('Bounty created successfully', 'success');
    return bounty;
  }, [refreshBounties, showToast]);

  const claimBounty = useCallback((bountyId: string, agentHandle: string, agentWallet?: string) => {
    const result = store.claimBounty(bountyId, agentHandle, agentWallet);
    if (result.success) {
      refreshBounties();
      showToast('Bounty claimed successfully', 'success');
    } else {
      showToast(result.error || 'Failed to claim bounty', 'error');
    }
    return result;
  }, [refreshBounties, showToast]);

  const submitProof = useCallback((bountyId: string, proofUrl: string, notes?: string) => {
    const result = store.submitProof(bountyId, proofUrl, notes);
    if (result.success) {
      refreshBounties();
      showToast('Proof submitted successfully', 'success');
    } else {
      showToast(result.error || 'Failed to submit proof', 'error');
    }
    return result;
  }, [refreshBounties, showToast]);

  const acceptAndPay = useCallback((bountyId: string) => {
    const result = store.acceptAndPay(bountyId);
    if (result.success) {
      refreshBounties();
      showToast('Bounty paid successfully', 'success');
    } else {
      showToast(result.error || 'Failed to pay bounty', 'error');
    }
    return result;
  }, [refreshBounties, showToast]);

  const cancelBounty = useCallback((bountyId: string) => {
    const result = store.cancelBounty(bountyId);
    if (result.success) {
      refreshBounties();
      showToast('Bounty cancelled', 'info');
    } else {
      showToast(result.error || 'Failed to cancel bounty', 'error');
    }
    return result;
  }, [refreshBounties, showToast]);

  const clearFilters = useCallback(() => {
    setFilters({ status: 'all', asset: 'all', payoutRange: [0, 10000], sortOption: 'newest', searchQuery: '' });
  }, []);

  return {
    isClient,
    bounties: filteredBounties,
    filters,
    setFilters,
    clearFilters,
    toast,
    clearToast,
    getBountyDetails,
    createBounty,
    claimBounty,
    submitProof,
    acceptAndPay,
    cancelBounty,
  };
}
