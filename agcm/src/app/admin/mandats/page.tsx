'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye, Trash2, Search, Filter, X, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/super-admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';

interface Mandat {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  _count?: {
    affectations: number;
    contents: number;
    projets: number;
    events: number;
  };
}

interface PaginatedResponse {
  data: Mandat[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function SuperAdminMandatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statutFilter, setStatutFilter] = useState(searchParams.get('statut') || 'all');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; mandatId: string | null }>({ isOpen: false, mandatId: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setStatutFilter(searchParams.get('statut') || 'all');
  }, [searchParams]);

  useEffect(() => {
    fetchMandats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchParams]);

  const fetchMandats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const searchValue = searchParams.get('search') || '';
      const statutValue = searchParams.get('statut') || '';

      if (searchValue) params.set('search', searchValue);
      if (statutValue && statutValue !== 'all') params.set('statut', statutValue);

      const response = await fetch(`/api/super-admin/mandats?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const result: PaginatedResponse = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (search.trim()) params.set('search', search.trim());
    else params.delete('search');
    router.push(`?${params.toString()}`);
  };

  const handleStatutFilterChange = (value: string) => {
    setStatutFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (value && value !== 'all') params.set('statut', value);
    else params.delete('statut');
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setStatutFilter('all');
    router.push('/admin/mandats?page=1');
  };

  const hasActiveFilters = Boolean(
    searchParams.get('search') ||
      (searchParams.get('statut') && searchParams.get('statut') !== 'all')
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  const columns = [
    {
      key: 'titre',
      label: 'Titre',
      render: (mandat: Mandat) => (
        <div className="font-medium text-gray-900 dark:text-slate-100">{mandat.titre}</div>
      ),
    },
    {
      key: 'dates',
      label: 'Période',
      render: (mandat: Mandat) => (
        <div className="text-gray-900 dark:text-slate-200">
          {new Date(mandat.dateDebut).toLocaleDateString('fr-FR')} —{' '}
          {new Date(mandat.dateFin).toLocaleDateString('fr-FR')}
        </div>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (mandat: Mandat) => (
        <Badge
          variant={
            mandat.statut === 'ACTIF'
              ? 'success'
              : mandat.statut === 'EXPIRE'
                ? 'destructive'
                : 'default'
          }
        >
          {mandat.statut}
        </Badge>
      ),
    },
    {
      key: 'stats',
      label: 'Statistiques',
      render: (mandat: Mandat) => (
        <div className="text-sm text-gray-500 dark:text-slate-400">
          {mandat._count ? (
            <>
              {mandat._count.affectations} affectation{mandat._count.affectations > 1 ? 's' : ''} •{' '}
              {mandat._count.contents} contenu{mandat._count.contents > 1 ? 's' : ''}
            </>
          ) : (
            '—'
          )}
        </div>
      ),
    },
  ];

  const handleDelete = async (mandatId: string) => {
    setConfirmModal({ isOpen: true, mandatId });
  };

  const confirmDelete = async () => {
    if (!confirmModal.mandatId) return;

    const idToDelete = confirmModal.mandatId;
    setDeleting(idToDelete);
    setConfirmModal({ isOpen: false, mandatId: null });

    try {
      const response = await fetch(`/api/super-admin/mandats/${idToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorModal({ isOpen: true, message: errorData.error || 'Erreur lors de la suppression' });
        return;
      }

      fetchMandats();
      setSuccessModal({ isOpen: true, message: 'Mandat supprimé avec succès' });
    } catch {
      setErrorModal({ isOpen: true, message: 'Erreur lors de la suppression' });
    } finally {
      setDeleting(null);
    }
  };

  const getActions = (mandat: Mandat) => {
    const isMandatPasse = new Date(mandat.dateFin) < new Date();
    const canEdit = !isMandatPasse;

    return [
      {
        label: canEdit ? 'Modifier' : 'Modifier (indisponible)',
        onClick: canEdit ? () => router.push(`/admin/mandats/${mandat.id}/edit`) : () => {},
        variant: (canEdit ? 'edit' : 'outline') as 'edit' | 'outline',
        icon: <Edit className="mr-2 h-4 w-4" />,
        disabled: !canEdit,
        className: canEdit ? '' : 'cursor-not-allowed opacity-50',
        title: canEdit ? undefined : 'Ce mandat est terminé et ne peut plus être modifié',
      },
      {
        label: 'Voir détails',
        onClick: () => router.push(`/admin/mandats/${mandat.id}`),
        variant: 'outline' as const,
        icon: <Eye className="mr-2 h-4 w-4" />,
      },
      {
        label: deleting === mandat.id ? 'Suppression...' : 'Supprimer',
        onClick: () => handleDelete(mandat.id),
        variant: 'delete' as const,
        icon:
          deleting === mandat.id ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          ),
        disabled: deleting === mandat.id,
      },
    ];
  };

  return (
    <div className="admin-page mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500">
      <div className="admin-glass flex flex-col justify-between gap-4 rounded-3xl p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
            Gestion des mandats
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {data?.pagination.total ?? 0} mandat{data?.pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/mandats/nouveau">
          <Button variant="add">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau mandat
          </Button>
        </Link>
      </div>

      <div className="admin-panel space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
          <Filter className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filtres</h3>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="ml-auto border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <X className="mr-1 h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="search-mandat" className="text-slate-700 dark:text-slate-300">
              Rechercher par titre
            </Label>
            <div className="relative mt-1.5 flex items-center gap-2">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                id="search-mandat"
                type="text"
                placeholder="Titre du mandat…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="border-slate-300 pl-10 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100"
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
          <div>
            <Label className="text-slate-700 dark:text-slate-300">Statut</Label>
            <Select value={statutFilter || 'all'} onValueChange={handleStatutFilterChange}>
              <SelectTrigger className="mt-1.5 w-full border-slate-300 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent className="z-[100]" position="popper">
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ACTIF">Actif</SelectItem>
                <SelectItem value="EXPIRE">Expiré</SelectItem>
                <SelectItem value="ARCHIVE">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        onRowClick={(mandat) => router.push(`/admin/mandats/${mandat.id}`)}
        loading={loading}
        emptyMessage="Aucun mandat trouvé"
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, mandatId: null })}
        onConfirm={confirmDelete}
        title="Supprimer le mandat"
        message="Êtes-vous sûr de vouloir supprimer ce mandat ? Cette action est irréversible."
        type="danger"
        confirmText="Supprimer"
        isLoading={Boolean(deleting)}
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
