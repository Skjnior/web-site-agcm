'use client';

import { useState, useEffect } from 'react';
import { Filters, FilterConfig } from '@/components/ui/filters';
import { usePagination } from '@/hooks/use-pagination';
import { useFilters } from '@/hooks/use-filters';
import { Loader2 } from 'lucide-react';
import { DataTable } from '@/components/super-admin/DataTable';

interface MessageRow {
  id: string;
  nom: string;
  email: string;
  sujet: string;
  message: string;
  statut: string;
  createdAt: string;
}

interface PaginatedResponse {
  data: MessageRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function AdminMessagesContactPage() {
  const { page, limit, setPage } = usePagination({ defaultLimit: 20 });
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const filterConfigs: FilterConfig[] = [
    {
      type: 'text',
      key: 'search',
      label: 'Recherche',
      placeholder: 'Nom, email, sujet…',
    },
    {
      type: 'select',
      key: 'statut',
      label: 'Statut',
      selectDefault: 'NOUVEAU',
      options: [
        { label: 'Nouveau', value: 'NOUVEAU' },
        { label: 'En cours', value: 'EN_COURS' },
        { label: 'Traité', value: 'TRAITE' },
        { label: 'Archivé', value: 'ARCHIVE' },
      ],
    },
  ];

  const { values: filterValues, updateFilters, resetFilters } = useFilters({
    filters: filterConfigs,
  });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...Object.entries(filterValues).reduce(
          (acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
              acc[key] = String(value);
            }
            return acc;
          },
          {} as Record<string, string>,
        ),
      });
      const res = await fetch(`/api/admin/messages-contact?${params}`);
      if (!res.ok) throw new Error('Chargement impossible');
      setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMessages();
  }, [page, limit, filterValues]);

  const patchStatut = async (id: string, statut: string) => {
    try {
      setProcessing(id);
      const res = await fetch(`/api/admin/messages-contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      });
      if (!res.ok) throw new Error('Mise à jour impossible');
      await fetchMessages();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setProcessing(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="admin-page flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="admin-page flex flex-col pointer-events-auto">
      <main className="mx-auto w-full max-w-[1600px] flex-1 overflow-x-hidden p-4 md:p-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
          <div className="admin-glass flex flex-col justify-between gap-4 rounded-3xl p-8 shadow-sm md:flex-row md:items-center">
            <div>
              <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
                Messages du formulaire contact
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Messages envoyés depuis la page publique « Contact »
              </p>
            </div>
          </div>

          <Filters
            filters={filterConfigs}
            values={filterValues}
            onChange={updateFilters}
            onReset={resetFilters}
            className="admin-glass mb-6 rounded-2xl p-4 shadow-sm"
          />

          <DataTable
            data={data?.data || []}
            columns={[
              {
                key: 'sujet',
                label: 'Sujet / expéditeur',
                render: (row) => (
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{row.sujet}</div>
                    <div className="text-xs text-slate-500">
                      {row.nom} · {row.email}
                    </div>
                  </div>
                ),
              },
              {
                key: 'message',
                label: 'Message',
                render: (row) => (
                  <div className="max-w-md truncate text-sm text-slate-600 dark:text-slate-300" title={row.message}>
                    {row.message}
                  </div>
                ),
              },
              {
                key: 'statut',
                label: 'Statut',
                render: (row) => (
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-100/50 px-2.5 py-0.5 text-xs font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200">
                    {row.statut}
                  </span>
                ),
              },
              {
                key: 'createdAt',
                label: 'Date',
                render: (row) => (
                  <div className="text-xs text-slate-500">
                    {new Date(row.createdAt).toLocaleString('fr-FR')}
                  </div>
                ),
              },
            ]}
            pagination={{
              page: data?.pagination.page || 1,
              limit: data?.pagination.limit || 20,
              total: data?.pagination.total || 0,
              totalPages: data?.pagination.totalPages || 1,
              hasNext: data?.pagination.hasNext || false,
              hasPrev: data?.pagination.hasPrev || false,
              onPageChange: setPage,
            }}
            actions={(row) => [
              {
                label: 'Nouveau',
                onClick: () => void patchStatut(row.id, 'NOUVEAU'),
                disabled: processing === row.id,
              },
              {
                label: 'En cours',
                onClick: () => void patchStatut(row.id, 'EN_COURS'),
                disabled: processing === row.id,
              },
              {
                label: 'Traité',
                onClick: () => void patchStatut(row.id, 'TRAITE'),
                disabled: processing === row.id,
              },
              {
                label: 'Archiver',
                onClick: () => void patchStatut(row.id, 'ARCHIVE'),
                disabled: processing === row.id,
              },
            ]}
            emptyMessage="Aucun message"
            loading={loading && !data}
          />
        </div>
      </main>
    </div>
  );
}
