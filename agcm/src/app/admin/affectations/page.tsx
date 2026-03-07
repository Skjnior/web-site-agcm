'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserCheck, Plus, Edit, Eye, X, Trash2, CheckCircle, Search as SearchIcon } from 'lucide-react';
import { DataTable } from '@/components/super-admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStatusBadgeClasses } from '@/lib/ui-utils';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import InputModal from '@/components/ui/InputModal';

interface Affectation {
  id: string;
  dateDebut: string;
  dateFin: string | null;
  statut: string;
  member: {
    prenom: string;
    nom: string;
  };
  poste: {
    nom: string;
  };
  mandat: {
    titre: string;
  };
}

interface PaginatedResponse {
  data: Affectation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function SuperAdminAffectationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [inactivating, setInactivating] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [mandatFilter, setMandatFilter] = useState(searchParams.get('mandatId') || 'all');
  const [statutFilter, setStatutFilter] = useState(searchParams.get('statut') || 'all');
  const [mandats, setMandats] = useState<any[]>([]);
  const [loadingMandats, setLoadingMandats] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; affectation: Affectation | null; action: 'delete' | 'inactivate' | null }>({ isOpen: false, affectation: null, action: null });
  const [inputModal, setInputModal] = useState<{ isOpen: boolean; affectation: Affectation | null }>({ isOpen: false, affectation: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Charger les mandats pour le filtre
  useEffect(() => {
    fetchMandats();
  }, []);

  // Synchroniser les états avec les searchParams
  useEffect(() => {
    const searchValue = searchParams.get('search') || '';
    const mandatValue = searchParams.get('mandatId') || '';
    const statutValue = searchParams.get('statut') || '';
    
    setSearch(searchValue);
    setMandatFilter(mandatValue || 'all');
    setStatutFilter(statutValue || 'all');
  }, []); // Seulement au montage initial

  useEffect(() => {
    fetchAffectations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchParams]);

  const fetchMandats = async () => {
    try {
      setLoadingMandats(true);
      const response = await fetch('/api/super-admin/mandats?limit=100');
      if (response.ok) {
        const result = await response.json();
        setMandats(result.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMandats(false);
    }
  };

  const fetchAffectations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      // Utiliser les valeurs des searchParams directement
      const searchValue = searchParams.get('search') || '';
      const mandatValue = searchParams.get('mandatId') || '';
      const statutValue = searchParams.get('statut') || '';

      if (searchValue) params.set('search', searchValue);
      if (mandatValue && mandatValue !== 'all') params.set('mandatId', mandatValue);
      if (statutValue && statutValue !== 'all') params.set('statut', statutValue);

      const response = await fetch(`/api/super-admin/affectations?${params.toString()}`);
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
    
    if (value && value !== 'all') {
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
    setMandatFilter('all');
    setStatutFilter('all');
    router.push('/admin/affectations?page=1');
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  const handleInactiver = async (affectation: Affectation) => {
    setConfirmModal({
      isOpen: true,
      affectation,
      action: 'inactivate',
    });
  };

  const confirmInactivate = async () => {
    if (!confirmModal.affectation) return;
    
    // Ouvrir le modal d'input pour la raison
    setInputModal({ isOpen: true, affectation: confirmModal.affectation });
    setConfirmModal({ isOpen: false, affectation: null, action: null });
  };

  const handleInactivateWithReason = async (raison: string) => {
    if (!inputModal.affectation) return;
    
    if (!raison || raison.trim() === '') {
      setErrorModal({ isOpen: true, message: 'La raison est obligatoire' });
      setConfirmModal({ isOpen: false, affectation: null, action: null });
      return;
    }

    try {
      setInactivating(inputModal.affectation.id);
      setInputModal({ isOpen: false, affectation: null });
      
      const response = await fetch(`/api/super-admin/affectations/${inputModal.affectation.id}/inactiver`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raisonInactivation: raison,
          dateFin: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'inactivation');
      }

      fetchAffectations();
      setSuccessModal({ isOpen: true, message: 'Affectation inactivée avec succès' });
    } catch (error: any) {
      console.error(error);
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors de l\'inactivation' });
    } finally {
      setInactivating(null);
    }
  };

  const handleActiver = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir activer cette affectation ?')) {
      return;
    }

    try {
      setActivating(id);
      const response = await fetch(`/api/super-admin/affectations/${id}/activer`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'activation');
      }

      fetchAffectations();
      alert('Affectation activée avec succès');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Erreur lors de l\'activation');
    } finally {
      setActivating(null);
    }
  };

  const handleDelete = async (affectation: Affectation) => {
    // Vérifier si l'affectation est passée
    const isPassee = affectation.dateFin && new Date(affectation.dateFin) < new Date();
    if (isPassee) {
      setErrorModal({ isOpen: true, message: 'Impossible de supprimer une affectation passée. Seules les affectations présentes ou futures peuvent être supprimées.' });
      return;
    }

    setConfirmModal({
      isOpen: true,
      affectation,
      action: 'delete',
    });
  };

  const confirmDelete = async () => {
    if (!confirmModal.affectation) return;
    
    try {
      setDeleting(confirmModal.affectation.id);
      setConfirmModal({ isOpen: false, affectation: null, action: null });
      
      const response = await fetch(`/api/super-admin/affectations/${confirmModal.affectation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      fetchAffectations();
      setSuccessModal({ isOpen: true, message: 'Affectation supprimée avec succès' });
    } catch (error: any) {
      console.error(error);
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors de la suppression' });
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    {
      key: 'member',
      label: 'Membre',
      render: (affectation: Affectation) => (
        <div className="font-medium text-gray-900">
          {affectation.member.prenom} {affectation.member.nom}
        </div>
      ),
    },
    {
      key: 'poste',
      label: 'Poste',
      render: (affectation: Affectation) => (
        <div className="text-gray-900">{affectation.poste.nom}</div>
      ),
    },
    {
      key: 'mandat',
      label: 'Mandat',
      render: (affectation: Affectation) => (
        <div className="text-gray-900">{affectation.mandat.titre}</div>
      ),
    },
    {
      key: 'dates',
      label: 'Période',
      render: (affectation: Affectation) => (
        <div className="text-gray-900">
          {new Date(affectation.dateDebut).toLocaleDateString('fr-FR')} -{' '}
          {affectation.dateFin
            ? new Date(affectation.dateFin).toLocaleDateString('fr-FR')
            : 'En cours'}
        </div>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (affectation: Affectation) => {
        const statusClass = getStatusBadgeClasses(affectation.statut, affectation.statut === 'ACTIF');
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}>
            {affectation.statut}
          </span>
        );
      },
    },
  ];

  type ActionItem = { label: string; onClick: () => void; variant?: 'default' | 'destructive' | 'outline' | 'edit' | 'add' | 'delete' | 'view'; icon?: React.ReactNode; disabled?: boolean };

  const getActions = (affectation: Affectation): ActionItem[] => {
    const isPassee = affectation.dateFin && new Date(affectation.dateFin) < new Date();
    
    const actions: ActionItem[] = [
      {
        label: 'Voir détails',
        onClick: () => router.push(`/admin/affectations/${affectation.id}`),
        variant: 'outline',
        icon: <Eye className="h-4 w-4 mr-2" />,
      },
    ];

    if (affectation.statut === 'ACTIF') {
      actions.push(
        {
          label: 'Modifier',
          onClick: () => router.push(`/admin/affectations/${affectation.id}/edit`),
          variant: 'edit',
          icon: <Edit className="h-4 w-4 mr-2" />,
        },
        {
          label: inactivating === affectation.id ? 'Inactivation...' : 'Inactiver',
          onClick: () => handleInactiver(affectation),
          variant: 'outline',
          icon: inactivating === affectation.id ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <X className="h-4 w-4 mr-2" />
          ),
          disabled: inactivating === affectation.id,
        }
      );
    } else if (affectation.statut === 'INACTIF') {
      actions.push(
        {
          label: 'Modifier',
          onClick: () => router.push(`/admin/affectations/${affectation.id}/edit`),
          variant: 'edit',
          icon: <Edit className="h-4 w-4 mr-2" />,
        },
        {
          label: activating === affectation.id ? 'Activation...' : 'Activer',
          onClick: () => handleActiver(affectation.id),
          variant: 'default',
          icon: activating === affectation.id ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          ),
          disabled: activating === affectation.id,
        }
      );
    }

    // Bouton supprimer (sauf si passée)
    if (!isPassee) {
      actions.push({
        label: deleting === affectation.id ? 'Suppression...' : 'Supprimer',
        onClick: () => handleDelete(affectation),
        variant: 'delete',
        icon: deleting === affectation.id ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <Trash2 className="h-4 w-4 mr-2" />
        ),
        disabled: deleting === affectation.id,
      });
    }

    return actions;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des affectations</h1>
          <p className="text-gray-600 mt-1">
            {data?.pagination.total || 0} affectation{data?.pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/affectations/nouveau">
          <Button variant="add">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle affectation
          </Button>
        </Link>
      </div>

      {/* Filtres de recherche */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative flex items-center gap-2">
              <SearchIcon className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Rechercher par membre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10 text-gray-900"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSearch}
                className="shrink-0"
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Select 
            value={mandatFilter || 'all'} 
            onValueChange={(value) => {
              setMandatFilter(value);
              handleFilterChange('mandatId', value);
            }}
            disabled={loadingMandats}
          >
            <SelectTrigger className="w-[200px] text-gray-900">
              <SelectValue placeholder="Mandat" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all" className="text-gray-900">Tous les mandats</SelectItem>
              {mandats.map((mandat) => (
                <SelectItem key={mandat.id} value={mandat.id} className="text-gray-900">
                  {mandat.titre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={statutFilter || 'all'} 
            onValueChange={(value) => {
              setStatutFilter(value);
              handleFilterChange('statut', value);
            }}
          >
            <SelectTrigger className="w-[180px] text-gray-900">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all" className="text-gray-900">Tous les statuts</SelectItem>
              <SelectItem value="ACTIF" className="text-gray-900">Actif</SelectItem>
              <SelectItem value="INACTIF" className="text-gray-900">Inactif</SelectItem>
            </SelectContent>
          </Select>
          {(searchParams.get('search') || (searchParams.get('mandatId') && searchParams.get('mandatId') !== 'all') || (searchParams.get('statut') && searchParams.get('statut') !== 'all')) && (
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
        emptyMessage="Aucune affectation trouvée"
      />

      {/* Modals */}
      <InputModal
        isOpen={inputModal.isOpen}
        onClose={() => setInputModal({ isOpen: false, affectation: null })}
        onConfirm={handleInactivateWithReason}
        title="Inactiver l'affectation"
        message="Veuillez saisir la raison de l'inactivation :"
        label="Raison d'inactivation"
        placeholder="Ex: Fin de mandat, démission, révocation..."
        required={true}
        type="textarea"
        confirmText="Inactiver"
        isLoading={inputModal.affectation ? inactivating === inputModal.affectation.id : false}
      />
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'delete'}
        onClose={() => setConfirmModal({ isOpen: false, affectation: null, action: null })}
        onConfirm={confirmDelete}
        title="Supprimer l'affectation"
        message={confirmModal.affectation ? `Êtes-vous sûr de vouloir supprimer cette affectation ?\n\nCette action est irréversible.` : ''}
        type="danger"
        confirmText="Supprimer"
        isLoading={deleting === confirmModal.affectation?.id}
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
