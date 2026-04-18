'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Search as SearchIcon,
  X,
  Loader2,
  Archive,
  Undo2,
} from 'lucide-react';
import { DataTable } from '@/components/super-admin/DataTable';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRole } from '@/lib/role-utils';
import { getRoleBadgeClasses, getStatusBadgeClasses } from '@/lib/ui-utils';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import InputModal from '@/components/ui/InputModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';

interface User {
  id: string;
  email: string;
  roleSysteme: string;
  isActive: boolean;
  /** Soft delete : compte archivé, plus de connexion, données conservées */
  deletedAt?: string | null;
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

type ConfirmAction = 'delete' | 'suspend' | 'archive' | 'restore' | null;

export default function SuperAdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [processing, setProcessing] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('roleSysteme') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('isActive') || 'all');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: User | null;
    action: ConfirmAction;
  }>({ isOpen: false, user: null, action: null });
  const [reactivateModal, setReactivateModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Synchroniser les champs avec l’URL (navigation, retour arrière, liens)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setRoleFilter(searchParams.get('roleSysteme') || 'all');
    setStatusFilter(searchParams.get('isActive') || 'all');
  }, [searchParams]);

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
      const active = result.data.filter((u) => u.isActive && !u.deletedAt).length;
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
        <div className="font-medium text-gray-900 dark:text-slate-100">{user.email}</div>
      ),
    },
    {
      key: 'member',
      label: 'Membre',
      render: (user: User) => (
        <div className="text-gray-900 dark:text-slate-100">
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
        const label = user.deletedAt
          ? 'Archivé'
          : user.isActive
            ? 'Actif'
            : 'Inactif';
        const statusClass = user.deletedAt
          ? 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/50'
          : getStatusBadgeClasses('', user.isActive);
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (user: User) => (
        <div className="text-gray-500 dark:text-slate-400">
          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
        </div>
      ),
    },
  ];

  const handleSuspend = (user: User) => {
    setConfirmModal({
      isOpen: true,
      user,
      action: 'suspend',
    });
  };

  const openReactivateModal = (user: User) => {
    setReactivateModal({ isOpen: true, user });
  };

  const confirmSuspend = async () => {
    if (!confirmModal.user) return;
    const userToProcess = confirmModal.user;

    setProcessing(userToProcess.id);
    setConfirmModal({ isOpen: false, user: null, action: null });

    try {
      const response = await fetch(`/api/super-admin/users/${userToProcess.id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend: true }),
      });

      if (response.ok) {
        await fetchUsers();
        setSuccessModal({
          isOpen: true,
          message: 'Utilisateur suspendu avec succès.',
        });
      } else {
        const data = await response.json();
        setErrorModal({
          isOpen: true,
          message: data.error || 'Erreur lors de la tentative de suspension',
        });
      }
    } catch {
      setErrorModal({ isOpen: true, message: 'Erreur lors de la tentative de suspension' });
    } finally {
      setProcessing(null);
    }
  };

  const confirmReactivate = async (reason: string) => {
    const userToReactivate = reactivateModal.user;
    if (!userToReactivate) return;

    setProcessing(userToReactivate.id);

    try {
      const response = await fetch(`/api/super-admin/users/${userToReactivate.id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend: false, reason: reason.trim() }),
      });

      if (response.ok) {
        setReactivateModal({ isOpen: false, user: null });
        await fetchUsers();
        setSuccessModal({
          isOpen: true,
          message: 'Utilisateur réactivé avec succès.',
        });
      } else {
        const data = await response.json();
        const msg =
          data.details?.[0]?.message ||
          data.error ||
          'Erreur lors de la réactivation';
        setErrorModal({
          isOpen: true,
          message: typeof msg === 'string' ? msg : 'Erreur lors de la réactivation',
        });
      }
    } catch {
      setErrorModal({ isOpen: true, message: 'Erreur lors de la réactivation' });
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = (user: User) => {
    setConfirmModal({
      isOpen: true,
      user,
      action: 'delete',
    });
  };

  const handleArchive = (user: User) => {
    setConfirmModal({
      isOpen: true,
      user,
      action: 'archive',
    });
  };

  const handleRestore = (user: User) => {
    setConfirmModal({
      isOpen: true,
      user,
      action: 'restore',
    });
  };

  const confirmArchive = async () => {
    if (!confirmModal.user) return;
    const u = confirmModal.user;

    setProcessing(u.id);
    setConfirmModal({ isOpen: false, user: null, action: null });

    try {
      const response = await fetch(`/api/super-admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lifecycle: 'soft_delete' }),
      });

      if (response.ok) {
        await fetchUsers();
        setSuccessModal({
          isOpen: true,
          message: 'Compte archivé : l’utilisateur ne peut plus se connecter ; les données restent en base.',
        });
      } else {
        const data = await response.json();
        setErrorModal({ isOpen: true, message: data.error || 'Erreur lors de l’archivage' });
      }
    } catch {
      setErrorModal({ isOpen: true, message: 'Erreur lors de l’archivage' });
    } finally {
      setProcessing(null);
    }
  };

  const confirmRestore = async () => {
    if (!confirmModal.user) return;
    const u = confirmModal.user;

    setProcessing(u.id);
    setConfirmModal({ isOpen: false, user: null, action: null });

    try {
      const response = await fetch(`/api/super-admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lifecycle: 'restore' }),
      });

      if (response.ok) {
        await fetchUsers();
        setSuccessModal({
          isOpen: true,
          message: 'Compte restauré : l’utilisateur peut à nouveau se connecter.',
        });
      } else {
        const data = await response.json();
        setErrorModal({ isOpen: true, message: data.error || 'Erreur lors de la restauration' });
      }
    } catch {
      setErrorModal({ isOpen: true, message: 'Erreur lors de la restauration' });
    } finally {
      setProcessing(null);
    }
  };

  const confirmDelete = async () => {
    if (!confirmModal.user) return;
    const userToDelete = confirmModal.user;

    setProcessing(userToDelete.id);
    setConfirmModal({ isOpen: false, user: null, action: null });

    try {
      const response = await fetch(`/api/super-admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchUsers();
        setSuccessModal({
          isOpen: true,
          message: 'Utilisateur supprimé définitivement. Les entrées d’audit conservent l’identité de l’acteur.',
        });
      } else {
        const data = await response.json();
        setErrorModal({ isOpen: true, message: data.error || 'Erreur lors de la suppression' });
      }
    } catch {
      setErrorModal({ isOpen: true, message: 'Erreur lors de la suppression' });
    } finally {
      setProcessing(null);
    }
  };

  type ActionItem = { label: string; onClick: () => void; variant?: 'default' | 'destructive' | 'outline' | 'edit' | 'add' | 'delete' | 'view'; icon?: React.ReactNode };

  const getActions = (user: User): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        label: 'Modifier',
        onClick: () => router.push(`/admin/users/${user.id}/edit`),
        variant: 'edit',
        icon: <Edit className="mr-2 h-4 w-4" />,
      },
    ];

    const isSelf = Boolean(currentUserId && user.id === currentUserId);

    if (!isSelf) {
      if (user.deletedAt) {
        actions.push({
          label: processing === user.id ? 'Restauration...' : 'Restaurer',
          onClick: () => handleRestore(user),
          variant: 'outline',
          icon:
            processing === user.id ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Undo2 className="mr-2 h-4 w-4" />
            ),
        });
      } else {
        if (user.isActive) {
          actions.push({
            label: processing === user.id ? 'Suspension...' : 'Suspendre',
            onClick: () => handleSuspend(user),
            variant: 'outline',
            icon:
              processing === user.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              ),
          });
        } else {
          actions.push({
            label: processing === user.id ? 'Réactivation...' : 'Réactiver',
            onClick: () => openReactivateModal(user),
            variant: 'outline',
            icon:
              processing === user.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              ),
          });
        }

        actions.push({
          label: processing === user.id ? 'Archivage...' : 'Archiver',
          onClick: () => handleArchive(user),
          variant: 'outline',
          icon:
            processing === user.id ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Archive className="mr-2 h-4 w-4" />
            ),
        });
      }

      actions.push({
        label: processing === user.id ? 'Suppression...' : 'Supprimer définitivement',
        onClick: () => handleDelete(user),
        variant: 'delete',
        icon:
          processing === user.id ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          ),
      });
    }

    return actions;
  };

  const hasActiveFilters = Boolean(
    searchParams.get('search') ||
      (searchParams.get('roleSysteme') && searchParams.get('roleSysteme') !== 'all') ||
      (searchParams.get('isActive') && searchParams.get('isActive') !== 'all')
  );

  return (
    <div className="admin-page mx-auto max-w-7xl space-y-8 animate-in fade-in duration-500">
      <div className="admin-glass flex flex-col justify-between gap-4 rounded-3xl p-6 shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
            Gestion des utilisateurs
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {stats.total} utilisateur{stats.total > 1 ? 's' : ''} au total ({stats.active} actif
            {stats.active > 1 ? 's' : ''})
          </p>
        </div>
        <Link href="/admin/users/nouveau">
          <Button variant="add">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="admin-panel space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[200px] flex-1">
            <div className="relative flex items-center gap-2">
              <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400 dark:text-slate-500" />
              <Input
                placeholder="Email, prénom ou nom du membre…"
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
            <SelectTrigger className="w-[200px] border-slate-300 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent className="z-[100]" position="popper">
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="SUPER_ADMIN">{formatRole('SUPER_ADMIN')}</SelectItem>
              <SelectItem value="ADMIN">{formatRole('ADMIN')}</SelectItem>
              <SelectItem value="MEMBER">{formatRole('MEMBER')}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) => {
              setStatusFilter(value);
              handleFilterChange('isActive', value);
            }}
          >
            <SelectTrigger className="w-[200px] border-slate-300 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="z-[100]" position="popper">
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="true">Actif</SelectItem>
              <SelectItem value="false">Inactif</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
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
        emptyMessage="Aucun utilisateur trouvé"
      />

      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'delete'}
        onClose={() => setConfirmModal({ isOpen: false, user: null, action: null })}
        onConfirm={confirmDelete}
        title="Suppression définitive"
        message={
          confirmModal.user
            ? `Supprimer définitivement « ${confirmModal.user.email} » ?\n\n` +
              `Le profil, les commentaires et les messages bureau liés seront effacés. ` +
              `Les entrées d’historique d’audit conservent l’identité de l’acteur (email enregistré sur chaque action) pour la traçabilité.`
            : ''
        }
        type="danger"
        confirmText="Supprimer définitivement"
        isLoading={Boolean(confirmModal.user && processing === confirmModal.user.id)}
      />
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'archive'}
        onClose={() => setConfirmModal({ isOpen: false, user: null, action: null })}
        onConfirm={confirmArchive}
        title="Archiver le compte"
        message={
          confirmModal.user
            ? `Archiver « ${confirmModal.user.email} » ?\n\n` +
              `L’utilisateur ne pourra plus se connecter. Aucune donnée n’est effacée ; vous pourrez restaurer le compte plus tard.`
            : ''
        }
        type="warning"
        confirmText="Archiver"
        isLoading={Boolean(confirmModal.user && processing === confirmModal.user.id)}
      />
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'restore'}
        onClose={() => setConfirmModal({ isOpen: false, user: null, action: null })}
        onConfirm={confirmRestore}
        title="Restaurer le compte"
        message={
          confirmModal.user
            ? `Restaurer « ${confirmModal.user.email} » ? Le compte redeviendra actif et l’utilisateur pourra se connecter.`
            : ''
        }
        type="info"
        confirmText="Restaurer"
        isLoading={Boolean(confirmModal.user && processing === confirmModal.user.id)}
      />
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'suspend'}
        onClose={() => setConfirmModal({ isOpen: false, user: null, action: null })}
        onConfirm={confirmSuspend}
        title="Suspendre l'utilisateur"
        message={
          confirmModal.user
            ? `Êtes-vous sûr de vouloir suspendre l'utilisateur "${confirmModal.user.email}" ? Son compte et son accès seront désactivés.`
            : ''
        }
        type="warning"
        confirmText="Suspendre"
        isLoading={Boolean(confirmModal.user && processing === confirmModal.user.id)}
      />
      <InputModal
        isOpen={reactivateModal.isOpen && Boolean(reactivateModal.user)}
        onClose={() => setReactivateModal({ isOpen: false, user: null })}
        onConfirm={confirmReactivate}
        title="Réactiver l'utilisateur"
        message={
          reactivateModal.user
            ? `Indiquez la raison de la réactivation du compte « ${reactivateModal.user.email} ». Cette information sera conservée dans l’historique d’audit.`
            : ''
        }
        label="Raison de la réactivation"
        placeholder="Ex. : levée de suspension, erreur de traitement, validation du dossier…"
        type="textarea"
        required
        minLength={3}
        confirmText="Réactiver"
        isLoading={Boolean(reactivateModal.user && processing === reactivateModal.user.id)}
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
