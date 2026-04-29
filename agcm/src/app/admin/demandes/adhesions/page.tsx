'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Search as SearchIcon, X, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
interface DemandeAdhesion {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  ville: string | null;
  pays: string | null;
  message: string | null;
  statut: string;
  createdAt: string;
}

interface PaginatedResponse {
  data: DemandeAdhesion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminDemandesAdhesionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [demandes, setDemandes] = useState<DemandeAdhesion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statutFilter, setStatutFilter] = useState(searchParams.get('statut') || 'EN_ATTENTE');
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedDemande, setSelectedDemande] = useState<DemandeAdhesion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: 'approve' | 'reject' | null; demandeId: string | null }>({ isOpen: false, action: null, demandeId: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  useEffect(() => {
    const searchValue = searchParams.get('search') || '';
    const statutValue = searchParams.get('statut') || 'EN_ATTENTE';
    const pageValue = parseInt(searchParams.get('page') || '1');

    setSearch(searchValue);
    setStatutFilter(statutValue);
    setPage(pageValue);
  }, [searchParams]);

  const searchFromUrl = searchParams.get('search') || '';

  useEffect(() => {
    fetchDemandes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statutFilter, searchFromUrl]);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        statut: statutFilter,
      });

      const searchValue = searchParams.get('search') || '';
      if (searchValue) params.set('search', searchValue);

      const response = await fetch(`/api/admin/demandes/adhesions?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const result: PaginatedResponse = await response.json();
      setDemandes(result.data || []);
      setTotal(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
      setErrorModal({ isOpen: true, message: 'Erreur lors du chargement des demandes' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

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
    setStatutFilter('EN_ATTENTE');
    router.push(`/admin/demandes/adhesions?statut=EN_ATTENTE`);
  };

  const handleView = (demande: DemandeAdhesion) => {
    setSelectedDemande(demande);
    setIsModalOpen(true);
  };

  const handleApprove = (demandeId: string) => {
    setConfirmModal({ isOpen: true, action: 'approve', demandeId });
  };

  const handleReject = (demandeId: string) => {
    setConfirmModal({ isOpen: true, action: 'reject', demandeId });
  };

  const confirmAction = async () => {
    if (!confirmModal.demandeId || !confirmModal.action) return;

    setProcessing(confirmModal.demandeId);
    setConfirmModal({ isOpen: false, action: null, demandeId: null });

    try {
      const statut = confirmModal.action === 'approve' ? 'APPROUVEE' : 'REFUSEE';
      const response = await fetch(`/api/admin/demandes/adhesions/${confirmModal.demandeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmModal.demandeId, statut }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      setSuccessModal({
        isOpen: true,
        message: statut === 'APPROUVEE'
          ? 'Demande approuvée avec succès'
          : 'Demande refusée avec succès'
      });
      fetchDemandes();
    } catch (error: any) {
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors de la mise à jour' });
    } finally {
      setProcessing(null);
    }
  };

  const getStatutBadge = (statut: string) => {
    const statusMap: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'APPROUVEE': 'Approuvée',
      'REFUSEE': 'Refusée',
    };
    return statusMap[statut] || statut;
  };

  const hasActiveFilters = Boolean(
    searchParams.get('search') ||
      (searchParams.get('statut') && searchParams.get('statut') !== 'EN_ATTENTE')
  );

  const buildTabHref = (statut: string) => {
    const p = new URLSearchParams();
    p.set('statut', statut);
    const q = searchParams.get('search');
    if (q) p.set('search', q);
    return `/admin/demandes/adhesions?${p.toString()}`;
  };

  const tabButtonClass = (key: 'EN_ATTENTE' | 'APPROUVEE' | 'REFUSEE') =>
    cn(
      'rounded-b-none gap-2 transition-all duration-200',
      statutFilter === key
        ? 'cursor-pointer shadow-sm ring-1 ring-slate-200/70 dark:ring-slate-600'
        : 'cursor-pointer border border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 hover:shadow-md active:scale-[0.98] dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/90 dark:hover:text-slate-50'
    );

  if (loading && demandes.length === 0) {
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
                Demandes d&apos;Adhésion
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Gérer les demandes d&apos;adhésion des nouveaux membres
              </p>
            </div>
          </div>

          {/* Filtres par statut */}
          <div className="flex gap-2 overflow-x-auto border-b border-gray-200 pb-px dark:border-slate-700">
            <Link
              href={buildTabHref('EN_ATTENTE')}
              className="inline-flex shrink-0 rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              aria-current={statutFilter === 'EN_ATTENTE' ? 'page' : undefined}
            >
              <Button
                variant={statutFilter === 'EN_ATTENTE' ? 'default' : 'ghost'}
                className={tabButtonClass('EN_ATTENTE')}
              >
                <Clock className="h-4 w-4" />
                En attente
              </Button>
            </Link>
            <Link
              href={buildTabHref('APPROUVEE')}
              className="inline-flex shrink-0 rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              aria-current={statutFilter === 'APPROUVEE' ? 'page' : undefined}
            >
              <Button
                variant={statutFilter === 'APPROUVEE' ? 'default' : 'ghost'}
                className={tabButtonClass('APPROUVEE')}
              >
                <CheckCircle className="h-4 w-4" />
                Approuvées
              </Button>
            </Link>
            <Link
              href={buildTabHref('REFUSEE')}
              className="inline-flex shrink-0 rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              aria-current={statutFilter === 'REFUSEE' ? 'page' : undefined}
            >
              <Button
                variant={statutFilter === 'REFUSEE' ? 'default' : 'ghost'}
                className={tabButtonClass('REFUSEE')}
              >
                <XCircle className="h-4 w-4" />
                Refusées
              </Button>
            </Link>
          </div>

          {/* Filtres de recherche */}
          <div className="admin-panel p-4 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative flex items-center gap-2">
                  <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
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

          {/* Liste des demandes */}
          <div className="admin-panel overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800/90">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Membre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Localisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-950/80">
                  {demandes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                        Aucune demande trouvée
                      </td>
                    </tr>
                  ) : (
                    demandes.map((demande) => (
                      <tr
                        key={demande.id}
                        onClick={() => handleView(demande)}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-slate-100">
                            {demande.prenom} {demande.nom}
                          </div>
                          {demande.message && (
                            <div className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-slate-400">
                              &quot;{demande.message.substring(0, 60)}...&quot;
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-slate-100">{demande.email}</div>
                          {demande.telephone && (
                            <div className="text-sm text-gray-500 dark:text-slate-400">{demande.telephone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {demande.ville && (
                            <div className="text-sm text-gray-900 dark:text-slate-100">{demande.ville}</div>
                          )}
                          {demande.pays && (
                            <div className="text-sm text-gray-500 dark:text-slate-400">{demande.pays}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              demande.statut === 'APPROUVEE' ? 'approuve' :
                                demande.statut === 'REFUSEE' ? 'rejete' :
                                  'soumis'
                            }
                          >
                            {getStatutBadge(demande.statut)}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                          {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="view"
                              size="sm"
                              onClick={() => handleView(demande)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                            {demande.statut === 'EN_ATTENTE' && (
                              <>
                                <Button
                                  variant="add"
                                  size="sm"
                                  onClick={() => handleApprove(demande.id)}
                                  disabled={processing === demande.id}
                                >
                                  {processing === demande.id ? (
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Approuver
                                </Button>
                                <Button
                                  variant="delete"
                                  size="sm"
                                  onClick={() => handleReject(demande.id)}
                                  disabled={processing === demande.id}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Refuser
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="text-sm text-gray-700 dark:text-slate-300">
                  Affichage de {((page - 1) * 10) + 1} à {Math.min(page * 10, total)} sur {total}
                </div>
                <div className="flex items-center gap-2">
                  {page > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', String(page - 1));
                        router.push(`?${params.toString()}`);
                      }}
                    >
                      Précédent
                    </Button>
                  )}
                  {/* Numéros de page */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className="min-w-[40px] border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
                          onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('page', String(pageNum));
                            router.push(`?${params.toString()}`);
                          }}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  {page < totalPages && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', String(page + 1));
                        router.push(`?${params.toString()}`);
                      }}
                    >
                      Suivant
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal de détail */}
          {selectedDemande && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center ${isModalOpen ? '' : 'hidden'}`}
              onClick={() => {
                setIsModalOpen(false);
                setSelectedDemande(null);
              }}
            >
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
              <div
                className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                      {selectedDemande.prenom} {selectedDemande.nom}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedDemande(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</h3>
                      <p className="text-gray-900 dark:text-slate-100">{selectedDemande.email}</p>
                    </div>
                    {selectedDemande.telephone && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Téléphone</h3>
                        <p className="text-gray-900 dark:text-slate-100">{selectedDemande.telephone}</p>
                      </div>
                    )}
                    {(selectedDemande.ville || selectedDemande.pays) && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Localisation</h3>
                        <p className="text-gray-900 dark:text-slate-100">
                          {selectedDemande.ville}{selectedDemande.ville && selectedDemande.pays ? ', ' : ''}
                          {selectedDemande.pays}
                        </p>
                      </div>
                    )}
                    {selectedDemande.message && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Message</h3>
                        <p className="whitespace-pre-wrap text-gray-900 dark:text-slate-100">{selectedDemande.message}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Statut</h3>
                      <Badge
                        variant={
                          selectedDemande.statut === 'APPROUVEE' ? 'approuve' :
                            selectedDemande.statut === 'REFUSEE' ? 'rejete' :
                              'soumis'
                        }
                      >
                        {getStatutBadge(selectedDemande.statut)}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400">Date de demande</h3>
                      <p className="text-gray-900 dark:text-slate-100">
                        {new Date(selectedDemande.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modals */}
          <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={() => setConfirmModal({ isOpen: false, action: null, demandeId: null })}
            onConfirm={confirmAction}
            title={confirmModal.action === 'approve' ? 'Approuver la demande' : 'Refuser la demande'}
            message={
              confirmModal.action === 'approve'
                ? 'Êtes-vous sûr de vouloir approuver cette demande d\'adhésion ?'
                : 'Êtes-vous sûr de vouloir refuser cette demande d\'adhésion ?'
            }
            type={confirmModal.action === 'approve' ? 'info' : 'warning'}
            confirmText={confirmModal.action === 'approve' ? 'Approuver' : 'Refuser'}
            isLoading={processing === confirmModal.demandeId}
          />
          <SuccessModal
            isOpen={successModal.isOpen}
            onClose={() => {
              setSuccessModal({ isOpen: false, message: '' });
              fetchDemandes();
            }}
            message={successModal.message}
          />
          <ErrorModal
            isOpen={errorModal.isOpen}
            onClose={() => setErrorModal({ isOpen: false, message: '' })}
            message={errorModal.message}
          />
        </div>
      </main>
    </div>
  );
}


