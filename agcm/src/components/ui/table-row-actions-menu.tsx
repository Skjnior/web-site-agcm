'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export function actionMenuItemClass(
  variant?: 'default' | 'destructive' | 'outline' | 'edit' | 'add' | 'delete' | 'view'
) {
  switch (variant) {
    case 'delete':
    case 'destructive':
      return 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40';
    case 'edit':
      return 'text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40';
    case 'view':
      return 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800';
    case 'add':
      return 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30';
    case 'default':
      return 'text-primary hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/15';
    case 'outline':
    default:
      return 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800';
  }
}

export type TableRowAction = {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'edit' | 'add' | 'delete' | 'view';
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
};

const MENU_WIDTH_PX = 208; // w-52

type TableRowActionsMenuProps = {
  actions: TableRowAction[];
  /** Classes pour le bouton ⋮ (thème bureau sombre, etc.) */
  triggerClassName?: string;
  /** Classes pour le panneau du menu */
  menuClassName?: string;
  menuItemClassName?: string;
  align?: 'left' | 'right';
  triggerLabel?: string;
  /** Afficher toujours le menu ⋮ (même une seule action), pour alignement bureau / super-admin */
  alwaysDropdown?: boolean;
  /** Texte visible à côté de ⋮ (ex. « Créer » sur le dashboard bureau) */
  triggerText?: string;
};

export function TableRowActionsMenu({
  actions,
  triggerClassName,
  menuClassName,
  menuItemClassName,
  align = 'right',
  triggerLabel = 'Actions',
  alwaysDropdown = false,
  triggerText,
}: TableRowActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const t = event.target as Node;
      if (triggerWrapRef.current?.contains(t) || menuPanelRef.current?.contains(t)) return;
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown);
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      setMenuPos(null);
      return;
    }
    const r = triggerWrapRef.current?.getBoundingClientRect();
    if (r) {
      let left = align === 'right' ? r.right - MENU_WIDTH_PX : r.left;
      left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH_PX - 8));
      const top = r.bottom + 4;
      setMenuPos({ top, left });
    }
    setIsOpen(true);
  };

  if (actions.length === 0) return null;

  if (actions.length === 1 && !alwaysDropdown) {
    const isProcessing = actions[0].label.includes('...');
    return (
      <Button
        variant={actions[0].variant || 'outline'}
        size="sm"
        onClick={actions[0].onClick}
        disabled={actions[0].disabled || isProcessing}
        className={actions[0].className}
      >
        {actions[0].icon}
        {actions[0].label}
      </Button>
    );
  }

  const menu = (
    <div
      ref={menuPanelRef}
      role="menu"
      className={cn(
        'w-52 rounded-md border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900 dark:ring-white/10',
        menuClassName
      )}
    >
      {actions.map((action, index) => (
        <button
          key={index}
          type="button"
          role="menuitem"
          onClick={() => {
            action.onClick();
            setIsOpen(false);
            setMenuPos(null);
          }}
          disabled={action.disabled || action.label.includes('...')}
          className={cn(
            'flex w-full items-center gap-2 px-4 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50',
            actionMenuItemClass(action.variant),
            action.className,
            menuItemClassName
          )}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="relative inline-flex" ref={triggerWrapRef}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={triggerLabel}
          className={cn(
            'border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800',
            triggerText && 'gap-1 pr-3',
            triggerClassName
          )}
        >
          {triggerText ? (
            <span className="mr-1 max-w-[10rem] truncate text-sm font-medium sm:max-w-none">{triggerText}</span>
          ) : null}
          <MoreVertical className="h-4 w-4 shrink-0" />
        </Button>
      </div>
      {mounted &&
        isOpen &&
        menuPos &&
        createPortal(
          <div
            className="fixed z-[200]"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {menu}
          </div>,
          document.body
        )}
    </>
  );
}
