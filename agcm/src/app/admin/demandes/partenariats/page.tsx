'use client';

import { useState, useEffect } from 'react';
import { Pagination } from '@/components/ui/pagination';
import { Filters, FilterConfig } from '@/components/ui/filters';
import { Button } from '@/components/ui/button';
import { usePagination } from '@/hooks/use-pagination';
import { useFilters } from '@/hooks/use-filters';
import { Loader2, Check, X } from 'lucide-react';

interface DemandePartenariat {
  id: string;
  organisation: string;
  contactNom: string | null;
  email: string;
  telephone: string | null;
  typePartenariat: string | null;
  message: string | null;
  statut: string;
  createdAt: string;
}

interface PaginatedResponse {
  data: DemandePartenariat[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function AdminDemandesPartenariatsPage() {
  const { page, limit, setPage } = usePagination({ defaultLimit: 20 });
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const filterConfigs: FilterConfig[] = [
    {
      type: 'text',
      key: 'search',
      label: 'Recherche',
      placeholder: 'Rechercher par organisation...',
    },
    {
      type: 'select',
      key: 'statut',
      label: 'Statut',
      options: [
        { label: 'En attente', value: 'EN_ATTENTE' },
        { label: 'Approuvée', value: 'APPROUVEE' },
        { label: 'Refusée', value: 'REFUSEE' },
      ],
    },
  ];

  const { values: filterValues, updateFilters, resetFilters } = useFilters({
    filters: filterConfigs,
  });

  const fetchDemandes = async () => {
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

      const response = await fetch(`/api/admin/demandes/partenariats?${params.toString()}`);
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
    fetchDemandes();
  }, [page, limit, filterValues]);

  const handleApprove = async (id: string) => {
    if (!confirm('Approuver cette demande de partenariat ?')) return;

    try {
      setProcessing(id);
      const response = await fetch(`/api/admin/demandes/partenariats/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'APPROUVEE' }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'approbation');
      fetchDemandes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Refuser cette demande de partenariat ?')) return;

    try {
      setProcessing(id);
      const response = await fetch(`/api/admin/demandes/partenariats/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'REFUSEE' }),
      });

      if (!response.ok) throw new Error('Erreur lors du refus');
      fetchDemandes();
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
    <div className="admin-page flex flex-col pointer-events-auto">
      <main className="flex-1 p-4 md:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="admin-glass rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Demandes de Partenariat</h1>
              <p className="text-slate-500 mt-1">Gérer les demandes de partenariat</p>
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
              <div className="admin-glass rounded-3xl shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-200/50">
                  {data.data.length === 0 ? (
                    <div className="px-6 py-12 text-center text-slate-500">
                      Aucune demande trouvée
                    </div>
                  ) : (
                    data.data.map((demande) => (
                      <div key={demande.id} className="p-6 hover:bg-primary-50/50 transition-colors group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                                {demande.organisation}
                              </h3>
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${demande.statut === 'APPROUVEE' ? 'bg-green-100/50 text-green-700 border-green-200' :
                                demande.statut === 'REFUSEE' ? 'bg-red-100/50 text-red-700 border-red-200' :
                                  'bg-yellow-100/50 text-yellow-700 border-yellow-200'
                                }`}>
                                {demande.statut}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 space-y-1">
                              {demande.contactNom && <p><span className="font-medium text-slate-700">Contact :</span> {demande.contactNom}</p>}
                              <p><span className="font-medium text-slate-700">Email :</span> {demande.email}</p>
                              {demande.telephone && <p><span className="font-medium text-slate-700">Téléphone :</span> {demande.telephone}</p>}
                              {demande.typePartenariat && <p><span className="font-medium text-slate-700">Type :</span> {demande.typePartenariat}</p>}
                              {demande.message && <p className="mt-3 text-slate-500 italic max-w-2xl rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-700/50 dark:bg-slate-800/40">"{demande.message}"</p>}
                              <p className="text-slate-400 mt-2 text-xs font-medium">
                                {new Date(demande.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric', month: 'long', year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          {demande.statut === 'EN_ATTENTE' && (
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(demande.id)}
                                disabled={processing === demande.id}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                {processing === demande.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 mr-1" />
                                )}
                                Approuver
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(demande.id)}
                                disabled={processing === demande.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Refuser
                              </Button>
                            </div>
                          )}
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
                  className="mt-6 admin-glass rounded-2xl p-2 shadow-sm"
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}



