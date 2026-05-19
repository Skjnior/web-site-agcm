'use client';

import { useRouter } from 'next/navigation';
import { ClipboardList, LayoutDashboard } from 'lucide-react';
import { TableRowActionsMenu } from '@/components/ui/table-row-actions-menu';

/** Menu d’accès rapide (trésorier / finances) depuis Mes paiements — même pattern ⋮ que le super-admin */
export function PaiementsRegistreHubActions() {
  const router = useRouter();

  return (
    <TableRowActionsMenu
      triggerLabel="Accès registre et bureau"
      align="right"
      triggerClassName="border-emerald-500/50 bg-emerald-600 text-white hover:bg-emerald-500 dark:border-emerald-500/50"
      menuClassName="dark:border-slate-700 dark:bg-slate-900"
      menuItemClassName="dark:focus:bg-slate-800"
      actions={[
        {
          label: 'Ouvrir le registre complet',
          variant: 'add',
          icon: <ClipboardList className="h-4 w-4 shrink-0" />,
          onClick: () => router.push('/bureau/registre-cotisations'),
        },
        {
          label: 'Espace bureau',
          variant: 'view',
          icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
          onClick: () => router.push('/bureau'),
        },
      ]}
    />
  );
}
