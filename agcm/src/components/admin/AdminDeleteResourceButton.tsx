'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { Trash2 } from 'lucide-react';

type AdminDeleteResourceButtonProps = {
  apiUrl: string;
  title: string;
  message: string;
  isSuperAdmin: boolean;
  /** Libellé du bouton (défaut : Supprimer) */
  confirmLabel?: string;
};

export default function AdminDeleteResourceButton({
  apiUrl,
  title,
  message,
  isSuperAdmin,
  confirmLabel = 'Supprimer',
}: AdminDeleteResourceButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isSuperAdmin) {
    return null;
  }

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(typeof data.error === 'string' ? data.error : 'Erreur lors de la suppression');
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="h-8 shadow-sm"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-1 h-3.5 w-3.5" />
        {confirmLabel}
      </Button>
      <ConfirmationModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title={title}
        message={message}
        type="danger"
        confirmText={confirmLabel}
        isLoading={loading}
      />
    </>
  );
}
