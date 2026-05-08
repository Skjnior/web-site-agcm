'use client';

import { ReactNode } from 'react';
import { Pagination } from '@/components/ui/pagination';
import { TableRowActionsMenu } from '@/components/ui/table-row-actions-menu';
import { cn } from '@/lib/utils';

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
                      <TableRowActionsMenu actions={actions(item)} />
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

