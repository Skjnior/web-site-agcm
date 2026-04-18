'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Edit, Eye, Search, X } from 'lucide-react';
import { DataTable } from '@/components/super-admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeClasses, getPosteTypeBadgeClasses } from '@/lib/ui-utils';

interface Poste {
  id: string;
  nom: string;
  description: string | null;
  estBureau: boolean;
  estActif: boolean;
  _count?: {
    affectations: number;
    authoredContents: number;
  };
}

interface PaginatedResponse {
  data: Poste[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function SuperAdminPostesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estBureau, setEstBureau] = useState<string>('');
  const [estActif, setEstActif] = useState<string>('');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Synchroniser les états avec les searchParams au chargement initial
  useEffect(() => {
    const searchValue = searchParams.get('search') || '';
    const estBureauValue = searchParams.get('estBureau') || '';
    const estActifValue = searchParams.get('estActif') || '';
    
    setSearch(searchValue);
    setEstBureau(estBureauValue);
    setEstActif(estActifValue);
  }, []); // Seulement au montage initial

  // Recharger les données quand les searchParams changent
  useEffect(() => {
    fetchPostes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchParams]);

  const fetchPostes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      // Utiliser les valeurs des searchParams directement
      const searchValue = searchParams.get('search') || '';
      const estBureauValue = searchParams.get('estBureau') || '';
      const estActifValue = searchParams.get('estActif') || '';

      if (searchValue) params.set('search', searchValue);
      if (estBureauValue) params.set('estBureau', estBureauValue);
      if (estActifValue) params.set('estActif', estActifValue);

      const response = await fetch(`/api/super-admin/postes?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const result: PaginatedResponse = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset to first page when filtering
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    handleFilterChange('search', search);
  };

  const handleResetFilters = () => {
    setSearch('');
    setEstBureau('');
    setEstActif('');
    router.push('/admin/postes?page=1');
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  const columns = [
    {
      key: 'nom',
      label: 'Nom',
      render: (poste: Poste) => (
        <div className="font-medium text-slate-900 dark:text-slate-100">{poste.nom}</div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (poste: Poste) => (
        <div className="max-w-md truncate text-slate-900 dark:text-slate-100">
          {poste.description || '-'}
        </div>
      ),
      className: 'max-w-md',
    },
    {
      key: 'estBureau',
      label: 'Bureau',
      render: (poste: Poste) => {
        const bureauClass = getPosteTypeBadgeClasses(poste.estBureau);
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bureauClass}`}>
            {poste.estBureau ? 'Bureau exécutif' : 'Autre'}
          </span>
        );
      },
    },
    {
      key: 'estActif',
      label: 'Statut',
      render: (poste: Poste) => {
        const statusClass = getStatusBadgeClasses('', poste.estActif);
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}>
            {poste.estActif ? 'Actif' : 'Inactif'}
          </span>
        );
      },
    },
    {
      key: 'stats',
      label: 'Utilisation',
      render: (poste: Poste) => (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {poste._count ? (
            <>
              {poste._count.affectations} affectation{poste._count.affectations > 1 ? 's' : ''}
            </>
          ) : (
            '-'
          )}
        </div>
      ),
    },
  ];

  const getActions = (poste: Poste) => [
    {
      label: 'Modifier',
      onClick: () => router.push(`/admin/postes/${poste.id}/edit`),
      variant: 'edit' as const,
      icon: <Edit className="h-4 w-4 mr-2" />,
    },
    {
      label: 'Voir détails',
      onClick: () => router.push(`/admin/postes/${poste.id}`),
      variant: 'view' as const,
      icon: <Eye className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="admin-page mx-auto max-w-7xl space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
      <div className="admin-glass flex flex-col gap-4 rounded-3xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
            Gestion des postes
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {data?.pagination.total || 0} poste{data?.pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/postes/nouveau" className="shrink-0">
          <Button variant="add">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau poste
          </Button>
        </Link>
      </div>

      <div className="admin-panel p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[200px] flex-1">
            <div className="relative flex items-center gap-2">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Rechercher par nom ou description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSearch}
                className="shrink-0 border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Select
            value={estBureau || 'all'}
            onValueChange={(value) => {
              const newValue = value === 'all' ? '' : value;
              setEstBureau(newValue);
              handleFilterChange('estBureau', newValue);
            }}
          >
            <SelectTrigger className="w-[180px] border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100">
              <SelectValue placeholder="Type de poste" />
            </SelectTrigger>
            <SelectContent className="z-50 border-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="true">Bureau exécutif</SelectItem>
              <SelectItem value="false">Autre</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={estActif || 'all'}
            onValueChange={(value) => {
              const newValue = value === 'all' ? '' : value;
              setEstActif(newValue);
              handleFilterChange('estActif', newValue);
            }}
          >
            <SelectTrigger className="w-[180px] border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="z-50 border-slate-700 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="true">Actif</SelectItem>
              <SelectItem value="false">Inactif</SelectItem>
            </SelectContent>
          </Select>
          {(searchParams.get('search') || searchParams.get('estBureau') || searchParams.get('estActif')) && (
            <Button
              variant="outline"
              onClick={handleResetFilters}
              size="sm"
              className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              <X className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

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
        loading={loading}
        emptyMessage="Aucun poste trouvé"
      />
    </div>
  );
}
