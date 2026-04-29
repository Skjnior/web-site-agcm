'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

function actionMenuItemClass(
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

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    onPageChange: (page: number) => void;
  };
  actions?: (item: T) => {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'edit' | 'add' | 'delete' | 'view';
    icon?: ReactNode;
    disabled?: boolean;
    className?: string;
    title?: string;
  }[];
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  pagination,
  actions,
  emptyMessage = 'Aucune donnée disponible',
  loading = false,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="admin-glass rounded-2xl p-12 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="mt-4 text-gray-600 dark:text-slate-400">Chargement...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="admin-glass rounded-2xl p-12 text-center shadow-sm">
        <p className="text-gray-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="admin-glass overflow-hidden rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-800/90">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400 ${column.className || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
                {actions && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400"
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-950/80">
              {data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/60',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm text-gray-900 dark:text-slate-100 ${column.className?.includes('whitespace-nowrap') ? '' : 'whitespace-nowrap'} ${column.className || ''}`}
                    >
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionMenu item={item} actions={actions(item)} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          onPageChange={pagination.onPageChange}
          className="admin-glass rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700/80"
        />
      )}
    </div>
  );
}

function ActionMenu<T>({
  item,
  actions,
}: {
  item: T;
  actions: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'edit' | 'add' | 'delete' | 'view';
    icon?: ReactNode;
    disabled?: boolean;
    className?: string;
  }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (actions.length === 0) return null;

  if (actions.length === 1) {
    const isProcessing = actions[0].label.includes('...');
    return (
      <Button
        variant={actions[0].variant || 'outline'}
        size="sm"
        onClick={actions[0].onClick}
        disabled={isProcessing}
        className={actions[0].className}
      >
        {actions[0].icon}
        {actions[0].label}
      </Button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-slate-200 bg-white shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900 dark:ring-white/10">
          <div className="py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                disabled={action.label.includes('...')}
                className={cn(
                  'flex w-full items-center gap-2 px-4 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50',
                  actionMenuItemClass(action.variant),
                  action.className
                )}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

