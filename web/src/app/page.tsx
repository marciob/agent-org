'use client';

import { useState } from 'react';
import { Bounty, BountyWithDetails } from '@/lib/types';
import { useBounties } from '@/hooks/useBounties';
import { Header } from '@/components/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { BountyListView } from '@/components/BountyListView';
import { BountyDetail } from '@/components/BountyDetail';
import { CreateBountyForm } from '@/components/CreateBountyForm';
import { ClaimBountyModal } from '@/components/ClaimBountyModal';
import { SubmitProofModal } from '@/components/SubmitProofModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Toast } from '@/components/Toast';

type View = { type: 'list' } | { type: 'detail'; bounty: BountyWithDetails } | { type: 'create' };
type ModalState =
  | { type: 'none' }
  | { type: 'claim'; bounty: Bounty }
  | { type: 'submit'; bounty: Bounty }
  | { type: 'acceptPay'; bounty: Bounty }
  | { type: 'cancel'; bounty: Bounty };

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="h-16 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="h-48 bg-[var(--bg-secondary)] rounded-2xl mb-6 animate-pulse" />
        <div className="flex gap-6">
          <div className="hidden lg:block w-64 shrink-0">
            <div className="h-96 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
          </div>
          <div className="flex-1 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const {
    isClient, bounties, filters, setFilters, clearFilters,
    toast, clearToast, getBountyDetails,
    createBounty, claimBounty, submitProof, acceptAndPay, cancelBounty,
  } = useBounties();

  const [view, setView] = useState<View>({ type: 'list' });
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [activeNav, setActiveNav] = useState('explore');

  const selectBounty = (bounty: Bounty) => {
    const details = getBountyDetails(bounty.id);
    if (details) setView({ type: 'detail', bounty: details });
  };

  const refreshView = (bountyId: string) => {
    const updated = getBountyDetails(bountyId);
    if (updated) setView({ type: 'detail', bounty: updated });
  };

  if (!isClient) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header activeNav={activeNav} onNavChange={setActiveNav} onLogoClick={() => setView({ type: 'list' })} />

      {view.type === 'list' && (
        <>
          <HeroBanner
            searchQuery={filters.searchQuery}
            onSearchChange={(searchQuery) => setFilters((f) => ({ ...f, searchQuery }))}
          />
          <BountyListView
            bounties={bounties}
            filters={filters}
            onFilterChange={(updates) => setFilters((f) => ({ ...f, ...updates }))}
            onClearFilters={clearFilters}
            onBountyClick={selectBounty}
            onCreateClick={() => setView({ type: 'create' })}
          />
        </>
      )}

      {view.type === 'detail' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden min-h-[600px] animate-fade-in" style={{ boxShadow: 'var(--shadow-card)' }}>
            <BountyDetail
              bounty={view.bounty}
              onBack={() => setView({ type: 'list' })}
              onClaim={() => setModal({ type: 'claim', bounty: view.bounty })}
              onSubmit={() => setModal({ type: 'submit', bounty: view.bounty })}
              onAcceptPay={() => setModal({ type: 'acceptPay', bounty: view.bounty })}
              onCancel={() => setModal({ type: 'cancel', bounty: view.bounty })}
            />
          </div>
        </div>
      )}

      {view.type === 'create' && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden animate-fade-in" style={{ boxShadow: 'var(--shadow-card)' }}>
            <CreateBountyForm
              onSubmit={(data) => {
                const bounty = createBounty(data);
                selectBounty(bounty);
              }}
              onCancel={() => setView({ type: 'list' })}
            />
          </div>
        </div>
      )}

      {modal.type === 'claim' && (
        <ClaimBountyModal
          bounty={modal.bounty}
          onSubmit={(handle, wallet) => {
            const result = claimBounty(modal.bounty.id, handle, wallet);
            if (result.success) { refreshView(modal.bounty.id); setModal({ type: 'none' }); }
          }}
          onCancel={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'submit' && (
        <SubmitProofModal
          bounty={modal.bounty}
          onSubmit={(url, notes) => {
            const result = submitProof(modal.bounty.id, url, notes);
            if (result.success) { refreshView(modal.bounty.id); setModal({ type: 'none' }); }
          }}
          onCancel={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'acceptPay' && (
        <ConfirmModal
          title="Accept & Pay"
          message={`Are you sure you want to accept the submission and pay ${modal.bounty.payout} ${modal.bounty.asset}?`}
          confirmLabel="Accept & Pay"
          variant="purple"
          onConfirm={() => {
            const result = acceptAndPay(modal.bounty.id);
            if (result.success) { refreshView(modal.bounty.id); setModal({ type: 'none' }); }
          }}
          onCancel={() => setModal({ type: 'none' })}
        />
      )}

      {modal.type === 'cancel' && (
        <ConfirmModal
          title="Cancel Bounty"
          message="Are you sure you want to cancel this bounty? The funds will be refunded to the creator."
          confirmLabel="Cancel Bounty"
          variant="danger"
          onConfirm={() => {
            const result = cancelBounty(modal.bounty.id);
            if (result.success) { refreshView(modal.bounty.id); setModal({ type: 'none' }); }
          }}
          onCancel={() => setModal({ type: 'none' })}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </div>
  );
}
