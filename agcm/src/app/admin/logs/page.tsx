'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Eye, Search as SearchIcon, X, Trash2, Filter, ListOrdered } from 'lucide-react';
import { DataTable } from '@/components/super-admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import { getActionBadgeClasses } from '@/lib/ui-utils';
import {
  AUDIT_ACTION_OPTIONS,
  ENTITY_TYPE_OPTIONS,
  actionLabel,
  entityTypeLabel,
} from '@/lib/audit-log-labels';

const LIMIT_OPTIONS = [
  { value: '20', label: '20 / page' },
  { value: '50', label: '50 / page' },
  { value: '100', label: '100 / page' },
];

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actorEmail?: string | null;
  user: {
    email: string;
  } | null;
}

interface PaginatedResponse {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function SuperAdminAuditLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [entityIdFilter, setEntityIdFilter] = useState('');
  const [limitFilter, setLimitFilter] = useState('50');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; logId: string | null }>({
    isOpen: false,
    logId: null,
  });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const syncFromUrl = useCallback(() => {
    setSearch(searchParams.get('search') || '');
    setActionFilter(searchParams.get('action') || 'all');
    setEntityTypeFilter(searchParams.get('entityType') || 'all');
    setEntityIdFilter(searchParams.get('entityId') || '');
    setLimitFilter(searchParams.get('limit') || '50');
  }, [searchParams]);

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchParams]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const searchValue = searchParams.get('search') || '';
      const actionValue = searchParams.get('action') || '';
      const entityTypeValue = searchParams.get('entityType') || '';
      const entityIdValue = searchParams.get('entityId') || '';

      if (searchValue) params.set('search', searchValue);
      if (actionValue && actionValue !== 'all') params.set('action', actionValue);
      if (entityTypeValue && entityTypeValue !== 'all') params.set('entityType', entityTypeValue);
      if (entityIdValue.trim()) params.set('entityId', entityIdValue.trim());

      const response = await fetch(`/api/super-admin/audit-logs?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const result: PaginatedResponse = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pushParams = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    pushParams((params) => {
      params.set('page', '1');
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
  };

  const handleEntityIdApply = () => {
    pushParams((params) => {
      params.set('page', '1');
      if (entityIdFilter.trim()) {
        params.set('entityId', entityIdFilter.trim());
      } else {
        params.delete('entityId');
      }
    });
  };

  const handleSearchImmediate = () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    handleFilterChange('search', search);
  };

  const onSearchInputChange = (value: string) => {
    setSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      pushParams((params) => {
        params.set('page', '1');
        if (value.trim()) params.set('search', value.trim());
        else params.delete('search');
      });
    }, 450);
  };

  const handleResetFilters = () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    setSearch('');
    setActionFilter('all');
    setEntityTypeFilter('all');
    setEntityIdFilter('');
    setLimitFilter('50');
    router.push('/admin/logs?page=1&limit=50');
  };

  const handlePageChange = (newPage: number) => {
    pushParams((params) => {
      params.set('page', String(newPage));
    });
  };

  const handleDelete = (logId: string) => {
    setDeleteConfirmModal({ isOpen: true, logId });
  };

  const confirmDelete = async () => {
    const logId = deleteConfirmModal.logId;
    if (!logId) return;

    setDeleteConfirmModal({ isOpen: false, logId: null });
    setDeleting(logId);

    try {
      const response = await fetch(`/api/super-admin/audit-logs/${logId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      await fetchLogs();
      setSuccessModal({ isOpen: true, message: 'Log d\'audit supprimé avec succès' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      setErrorModal({ isOpen: true, message });
    } finally {
      setDeleting(null);
    }
  };

  const hasActiveFilters =
    !!(searchParams.get('search')?.trim()) ||
    !!(searchParams.get('action') && searchParams.get('action') !== 'all') ||
    !!(searchParams.get('entityType') && searchParams.get('entityType') !== 'all') ||
    !!(searchParams.get('entityId')?.trim());

  const pagination = data?.pagination;
  const rangeFrom = pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const rangeTo =
    pagination && pagination.total > 0 ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  const columns = [
    {
      key: 'createdAt',
      label: 'Date & heure',
      className: 'whitespace-nowrap',
      render: (log: AuditLog) => (
        <div className="text-slate-900 dark:text-slate-100">
          {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log: AuditLog) => {
        const actionClass = getActionBadgeClasses(log.action);
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${actionClass}`}
            title={log.action}
          >
            {actionLabel(log.action)}
          </span>
        );
      },
    },
    {
      key: 'entityType',
      label: 'Entité',
      render: (log: AuditLog) => (
        <Badge variant="outline" className="border-slate-300 font-normal dark:border-slate-600 dark:text-slate-200">
          {entityTypeLabel(log.entityType)}
        </Badge>
      ),
    },
    {
      key: 'entityId',
      label: 'ID entité',
      render: (log: AuditLog) => (
        <div className="max-w-[140px] truncate font-mono text-xs text-slate-600 dark:text-slate-400" title={log.entityId}>
          {log.entityId}
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Acteur',
      render: (log: AuditLog) => (
        <div className="max-w-[220px] text-slate-900 dark:text-slate-100">
          <div className="truncate">{log.user?.email || log.actorEmail || '—'}</div>
          {!log.user && log.actorEmail ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">(compte supprimé)</span>
          ) : null}
        </div>
      ),
    },
  ];

  const getActions = (log: AuditLog) => [
    {
      label: 'Voir détails',
      onClick: () => router.push(`/admin/logs/${log.id}`),
      variant: 'view' as const,
      icon: <Eye className="h-4 w-4 mr-2" />,
    },
    {
      label: deleting === log.id ? 'Suppression...' : 'Supprimer',
      onClick: () => handleDelete(log.id),
      variant: 'delete' as const,
      icon:
        deleting === log.id ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <Trash2 className="h-4 w-4 mr-2" />
        ),
      disabled: deleting === log.id,
    },
  ];

  return (
    <div className="admin-page mx-auto max-w-7xl space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
      <div className="admin-glass flex flex-col gap-4 rounded-3xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-200/80 dark:bg-slate-800/80">
            <FileText className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
              Journal d&apos;audit
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Historique des actions sensibles — tri du plus récent au plus ancien
            </p>
          </div>
        </div>
        {pagination ? (
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-4 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            <ListOrdered className="h-4 w-4 shrink-0" />
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{pagination.total}</span> entrée
              {pagination.total !== 1 ? 's' : ''}
            </span>
          </div>
        ) : null}
      </div>

      <div className="admin-panel space-y-6 p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Filtres et recherche
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Label htmlFor="log-search" className="mb-2 block text-slate-700 dark:text-slate-300">
              Recherche par e-mail
            </Label>
            <div className="relative flex items-center gap-2">
              <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                id="log-search"
                placeholder="E-mail de l’acteur (compte actif ou archivé)…"
                value={search}
                onChange={(e) => onSearchInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchImmediate();
                  }
                }}
                className="pl-10"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSearchImmediate}
                className="shrink-0 border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              La recherche se lance automatiquement après une courte pause ; Entrée pour lancer tout de suite.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <div>
              <Label className="mb-2 block text-slate-700 dark:text-slate-300">Action</Label>
              <Select
                value={actionFilter || 'all'}
                onValueChange={(value) => {
                  setActionFilter(value);
                  handleFilterChange('action', value);
                }}
              >
                <SelectTrigger className="w-full border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent className="z-50 border-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  {AUDIT_ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-slate-700 dark:text-slate-300">Type d&apos;entité</Label>
              <Select
                value={entityTypeFilter || 'all'}
                onValueChange={(value) => {
                  setEntityTypeFilter(value);
                  handleFilterChange('entityType', value);
                }}
              >
                <SelectTrigger className="w-full border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="z-50 max-h-[280px] border-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  {ENTITY_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-slate-700 dark:text-slate-300">Lignes par page</Label>
              <Select
                value={limitFilter || '50'}
                onValueChange={(value) => {
                  setLimitFilter(value);
                  pushParams((params) => {
                    params.set('page', '1');
                    params.set('limit', value);
                  });
                }}
              >
                <SelectTrigger className="w-full border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 border-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  {LIMIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          <div className="min-w-[200px] flex-1">
            <Label htmlFor="entity-id-filter" className="mb-2 block text-slate-700 dark:text-slate-300">
              ID d&apos;entité (exact)
            </Label>
            <div className="flex gap-2">
              <Input
                id="entity-id-filter"
                placeholder="ex. clu…"
                value={entityIdFilter}
                onChange={(e) => setEntityIdFilter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEntityIdApply();
                }}
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEntityIdApply}
                className="shrink-0 border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                Filtrer
              </Button>
            </div>
          </div>

          {hasActiveFilters ? (
            <Button
              variant="outline"
              onClick={handleResetFilters}
              size="sm"
              className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              <X className="mr-2 h-4 w-4" />
              Réinitialiser tout
            </Button>
          ) : null}
        </div>
      </div>

      {pagination && pagination.total > 0 ? (
        <p className="px-1 text-sm text-slate-600 dark:text-slate-400">
          Affichage de <span className="font-medium text-slate-800 dark:text-slate-200">{rangeFrom}</span> à{' '}
          <span className="font-medium text-slate-800 dark:text-slate-200">{rangeTo}</span> sur{' '}
          <span className="font-medium text-slate-800 dark:text-slate-200">{pagination.total}</span> — page{' '}
          {pagination.page} / {pagination.totalPages || 1}
        </p>
      ) : null}

      <DataTable
        data={data?.data || []}
        columns={columns}
        pagination={
          data?.pagination
            ? {
                ...data.pagination,
                onPageChange: handlePageChange,
              }
            : undefined
        }
        actions={getActions}
        onRowClick={(log) => router.push(`/admin/logs/${log.id}`)}
        loading={loading}
        emptyMessage="Aucun log ne correspond aux critères. Modifiez les filtres ou réinitialisez."
      />

      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, logId: null })}
        onConfirm={confirmDelete}
        title="Supprimer le log d'audit"
        message="Êtes-vous sûr de vouloir supprimer ce log d'audit ? Cette action est irréversible."
        type="danger"
        confirmText="Supprimer"
        isLoading={deleting !== null}
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
      />
    </div>
  );
}
