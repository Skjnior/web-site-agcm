'use client';

import { useState, useEffect } from 'react';
import { Pagination } from '@/components/ui/pagination';
import { Filters, FilterConfig } from '@/components/ui/filters';
import { Button } from '@/components/ui/button';
import { usePagination } from '@/hooks/use-pagination';
import { useFilters } from '@/hooks/use-filters';
import { Loader2, Check, X } from 'lucide-react';
import { DataTable } from '@/components/super-admin/DataTable';

interface DonationIntent {
  id: string;
  type: string;
  montantEstime: number | null;
  description: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  statut: string;
  createdAt: string;
}

interface PaginatedResponse {
  data: DonationIntent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function AdminDemandesDonsPage() {
  const { page, limit, setPage } = usePagination({ defaultLimit: 20 });
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const filterConfigs: FilterConfig[] = [
    {
      type: 'text',
      key: 'search',
      label: 'Recherche',
      placeholder: 'Rechercher par nom ou email...',
    },
    {
      type: 'select',
      key: 'type',
      label: 'Type',
      selectDefault: 'ALL',
      options: [
        { label: 'Financier', value: 'FINANCIER' },
        { label: 'Matériel', value: 'MATERIEL' },
        { label: 'Autre', value: 'AUTRE' },
      ],
    },
    {
      type: 'select',
      key: 'statut',
      label: 'Statut',
      selectDefault: 'NOUVEAU',
      options: [
        { label: 'Nouveau', value: 'NOUVEAU' },
        { label: 'Contacté', value: 'CONTACTE' },
        { label: 'Confirmé', value: 'CONFIRME' },
        { label: 'Classé sans suite', value: 'CLASSE_SANS_SUITE' },
      ],
    },
  ];

  const { values: filterValues, updateFilters, resetFilters } = useFilters({
    filters: filterConfigs,
  });

  const fetchDons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...Object.entries(filterValues).reduce((acc, [key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>),
      });

      const response = await fetch(`/api/admin/demandes/dons?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const result: PaginatedResponse = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDons();
  }, [page, limit, filterValues]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setProcessing(id);
      const response = await fetch(`/api/admin/demandes/dons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatus }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      fetchDons();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue');
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
      <main className="flex-1 p-4 md:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="admin-glass flex flex-col justify-between gap-4 rounded-3xl p-8 shadow-sm md:flex-row md:items-center">
            <div>
              <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
                Intentions de Don
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Gérer les intentions de don</p>
            </div>
          </div>

          <Filters
            filters={filterConfigs}
            values={filterValues}
            onChange={updateFilters}
            onReset={resetFilters}
            className="admin-glass rounded-2xl p-4 shadow-sm mb-6"
          />

          <DataTable
            data={data?.data || []}
            columns={[
              {
                key: 'type',
                label: 'Type',
                render: (don) => (
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      don.type === 'FINANCIER'
                        ? 'border-green-200 bg-green-100/50 text-green-800 dark:border-green-800/50 dark:bg-green-950/40 dark:text-green-300'
                        : don.type === 'MATERIEL'
                          ? 'border-blue-200 bg-blue-100/50 text-blue-800 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'border-slate-200 bg-slate-100/50 text-slate-800 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200'
                    }`}
                  >
                    {don.type}
                  </span>
                ),
              },
              {
                key: 'nom',
                label: 'Donateur',
                render: (don) => (
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{don.nom || 'Anonyme'}</div>
                    <div className="text-xs text-slate-500">{don.email}</div>
                  </div>
                ),
              },
              {
                key: 'montantEstime',
                label: 'Montant/Détails',
                render: (don) => (
                  <div className="text-sm">
                    {don.montantEstime ? `${don.montantEstime} €` : '-'}
                    {don.description && (
                      <div className="text-xs text-slate-500 truncate max-w-[200px]" title={don.description}>
                        {don.description}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'statut',
                label: 'Statut',
                render: (don) => (
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      don.statut === 'CONFIRME'
                        ? 'border-green-200 bg-green-100/50 text-green-800 dark:border-green-800/50 dark:bg-green-950/40 dark:text-green-300'
                        : don.statut === 'CONTACTE'
                          ? 'border-amber-200 bg-amber-100/50 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200'
                          : don.statut === 'CLASSE_SANS_SUITE'
                            ? 'border-red-200 bg-red-100/50 text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300'
                            : 'border-slate-200 bg-slate-100/50 text-slate-800 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200'
                    }`}
                  >
                    {don.statut}
                  </span>
                ),
              },
              {
                key: 'createdAt',
                label: 'Date',
                render: (don) => (
                  <div className="text-xs text-slate-500">
                    {new Date(don.createdAt).toLocaleDateString('fr-FR')}
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
            actions={(don) => [
              {
                label: 'Nouveau',
                onClick: () => handleUpdateStatus(don.id, 'NOUVEAU'),
                disabled: processing === don.id,
              },
              {
                label: 'Contacté',
                onClick: () => handleUpdateStatus(don.id, 'CONTACTE'),
                disabled: processing === don.id,
              },
              {
                label: 'Confirmé',
                onClick: () => handleUpdateStatus(don.id, 'CONFIRME'),
                disabled: processing === don.id,
              },
              {
                label: 'Classé sans suite',
                onClick: () => handleUpdateStatus(don.id, 'CLASSE_SANS_SUITE'),
                disabled: processing === don.id,
                variant: 'destructive',
              },
            ]}
            emptyMessage="Aucune intention de don trouvée"
            loading={loading && !data}
          />
        </div>
      </main>
    </div>
  );
}



