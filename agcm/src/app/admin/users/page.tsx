'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Plus, Edit, Trash2, Eye, Ban, CheckCircle, Search as SearchIcon, X } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRole, getRoleBadgeVariant } from '@/lib/role-utils';
import { getRoleBadgeClasses, getStatusBadgeClasses } from '@/lib/ui-utils';
import { useConfirm } from '@/hooks/useConfirm';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';

interface User {
  id: string;
  email: string;
  roleSysteme: string;
  isActive: boolean;
  createdAt: string;
  member: {
    prenom: string;
    nom: string;
  } | null;
}

interface PaginatedResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function SuperAdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [processing, setProcessing] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('roleSysteme') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('isActive') || 'all');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; user: User | null; action: 'delete' | 'suspend' | null }>({ isOpen: false, user: null, action: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Synchroniser les états avec les searchParams
  useEffect(() => {
    const searchValue = searchParams.get('search') || '';
    const roleValue = searchParams.get('roleSysteme') || '';
    const statusValue = searchParams.get('isActive') || '';
    
    setSearch(searchValue);
    setRoleFilter(roleValue || 'all');
    setStatusFilter(statusValue || 'all');
  }, []); // Seulement au montage initial

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchParams]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      // Utiliser les valeurs des searchParams directement
      const searchValue = searchParams.get('search') || '';
      const roleValue = searchParams.get('roleSysteme') || '';
      const statusValue = searchParams.get('isActive') || '';

      if (searchValue) params.set('search', searchValue);
      if (roleValue && roleValue !== 'all') params.set('roleSysteme', roleValue);
      if (statusValue && statusValue !== 'all') params.set('isActive', statusValue);

      const response = await fetch(`/api/super-admin/users?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const result: PaginatedResponse = await response.json();
      setData(result);

      // Calculer les stats
      const total = result.pagination.total;
      const active = result.data.filter((u) => u.isActive).length;
      setStats({ total, active });
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
    setRoleFilter('all');
    setStatusFilter('all');
    router.push('/admin/users?page=1');
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  const columns = [
    {
      key: 'email',
      label: 'Email',
      render: (user: User) => (
        <div className="font-medium text-gray-900">{user.email}</div>
      ),
    },
    {
      key: 'member',
      label: 'Membre',
      render: (user: User) => (
        <div className="text-gray-900">
          {user.member ? `${user.member.prenom} ${user.member.nom}` : '-'}
        </div>
      ),
    },
    {
      key: 'roleSysteme',
      label: 'Rôle',
      render: (user: User) => {
        const roleClass = getRoleBadgeClasses(user.roleSysteme);
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleClass}`}>
            {formatRole(user.roleSysteme)}
          </span>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Statut',
      render: (user: User) => {
        const statusClass = getStatusBadgeClasses('', user.isActive);
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}>
            {user.isActive ? 'Actif' : 'Inactif'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (user: User) => (
        <div className="text-gray-500">
          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
        </div>
      ),
    },
  ];

  const handleSuspend = async (user: User, suspend: boolean) => {
    const action = suspend ? 'suspendre' : 'réactiver';
    setConfirmModal({
      isOpen: true,
      user,
      action: suspend ? 'suspend' : null,
    });
  };

  const confirmSuspend = async () => {
    if (!confirmModal.user) return;
    const suspend = confirmModal.action === 'suspend';
    const action = suspend ? 'suspendre' : 'réactiver';
    
    setProcessing(confirmModal.user.id);
    setConfirmModal({ isOpen: false, user: null, action: null });
    
    try {
      const response = await fetch(`/api/super-admin/users/${confirmModal.user.id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend }),
      });

      if (response.ok) {
        await fetchUsers();
        setSuccessModal({ isOpen: true, message: `Utilisateur ${suspend ? 'suspendu' : 'réactivé'} avec succès.` });
      } else {
        const data = await response.json();
        setErrorModal({ isOpen: true, message: data.error || `Erreur lors de la ${action}` });
      }
    } catch (error) {
      setErrorModal({ isOpen: true, message: `Erreur lors de la ${action}` });
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (user: User) => {
    setConfirmModal({
      isOpen: true,
      user,
      action: 'delete',
    });
  };

  const confirmDelete = async () => {
    if (!confirmModal.user) return;
    
    setProcessing(confirmModal.user.id);
    setConfirmModal({ isOpen: false, user: null, action: null });
    
    try {
      const response = await fetch(`/api/super-admin/users/${confirmModal.user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
        setSuccessModal({ isOpen: true, message: 'Utilisateur supprimé avec succès.' });
      } else {
        const data = await response.json();
        setErrorModal({ isOpen: true, message: data.error || 'Erreur lors de la suppression' });
      }
    } catch (error) {
      setErrorModal({ isOpen: true, message: 'Erreur lors de la suppression' });
    } finally {
      setProcessing(null);
    }
  };

  const getActions = (user: User) => {
    const actions = [
      {
        label: 'Modifier',
        onClick: () => router.push(`/admin/users/${user.id}/edit`),
        variant: 'edit' as const,
        icon: <Edit className="h-4 w-4 mr-2" />,
      },
    ];

    // Suspendre/Réactiver (seulement si ce n'est pas le Super Admin actuel)
    const isCurrentUser = false; // On ne peut pas suspendre soi-même (géré par l'API)
    if (user.isActive) {
      actions.push({
        label: processing === user.id ? 'Suspension...' : 'Suspendre',
        onClick: () => handleSuspend(user, true),
        variant: 'outline' as const,
        icon: processing === user.id ? <span className="animate-spin">⏳</span> : <Ban className="h-4 w-4 mr-2" />,
      });
    } else {
      actions.push({
        label: processing === user.id ? 'Réactivation...' : 'Réactiver',
        onClick: () => handleSuspend(user, false),
        variant: 'outline' as const,
        icon: processing === user.id ? <span className="animate-spin">⏳</span> : <CheckCircle className="h-4 w-4 mr-2" />,
      });
    }

    // Supprimer
    actions.push({
      label: processing === user.id ? 'Suppression...' : 'Supprimer',
      onClick: () => handleDelete(user),
      variant: 'delete' as const,
      icon: processing === user.id ? <span className="animate-spin">⏳</span> : <Trash2 className="h-4 w-4 mr-2" />,
    });

    return actions;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            {stats.total} utilisateur{stats.total > 1 ? 's' : ''} au total ({stats.active} actif{stats.active > 1 ? 's' : ''})
          </p>
        </div>
        <Link href="/admin/users/nouveau">
          <Button variant="add">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel utilisateur
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
                placeholder="Rechercher par email ou nom..."
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
            value={roleFilter || 'all'} 
            onValueChange={(value) => {
              setRoleFilter(value);
              handleFilterChange('roleSysteme', value);
            }}
          >
            <SelectTrigger className="w-[180px] text-gray-900">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all" className="text-gray-900">Tous les rôles</SelectItem>
              <SelectItem value="SUPER_ADMIN" className="text-gray-900">{formatRole('SUPER_ADMIN')}</SelectItem>
              <SelectItem value="ADMIN" className="text-gray-900">{formatRole('ADMIN')}</SelectItem>
              <SelectItem value="MEMBER" className="text-gray-900">{formatRole('MEMBER')}</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={statusFilter || 'all'} 
            onValueChange={(value) => {
              setStatusFilter(value);
              handleFilterChange('isActive', value);
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
          {(searchParams.get('search') || (searchParams.get('roleSysteme') && searchParams.get('roleSysteme') !== 'all') || (searchParams.get('isActive') && searchParams.get('isActive') !== 'all')) && (
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
        emptyMessage="Aucun utilisateur trouvé"
      />

      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'delete'}
        onClose={() => setConfirmModal({ isOpen: false, user: null, action: null })}
        onConfirm={confirmDelete}
        title="Supprimer l'utilisateur"
        message={confirmModal.user ? `Êtes-vous sûr de vouloir supprimer l'utilisateur "${confirmModal.user.email}" ?\n\nCette action est irréversible et supprimera également le membre associé.` : ''}
        type="danger"
        confirmText="Supprimer"
        isLoading={processing === confirmModal.user?.id}
      />
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'suspend'}
        onClose={() => setConfirmModal({ isOpen: false, user: null, action: null })}
        onConfirm={confirmSuspend}
        title="Suspendre l'utilisateur"
        message={confirmModal.user ? `Êtes-vous sûr de vouloir suspendre l'utilisateur "${confirmModal.user.email}" ?` : ''}
        type="warning"
        confirmText="Suspendre"
        isLoading={processing === confirmModal.user?.id}
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
