'use client';

import { useRouter } from 'next/navigation';
import { FileText, FolderOpen, Calendar } from 'lucide-react';
import {
  TableRowActionsMenu,
  type TableRowAction,
} from '@/components/ui/table-row-actions-menu';

const triggerClass =
  'border-slate-600 bg-slate-900/50 text-slate-100 hover:bg-slate-800 dark:border-slate-600';

/**
 * Actions rapides dashboard bureau — menu ⋮ comme super-admin (adapté au périmètre du poste).
 * Ex. Organisation : projet + événement uniquement.
 */
export function BureauDashboardQuickActions({
  canContents,
  canProjets,
  canEvenements,
}: {
  canContents: boolean;
  canProjets: boolean;
  canEvenements: boolean;
}) {
  const router = useRouter();

  const actions: TableRowAction[] = [];
  if (canContents) {
    actions.push({
      label: 'Créer une activité',
      variant: 'add',
      icon: <FileText className="h-4 w-4 shrink-0" />,
      onClick: () => router.push('/bureau/contents/nouveau'),
    });
  }
  if (canProjets) {
    actions.push({
      label: 'Créer un projet',
      variant: 'add',
      icon: <FolderOpen className="h-4 w-4 shrink-0" />,
      onClick: () => router.push('/bureau/projets/nouveau'),
    });
  }
  if (canEvenements) {
    actions.push({
      label: 'Créer un événement',
      variant: 'add',
      icon: <Calendar className="h-4 w-4 shrink-0" />,
      onClick: () => router.push('/bureau/evenements/nouveau'),
    });
  }

  if (actions.length === 0) return null;

  return (
    <div className="admin-glass rounded-2xl p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">Actions rapides</h2>
      <TableRowActionsMenu
        alwaysDropdown
        triggerText="Créer"
        triggerLabel="Créer une activité, un projet ou un événement"
        align="left"
        triggerClassName={triggerClass}
        menuClassName="dark:border-slate-700 dark:bg-slate-900"
        menuItemClassName="dark:focus:bg-slate-800"
        actions={actions}
      />
    </div>
  );
}
