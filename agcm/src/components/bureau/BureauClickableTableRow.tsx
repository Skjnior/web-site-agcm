'use client';

import { useRouter } from 'next/navigation';
import type { KeyboardEvent, ReactNode } from 'react';

/**
 * Ligne de tableau cliquable vers une fiche bureau (détails).
 * Utiliser `stopPropagation` sur la cellule « Actions » pour ne pas déclencher la navigation.
 */
export default function BureauClickableTableRow({
  detailHref,
  children,
}: {
  detailHref: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function go() {
    router.push(detailHref);
  }

  function onRowClick() {
    go();
  }

  function onRowKeyDown(e: KeyboardEvent<HTMLTableRowElement>) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    go();
  }

  return (
    <tr
      role="link"
      tabIndex={0}
      className="cursor-pointer hover:bg-slate-700/20"
      onClick={onRowClick}
      onKeyDown={onRowKeyDown}
      aria-label="Voir le détail"
    >
      {children}
    </tr>
  );
}
