'use client';

import { useState, useEffect } from 'react';
import { Pagination } from '@/components/ui/pagination';
import { Filters, FilterConfig } from '@/components/ui/filters';
import { Button } from '@/components/ui/button';
import { usePagination } from '@/hooks/use-pagination';
import { useFilters } from '@/hooks/use-filters';
import { Loader2, Check, X } from 'lucide-react';
import { DataTable } from '@/components/super-admin/DataTable';

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
      placeholder: 'Organisation, email, contact, message…',
    },
    {
      type: 'select',
      key: 'statut',
      label: 'Statut',
      selectDefault: 'EN_ATTENTE',
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
                Demandes de Partenariat
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Gérer les demandes de partenariat</p>
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
                key: 'organisation',
                label: 'Organisation',
                render: (demande) => (
                  <div className="font-medium text-slate-900 dark:text-slate-100">{demande.organisation}</div>
                ),
              },
              {
                key: 'contact',
                label: 'Contact',
                render: (demande) => (
                  <div>
                    <div className="text-sm font-medium">{demande.contactNom || '-'}</div>
                    <div className="text-xs text-slate-500">{demande.email}</div>
                  </div>
                ),
              },
              {
                key: 'typePartenariat',
                label: 'Type',
                render: (demande) => (
                  <div className="text-sm">{demande.typePartenariat || '-'}</div>
                ),
              },
              {
                key: 'statut',
                label: 'Statut',
                render: (demande) => (
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      demande.statut === 'APPROUVEE'
                        ? 'border-green-200 bg-green-100/50 text-green-800 dark:border-green-800/50 dark:bg-green-950/40 dark:text-green-300'
                        : demande.statut === 'REFUSEE'
                          ? 'border-red-200 bg-red-100/50 text-red-800 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300'
                          : 'border-amber-200 bg-amber-100/50 text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200'
                    }`}
                  >
                    {demande.statut}
                  </span>
                ),
              },
              {
                key: 'createdAt',
                label: 'Date',
                render: (demande) => (
                  <div className="text-xs text-slate-500">
                    {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
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
            actions={(demande) => 
              demande.statut === 'EN_ATTENTE' ? [
                {
                  label: 'Approuver',
                  onClick: () => handleApprove(demande.id),
                  disabled: processing === demande.id,
                  variant: 'add',
                },
                {
                  label: 'Refuser',
                  onClick: () => handleReject(demande.id),
                  disabled: processing === demande.id,
                  variant: 'destructive',
                },
              ] : []
            }
            emptyMessage="Aucune demande de partenariat trouvée"
            loading={loading && !data}
          />
        </div>
      </main>
    </div>
  );
}



