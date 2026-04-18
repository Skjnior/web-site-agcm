'use client';

import { useState, useEffect } from 'react';
import { Pagination } from '@/components/ui/pagination';
import { Filters, FilterConfig } from '@/components/ui/filters';
import { Button } from '@/components/ui/button';
import { usePagination } from '@/hooks/use-pagination';
import { useFilters } from '@/hooks/use-filters';
import { Loader2, Check, X } from 'lucide-react';

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

          {data && (
            <>
              <div className="admin-glass overflow-hidden rounded-3xl shadow-sm">
                <div className="divide-y divide-slate-200/50 dark:divide-slate-700/80">
                  {data.data.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      Aucune intention de don trouvée
                    </div>
                  ) : (
                    data.data.map((don) => (
                      <div
                        key={don.id}
                        className="group p-6 transition-colors hover:bg-primary-50/50 dark:hover:bg-slate-800/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-3">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                  don.type === 'FINANCIER'
                                    ? 'border-green-200 bg-green-100/50 text-green-800 dark:border-green-800/50 dark:bg-green-950/40 dark:text-green-300'
                                    : don.type === 'MATERIEL'
                                      ? 'border-blue-200 bg-blue-100/50 text-blue-800 dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300'
                                      : 'border-slate-200 bg-slate-100/50 text-slate-800 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200'
                                }`}
                              >
                                {don.type}
                              </span>
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
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
                            </div>
                            <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                              {don.nom && (
                                <p>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Nom :</span> {don.nom}
                                </p>
                              )}
                              {don.email && (
                                <p>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Email :</span> {don.email}
                                </p>
                              )}
                              {don.telephone && (
                                <p>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Téléphone :</span>{' '}
                                  {don.telephone}
                                </p>
                              )}
                              {don.montantEstime && (
                                <p>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">Montant estimé :</span>{' '}
                                  {don.montantEstime} €
                                </p>
                              )}
                              {don.description && (
                                <p className="mt-3 max-w-2xl rounded-xl border border-slate-100 bg-slate-50/50 p-3 italic text-slate-500 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-400">
                                  &quot;{don.description}&quot;
                                </p>
                              )}
                              <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                                {new Date(don.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'long', year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="ml-4 flex shrink-0 items-center gap-2">
                            <select
                              value={don.statut}
                              onChange={(e) => handleUpdateStatus(don.id, e.target.value)}
                              disabled={processing === don.id}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-primary-400/30"
                            >
                              <option value="NOUVEAU">Nouveau</option>
                              <option value="CONTACTE">Contacté</option>
                              <option value="CONFIRME">Confirmé</option>
                              <option value="CLASSE_SANS_SUITE">Classé sans suite</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {data.pagination.totalPages > 1 && (
                <Pagination
                  page={data.pagination.page}
                  limit={data.pagination.limit}
                  total={data.pagination.total}
                  totalPages={data.pagination.totalPages}
                  hasNext={data.pagination.hasNext}
                  hasPrev={data.pagination.hasPrev}
                  onPageChange={setPage}
                  className="admin-glass mt-6 rounded-2xl p-4 shadow-sm"
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}



