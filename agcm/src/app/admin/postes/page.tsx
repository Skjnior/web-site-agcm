'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Edit, Eye, Search, X } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
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
        <div className="font-medium text-gray-900">{poste.nom}</div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (poste: Poste) => (
        <div className="text-gray-900 max-w-md truncate">
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
        <div className="text-sm text-gray-500">
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
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des postes</h1>
          <p className="text-gray-600 mt-1">
            {data?.pagination.total || 0} poste{data?.pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/postes/nouveau">
          <Button variant="add">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau poste
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative flex items-center gap-2">
              <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
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
                className="shrink-0"
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
            <SelectTrigger className="w-[180px] text-gray-900">
              <SelectValue placeholder="Type de poste" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all" className="text-gray-900">Tous les types</SelectItem>
              <SelectItem value="true" className="text-gray-900">Bureau exécutif</SelectItem>
              <SelectItem value="false" className="text-gray-900">Autre</SelectItem>
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
            <SelectTrigger className="w-[180px] text-gray-900">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all" className="text-gray-900">Tous les statuts</SelectItem>
              <SelectItem value="true" className="text-gray-900">Actif</SelectItem>
              <SelectItem value="false" className="text-gray-900">Inactif</SelectItem>
            </SelectContent>
          </Select>
          {(searchParams.get('search') || searchParams.get('estBureau') || searchParams.get('estActif')) && (
            <Button variant="outline" onClick={handleResetFilters} size="sm">
              <X className="h-4 w-4 mr-2" />
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
