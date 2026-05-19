'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Eye, Pencil, Trash2 } from 'lucide-react';
import BureauConfirmDialog from '@/components/bureau/BureauConfirmDialog';
import {
  TableRowActionsMenu,
  type TableRowAction,
} from '@/components/ui/table-row-actions-menu';

/**
 * Actions ligne bureau : menu ⋮ (comme super-admin), puis confirmation suppression.
 */
export default function BureauRowEditDeleteActions({
  /** Fiche bureau lecture seule */
  detailHref,
  editHref,
  deleteApiUrl,
  resourceKind,
  resourceTitle,
  /** Ex. `/evenements/mon-slug` — ouvre un nouvel onglet */
  publicPageHref,
}: {
  detailHref?: string;
  editHref: string;
  deleteApiUrl: string;
  resourceKind: string;
  resourceTitle: string;
  publicPageHref?: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(deleteApiUrl, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Suppression impossible');
      }
      setConfirmOpen(false);
      router.refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  }

  const shortTitle =
    resourceTitle.length > 48 ? `${resourceTitle.slice(0, 45)}…` : resourceTitle;

  const actions: TableRowAction[] = [];
  if (detailHref) {
    actions.push({
      label: 'Voir',
      icon: <Eye className="h-4 w-4 shrink-0" />,
      variant: 'view',
      onClick: () => router.push(detailHref),
    });
  }
  if (publicPageHref) {
    actions.push({
      label: 'Page publique',
      icon: <ExternalLink className="h-4 w-4 shrink-0" />,
      variant: 'view',
      onClick: () =>
        window.open(publicPageHref, '_blank', 'noopener,noreferrer'),
    });
  }
  actions.push({
    label: 'Modifier',
    icon: <Pencil className="h-4 w-4 shrink-0" />,
    variant: 'edit',
    onClick: () => router.push(editHref),
  });
  actions.push({
    label: 'Supprimer',
    icon: <Trash2 className="h-4 w-4 shrink-0" />,
    variant: 'delete',
    onClick: () => setConfirmOpen(true),
  });

  return (
    <>
      <div className="flex justify-end">
        <TableRowActionsMenu
          actions={actions}
          triggerLabel={`Actions — ${resourceKind}`}
          align="right"
          triggerClassName="border-slate-600 bg-slate-900/50 text-slate-200 hover:bg-slate-800 dark:border-slate-600"
          menuClassName="dark:border-slate-700 dark:bg-slate-900"
          menuItemClassName="dark:focus:bg-slate-800"
        />
      </div>

      <BureauConfirmDialog
        open={confirmOpen}
        title={`Supprimer ${resourceKind} ?`}
        message={`« ${shortTitle} » sera définitivement supprimé. Cette action ne peut pas être annulée.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        Icon={Trash2}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => !deleting && setConfirmOpen(false)}
      />
    </>
  );
}
