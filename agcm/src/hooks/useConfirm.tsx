'use client';

import { useState } from 'react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface ConfirmOptions {
  title?: string;
  message: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
    setIsOpen(false);
  };

  const ConfirmationModalWrapper = () => (
    <ConfirmationModal
      isOpen= { isOpen }
  onClose = { handleCancel }
  onConfirm = { handleConfirm }
  title = { options.title || 'Confirmation' }
  message = { options.message }
  type = { options.type || 'warning' }
  confirmText = { options.confirmText }
  cancelText = { options.cancelText }
    />
  );

  return { confirm, ConfirmModal: ConfirmationModalWrapper };
}


