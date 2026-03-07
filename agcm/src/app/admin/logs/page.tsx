'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Eye, Search as SearchIcon, X, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/super-admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import { getActionBadgeClasses } from '@/lib/ui-utils';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user: {
    email: string;
  } | null;
}

interface PaginatedResponse {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function SuperAdminAuditLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [actionFilter, setActionFilter] = useState(searchParams.get('action') || 'all');
  const [entityTypeFilter, setEntityTypeFilter] = useState(searchParams.get('entityType') || 'all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; logId: string | null }>({ isOpen: false, logId: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  // Synchroniser les états avec les searchParams
  useEffect(() => {
    const searchValue = searchParams.get('search') || '';
    const actionValue = searchParams.get('action') || '';
    const entityTypeValue = searchParams.get('entityType') || '';
    
    setSearch(searchValue);
    setActionFilter(actionValue || 'all');
    setEntityTypeFilter(entityTypeValue || 'all');
  }, []); // Seulement au montage initial

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchParams]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      // Utiliser les valeurs des searchParams directement
      const searchValue = searchParams.get('search') || '';
      const actionValue = searchParams.get('action') || '';
      const entityTypeValue = searchParams.get('entityType') || '';

      if (searchValue) params.set('search', searchValue);
      if (actionValue && actionValue !== 'all') params.set('action', actionValue);
      if (entityTypeValue && entityTypeValue !== 'all') params.set('entityType', entityTypeValue);

      const response = await fetch(`/api/super-admin/audit-logs?${params.toString()}`);
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
    setActionFilter('all');
    setEntityTypeFilter('all');
    router.push('/admin/audit-logs?page=1');
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  const handleDelete = (logId: string) => {
    setDeleteConfirmModal({ isOpen: true, logId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmModal.logId) return;

    setDeleting(deleteConfirmModal.logId);
    setDeleteConfirmModal({ isOpen: false, logId: null });

    try {
      const response = await fetch(`/api/super-admin/audit-logs/${deleteConfirmModal.logId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      // Recharger les données
      await fetchLogs();
      setSuccessModal({ isOpen: true, message: 'Log d\'audit supprimé avec succès' });
    } catch (error: any) {
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors de la suppression' });
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (log: AuditLog) => (
        <div className="text-gray-900">
          {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Utilisateur',
      render: (log: AuditLog) => (
        <div className="text-gray-900">{log.user?.email || 'Système'}</div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (log: AuditLog) => {
        const actionClass = getActionBadgeClasses(log.action);
        return (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${actionClass}`}>
            {log.action}
          </span>
        );
      },
    },
    {
      key: 'entityType',
      label: 'Type',
      render: (log: AuditLog) => (
        <div className="text-gray-900">{log.entityType}</div>
      ),
    },
    {
      key: 'entityId',
      label: 'ID Entité',
      render: (log: AuditLog) => (
        <div className="text-gray-500 font-mono text-xs">{log.entityId.substring(0, 8)}...</div>
      ),
    },
  ];

  const getActions = (log: AuditLog) => [
    {
      label: 'Voir détails',
      onClick: () => router.push(`/admin/audit-logs/${log.id}`),
      variant: 'view' as const,
      icon: <Eye className="h-4 w-4 mr-2" />,
    },
    {
      label: deleting === log.id ? 'Suppression...' : 'Supprimer',
      onClick: () => handleDelete(log.id),
      variant: 'delete' as const,
      icon: deleting === log.id ? (
        <span className="animate-spin">⏳</span>
      ) : (
        <Trash2 className="h-4 w-4 mr-2" />
      ),
      disabled: deleting === log.id,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Logs d'audit</h1>
        <p className="text-gray-600 mt-1">
          {data?.pagination.total || 0} action{data?.pagination.total !== 1 ? 's' : ''} enregistrée{data?.pagination.total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtres de recherche */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative flex items-center gap-2">
              <SearchIcon className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Rechercher par email utilisateur..."
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
            value={actionFilter || 'all'} 
            onValueChange={(value) => {
              setActionFilter(value);
              handleFilterChange('action', value);
            }}
          >
            <SelectTrigger className="w-[180px] text-gray-900">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all" className="text-gray-900">Toutes les actions</SelectItem>
              <SelectItem value="CREATE" className="text-gray-900">Créer</SelectItem>
              <SelectItem value="UPDATE" className="text-gray-900">Modifier</SelectItem>
              <SelectItem value="DELETE" className="text-gray-900">Supprimer</SelectItem>
              <SelectItem value="ASSIGN" className="text-gray-900">Assigner</SelectItem>
              <SelectItem value="INACTIVATE" className="text-gray-900">Inactiver</SelectItem>
              <SelectItem value="APPROVE" className="text-gray-900">Approuver</SelectItem>
              <SelectItem value="REJECT" className="text-gray-900">Rejeter</SelectItem>
              <SelectItem value="SUBMIT" className="text-gray-900">Soumettre</SelectItem>
              <SelectItem value="ARCHIVE" className="text-gray-900">Archiver</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={entityTypeFilter || 'all'} 
            onValueChange={(value) => {
              setEntityTypeFilter(value);
              handleFilterChange('entityType', value);
            }}
          >
            <SelectTrigger className="w-[200px] text-gray-900">
              <SelectValue placeholder="Type d'entité" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all" className="text-gray-900">Tous les types</SelectItem>
              <SelectItem value="User" className="text-gray-900">Utilisateur</SelectItem>
              <SelectItem value="Member" className="text-gray-900">Membre</SelectItem>
              <SelectItem value="Content" className="text-gray-900">Contenu</SelectItem>
              <SelectItem value="Vote" className="text-gray-900">Vote</SelectItem>
              <SelectItem value="AffectationPoste" className="text-gray-900">Affectation</SelectItem>
              <SelectItem value="Poste" className="text-gray-900">Poste</SelectItem>
              <SelectItem value="Mandat" className="text-gray-900">Mandat</SelectItem>
              <SelectItem value="Notification" className="text-gray-900">Notification</SelectItem>
            </SelectContent>
          </Select>
          {(searchParams.get('search') || (searchParams.get('action') && searchParams.get('action') !== 'all') || (searchParams.get('entityType') && searchParams.get('entityType') !== 'all')) && (
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
        emptyMessage="Aucun log d'audit trouvé"
      />

      {/* Modals */}
      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, logId: null })}
        onConfirm={confirmDelete}
        title="Supprimer le log d'audit"
        message="Êtes-vous sûr de vouloir supprimer ce log d'audit ? Cette action est irréversible."
        type="danger"
        confirmText="Supprimer"
        isLoading={deleting === deleteConfirmModal.logId}
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
