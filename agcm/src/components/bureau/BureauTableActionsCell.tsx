'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Empêche le clic sur le menu ⋮ de déclencher la navigation au clic sur la ligne. */
export default function BureauTableActionsCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(className)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {children}
    </td>
  );
}
