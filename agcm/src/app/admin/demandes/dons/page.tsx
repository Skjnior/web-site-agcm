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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pointer-events-auto">
      <main className="flex-1 p-4 md:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Intentions de Don</h1>
              <p className="text-slate-500 mt-1">Gérer les intentions de don</p>
            </div>
          </div>

          <Filters
            filters={filterConfigs}
            values={filterValues}
            onChange={updateFilters}
            onReset={resetFilters}
            className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-4 shadow-sm mb-6"
          />

          {data && (
            <>
              <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-200/50">
                  {data.data.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500">
                      Aucune intention de don trouvée
                    </div>
                  ) : (
                    data.data.map((don) => (
                      <div key={don.id} className="p-6 hover:bg-primary-50/50 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${don.type === 'FINANCIER' ? 'bg-green-100/50 text-green-700 border-green-200' :
                                don.type === 'MATERIEL' ? 'bg-blue-100/50 text-blue-700 border-blue-200' :
                                  'bg-slate-100/50 text-slate-700 border-slate-200'
                                }`}>
                                {don.type}
                              </span>
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${don.statut === 'CONFIRME' ? 'bg-green-100/50 text-green-700 border-green-200' :
                                don.statut === 'CONTACTE' ? 'bg-yellow-100/50 text-yellow-700 border-yellow-200' :
                                  don.statut === 'CLASSE_SANS_SUITE' ? 'bg-red-100/50 text-red-700 border-red-200' :
                                    'bg-slate-100/50 text-slate-700 border-slate-200'
                                }`}>
                                {don.statut}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 space-y-1 mt-3">
                              {don.nom && <p><span className="font-medium text-slate-700">Nom :</span> {don.nom}</p>}
                              {don.email && <p><span className="font-medium text-slate-700">Email :</span> {don.email}</p>}
                              {don.telephone && <p><span className="font-medium text-slate-700">Téléphone :</span> {don.telephone}</p>}
                              {don.montantEstime && <p><span className="font-medium text-slate-700">Montant estimé :</span> {don.montantEstime} €</p>}
                              {don.description && <p className="mt-3 text-slate-500 italic max-w-2xl bg-slate-50/50 p-3 rounded-xl border border-slate-100">"{don.description}"</p>}
                              <p className="text-slate-400 mt-2 text-xs font-medium">
                                {new Date(don.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'long', year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <select
                              value={don.statut}
                              onChange={(e) => handleUpdateStatus(don.id, e.target.value)}
                              disabled={processing === don.id}
                              className="rounded-xl border border-slate-200 shadow-sm px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all disabled:opacity-50"
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
                  className="mt-6 bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-2 shadow-sm"
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}



