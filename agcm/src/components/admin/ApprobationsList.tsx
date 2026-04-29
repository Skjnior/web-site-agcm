'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle, FileText, Calendar, User, Trash2, Facebook } from 'lucide-react';
import ApprobationModal from './ApprobationModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import InputModal from '@/components/ui/InputModal';

interface Content {
  id: string;
  type: string;
  titre: string;
  contenu: string | null;
  statutWorkflow: string;
  visibiliteCible: string;
  createdAt: Date;
  auteurPoste: {
    nom: string;
    affectations: Array<{
      member: {
        prenom: string;
        nom: string;
        user: {
          email: string;
        };
      };
    }>;
  };
  mandat: {
    titre: string;
  };
  approvedBy: {
    email: string;
  } | null;
  rejectionReason: string | null;
  canApprove: boolean;
}

interface ApprobationsListProps {
  contents: Content[];
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange?: (page: number) => void;
  onContentDeleted?: () => void;
}

export default function ApprobationsList({
  contents,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onContentDeleted,
}: ApprobationsListProps) {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; contentId: string | null }>({ isOpen: false, contentId: null });
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; contentId: string | null }>({ isOpen: false, contentId: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [facebookToggles, setFacebookToggles] = useState<Record<string, boolean>>({});

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'soumis' | 'approuve' | 'rejete' | 'publie'> = {
      SOUMIS: 'soumis',
      APPROUVE: 'approuve',
      REJETE: 'rejete',
      PUBLIE: 'publie',
    };
    return variants[status] || 'soumis';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ACTIVITE: 'Activité',
      ACTUALITE: 'Actualité',
      PARTAGE: 'Partage',
      ANNONCE: 'Annonce',
    };
    return labels[type] || type;
  };

  const getVisibiliteLabel = (visibilite: string) => {
    const labels: Record<string, string> = {
      PRIVE_BUREAU: 'Privé Bureau',

      PUBLIC_SITE: 'Public Site',
    };
    return labels[visibilite] || visibilite;
  };

  const handleView = (content: Content) => {
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleDelete = (contentId: string) => {
    setDeleteConfirmModal({ isOpen: true, contentId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmModal.contentId) return;

    setDeleting(deleteConfirmModal.contentId);
    setDeleteConfirmModal({ isOpen: false, contentId: null });

    try {
      const response = await fetch(`/api/admin/approbations/${deleteConfirmModal.contentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      setSuccessModal({ isOpen: true, message: 'Contenu supprimé avec succès' });
      if (onContentDeleted) {
        onContentDeleted();
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors de la suppression' });
    } finally {
      setDeleting(null);
    }
  };

  const handleReject = (contentId: string) => {
    setRejectModal({ isOpen: true, contentId });
  };

  const confirmReject = async (reason: string) => {
    if (!rejectModal.contentId) return;

    try {
      const response = await fetch(`/api/admin/approbations/${rejectModal.contentId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du rejet');
      }

      setRejectModal({ isOpen: false, contentId: null });
      setSuccessModal({ isOpen: true, message: 'Contenu rejeté avec succès' });
      if (onContentDeleted) {
        onContentDeleted();
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors du rejet' });
    }
  };

  if (contents.length === 0) {
    return (
      <div className="admin-panel p-12 text-center">
        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-slate-500" />
        <p className="text-gray-600 dark:text-slate-300">Aucun contenu à valider</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-panel overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800/90">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Contenu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Type / Visibilité
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
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-slate-700 dark:bg-slate-950">
              {contents.map((content) => {
                const auteur = content.auteurPoste.affectations[0]?.member;
                return (
                  <tr
                    key={content.id}
                    onClick={() => handleView(content)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-slate-100">{content.titre}</div>
                      {content.contenu && (
                        <div className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-slate-400">
                          {content.contenu.substring(0, 100)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {auteur ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {auteur.prenom} {auteur.nom}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">{content.auteurPoste.nom}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-slate-400">{content.auteurPoste.nom}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-slate-100">{getTypeLabel(content.type)}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{getVisibiliteLabel(content.visibiliteCible)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadge(content.statutWorkflow)}>
                        {content.statutWorkflow}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {new Date(content.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="view"
                          size="sm"
                          onClick={() => handleView(content)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                        {content.statutWorkflow === 'SOUMIS' && content.canApprove && (
                          <>
                            <div className="flex flex-col gap-1.5">
                              {/* Toggle Facebook (uniquement pour PUBLIC_SITE) */}
                              {content.visibiliteCible === 'PUBLIC_SITE' && (
                                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                  <div
                                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-200 ${facebookToggles[content.id] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                                      }`}
                                    onClick={() =>
                                      setFacebookToggles((prev) => ({
                                        ...prev,
                                        [content.id]: !prev[content.id],
                                      }))
                                    }
                                  >
                                    <span
                                      className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-200 ${facebookToggles[content.id] ? 'translate-x-3.5' : 'translate-x-0.5'
                                        }`}
                                    />
                                  </div>
                                  <Facebook className="h-3 w-3 text-blue-600" />
                                  <span className="text-[10px] text-gray-500 dark:text-slate-400">Facebook</span>
                                </label>
                              )}
                              <Button
                                variant="add"
                                size="sm"
                                onClick={async () => {
                                  const response = await fetch(
                                    `/api/admin/approbations/${content.id}/approve`,
                                    {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        publishToFacebook: !!facebookToggles[content.id],
                                      }),
                                    }
                                  );
                                  if (response.ok) {
                                    const result = await response.json();
                                    if (result.facebook && !result.facebook.success) {
                                      setSuccessModal({
                                        isOpen: true,
                                        message: `Contenu approuvé ✅ (Facebook : ${result.facebook.error || 'erreur'})`,
                                      });
                                    } else if (result.facebook?.success) {
                                      setSuccessModal({ isOpen: true, message: 'Contenu approuvé et publié sur Facebook ✅' });
                                    } else {
                                      setSuccessModal({ isOpen: true, message: 'Contenu approuvé et publié ✅' });
                                    }
                                    if (onContentDeleted) onContentDeleted();
                                  } else {
                                    const err = await response.json();
                                    setErrorModal({ isOpen: true, message: err.error || 'Erreur lors de l\'approbation' });
                                  }
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approuver
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
                              onClick={() => handleReject(content.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </>
                        )}
                        <Button
                          variant="delete"
                          size="sm"
                          onClick={() => handleDelete(content.id)}
                          disabled={deleting === content.id}
                        >
                          {deleting === content.id ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination améliorée */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/80">
            <div className="text-sm text-gray-700 dark:text-slate-300">
              Affichage de {((currentPage - 1) * 10) + 1} à {Math.min(currentPage * 10, total)} sur {total}
            </div>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                onPageChange ? (
                  <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)}>Précédent</Button>
                ) : (
                  <Link href={`/admin/approbations?page=${currentPage - 1}`}>
                    <Button variant="outline" size="sm">Précédent</Button>
                  </Link>
                )
              )}
              {/* Numéros de page */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return onPageChange ? (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="min-w-[40px]"
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  ) : (
                    <Link key={pageNum} href={`/admin/approbations?page=${pageNum}`}>
                      <Button
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className="min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              {currentPage < totalPages && (
                onPageChange ? (
                  <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)}>Suivant</Button>
                ) : (
                  <Link href={`/admin/approbations?page=${currentPage + 1}`}>
                    <Button variant="outline" size="sm">Suivant</Button>
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de détail */}
      {selectedContent && (
        <ApprobationModal
          content={selectedContent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedContent(null);
          }}
        />
      )}

      {/* Modals */}
      <ConfirmationModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, contentId: null })}
        onConfirm={confirmDelete}
        title="Supprimer le contenu"
        message="Êtes-vous sûr de vouloir supprimer ce contenu ? Cette action est irréversible."
        type="danger"
        confirmText="Supprimer"
        isLoading={deleting === deleteConfirmModal.contentId}
      />
      <InputModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, contentId: null })}
        onConfirm={confirmReject}
        title="Rejeter le contenu"
        message="Veuillez saisir la raison du rejet :"
        label="Raison du rejet"
        placeholder="Ex: Contenu inapproprié, informations incorrectes..."
        required={true}
        type="textarea"
        confirmText="Rejeter"
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => {
          setSuccessModal({ isOpen: false, message: '' });
          if (onContentDeleted) {
            onContentDeleted();
          }
        }}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
      />
    </>
  );
}

