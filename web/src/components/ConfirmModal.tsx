'use client';

import { Modal, Button } from '@/components/ui';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'primary' | 'danger' | 'purple';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-gray-600 leading-relaxed">{message}</p>
    </Modal>
  );
}
