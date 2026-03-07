'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Edit, Eye, Trash2, Search, Filter, X } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [statutFilter, setStatutFilter] = useState(searchParams.get('statut') || '');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; mandatId: string | null }>({ isOpen: false, mandatId: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  useEffect(() => {
    fetchMandats();
  }, [page, limit, search, statutFilter]);

  const fetchMandats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search) {
        params.set('search', search);
      }
      if (statutFilter) {
        params.set('statut', statutFilter);
      }

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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset pagination
    router.push(`?${params.toString()}`);
  };

  const handleStatutFilterChange = (value: string) => {
    setStatutFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('statut', value);
    } else {
      params.delete('statut');
    }
    params.delete('page'); // Reset pagination
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setStatutFilter('');
    const params = new URLSearchParams();
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const hasActiveFilters = search || statutFilter;

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
        <div className="font-medium text-gray-900">{mandat.titre}</div>
      ),
    },
    {
      key: 'dates',
      label: 'Période',
      render: (mandat: Mandat) => (
        <div className="text-gray-900">
          {new Date(mandat.dateDebut).toLocaleDateString('fr-FR')} - {new Date(mandat.dateFin).toLocaleDateString('fr-FR')}
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
        <div className="text-sm text-gray-500">
          {mandat._count ? (
            <>
              {mandat._count.affectations} affectation{mandat._count.affectations > 1 ? 's' : ''} •{' '}
              {mandat._count.contents} contenu{mandat._count.contents > 1 ? 's' : ''}
            </>
          ) : (
            '-'
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
    
    setDeleting(confirmModal.mandatId);
    setConfirmModal({ isOpen: false, mandatId: null });
    
    try {
      const response = await fetch(`/api/super-admin/mandats/${confirmModal.mandatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorModal({ isOpen: true, message: errorData.error || 'Erreur lors de la suppression' });
        return;
      }

      // Recharger les données
      fetchMandats();
      setSuccessModal({ isOpen: true, message: 'Mandat supprimé avec succès' });
    } catch (error) {
      setErrorModal({ isOpen: true, message: 'Erreur lors de la suppression' });
    } finally {
      setDeleting(null);
    }
  };

  const getActions = (mandat: Mandat) => {
    // Vérifier si le mandat est passé (date de fin < aujourd'hui)
    const isMandatPasse = new Date(mandat.dateFin) < new Date();
    const canEdit = !isMandatPasse;

    return [
      {
        label: canEdit ? 'Modifier' : 'Modifier (indisponible)',
        onClick: canEdit ? () => router.push(`/admin/mandats/${mandat.id}/edit`) : undefined,
        variant: canEdit ? ('edit' as const) : ('outline' as const),
        icon: <Edit className="h-4 w-4 mr-2" />,
        disabled: !canEdit,
        className: canEdit ? '' : 'text-gray-400 cursor-not-allowed',
        title: canEdit ? undefined : 'Ce mandat est terminé et ne peut plus être modifié',
      },
    {
      label: 'Voir détails',
      onClick: () => router.push(`/admin/mandats/${mandat.id}`),
      variant: 'outline' as const,
      icon: <Eye className="h-4 w-4 mr-2" />,
    },
    {
      label: 'Supprimer',
      onClick: () => handleDelete(mandat.id),
      variant: 'delete' as const,
      icon: deleting === mandat.id ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <Trash2 className="h-4 w-4 mr-2" />
      ),
      disabled: deleting === mandat.id,
    },
    ];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des mandats</h1>
          <p className="text-gray-600 mt-1">
            {data?.pagination.total || 0} mandat{data?.pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/mandats/nouveau">
          <Button variant="add">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau mandat
          </Button>
        </Link>
      </div>

      {/* Filtres de recherche */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres de recherche</h3>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search">Rechercher par titre</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Rechercher un mandat par titre..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="statut">Filtrer par statut</Label>
            <select
              id="statut"
              value={statutFilter}
              onChange={(e) => handleStatutFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red mt-1"
            >
              <option value="">Tous les statuts</option>
              <option value="ACTIF">Actif</option>
              <option value="EXPIRE">Expiré</option>
              <option value="ARCHIVE">Archivé</option>
            </select>
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
        loading={loading}
        emptyMessage="Aucun mandat trouvé"
      />

      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, mandatId: null })}
        onConfirm={confirmDelete}
        title="Supprimer le mandat"
        message="Êtes-vous sûr de vouloir supprimer ce mandat ? Cette action est irréversible."
        type="danger"
        confirmText="Supprimer"
        isLoading={deleting === confirmModal.mandatId}
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
