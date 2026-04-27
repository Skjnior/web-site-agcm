'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Vote as VoteIcon, Plus, Edit, Trash2, X, Eye } from 'lucide-react';
interface Vote {
  id: string;
  titre: string;
  description: string | null;
  type: 'PUBLIC' | 'PRIVE';
  dateDebut: Date;
  dateFin: Date;
  createdByPoste: {
    nom: string;
  } | null;
  ouiCount: number;
  nonCount: number;
  totalVotes: number;
  hasVoted: boolean;
  isActive: boolean;
  userVote: boolean | null;
  detailedResponses?: Array<{
    id: string;
    value: boolean;
    user: {
      id: string;
      email: string;
      member: {
        prenom: string;
        nom: string;
      } | null;
    };
  }>;
}

interface VotesListProps {
  votes: Vote[];
  currentPage: number;
  totalPages: number;
  total: number;
  userId: string;
  userRole?: string;
}

export default function VotesList({
  votes,
  currentPage,
  totalPages,
  total,
  userId,
  userRole,
}: VotesListProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [voting, setVoting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetailedResponses, setShowDetailedResponses] = useState<Record<string, boolean>>({});
  const [banner, setBanner] = useState<{ type: 'error'; message: string } | null>(null);

  // Vérifier le rôle depuis la session si userRole n'est pas fourni
  // Essayer plusieurs champs possibles (roleSysteme, role)
  const sessionRole = (session?.user as any)?.roleSysteme || (session?.user as any)?.role;
  const actualRole = userRole || sessionRole;
  
  // Vérification simple et directe pour Super Admin
  // Vérifier toutes les sources possibles
  const isSuperAdmin = 
    actualRole === 'SUPER_ADMIN' || 
    userRole === 'SUPER_ADMIN' || 
    sessionRole === 'SUPER_ADMIN' ||
    String(actualRole || '').toUpperCase() === 'SUPER_ADMIN' ||
    String(userRole || '').toUpperCase() === 'SUPER_ADMIN' ||
    String(sessionRole || '').toUpperCase() === 'SUPER_ADMIN';
  
  // Afficher les boutons si Super Admin
  const showButtons = isSuperAdmin;

  const handleDelete = async (voteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce vote ? Cette action est irréversible.')) {
      return;
    }

    setDeleting(voteId);
    try {
      const response = await fetch(`/api/super-admin/votes/${voteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
        setBanner(null);
      } else {
        const data = await response.json();
        setBanner({ type: 'error', message: data.error || 'Erreur lors de la suppression' });
      }
    } catch (error) {
      setBanner({ type: 'error', message: 'Erreur lors de la suppression' });
    } finally {
      setDeleting(null);
    }
  };

  const handleVote = async (voteId: string, value: boolean) => {
    if (!confirm(`Êtes-vous sûr de vouloir voter "${value ? 'Oui' : 'Non'}" ?`)) {
      return;
    }

    setVoting(voteId);
    try {
      const response = await fetch(`/api/app/votes/${voteId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        setBanner({ type: 'error', message: data.error || 'Erreur lors du vote' });
      }
    } catch (error) {
      setBanner({ type: 'error', message: 'Erreur lors du vote' });
    } finally {
      setVoting(null);
    }
  };

  return (
    <div className="space-y-4">
      {banner && (
        <div className="app-banner-error flex items-start justify-between gap-3">
          <p className="flex-1">{banner.message}</p>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="shrink-0 rounded p-1 text-current opacity-70 hover:opacity-100"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* Bouton créer pour Super Admin */}
      {showButtons && (
        <div className="admin-glass flex items-center justify-between rounded-lg border-2 border-guinea-red/25 p-6 shadow-none">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Gestion des sondages</h2>
            <p className="mt-1 text-sm text-slate-400">
              En tant que Super Admin, vous pouvez créer, modifier et supprimer des sondages
            </p>
          </div>
          <Button 
            onClick={() => router.push('/app/votes/nouveau')}
            className="bg-gradient-to-r from-guinea-red to-red-600 shadow-lg transition-all hover:from-red-600 hover:to-red-700 hover:shadow-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un sondage
          </Button>
        </div>
      )}

      {votes.length === 0 ? (
        <div className="admin-panel p-12 text-center shadow-none">
          <VoteIcon className="mx-auto mb-4 h-12 w-12 text-slate-500" />
          <p className="text-slate-300">Aucun sondage disponible</p>
          {showButtons && (
            <Button 
              variant="outline" 
              className="mt-4 border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
              onClick={() => router.push('/app/votes/nouveau')}
            >
              Créer le premier sondage
            </Button>
          )}
        </div>
      ) : (
        <>
      {votes.map((vote) => {
        const total = vote.ouiCount + vote.nonCount;
        const ouiPercent = total > 0 ? Math.round((vote.ouiCount / total) * 100) : 0;
        const nonPercent = total > 0 ? Math.round((vote.nonCount / total) * 100) : 0;
        
        // Vérifier si le sondage est terminé (dateFin passée)
        const now = new Date();
        const isTermine = now > vote.dateFin;

        return (
          <div key={vote.id} className="admin-panel p-6 shadow-none">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    <h3 
                      className="cursor-pointer text-xl font-semibold text-slate-100 transition-colors hover:text-guinea-red"
                      onClick={() => {
                        setSelectedVote(vote);
                        setIsModalOpen(true);
                      }}
                    >
                      {vote.titre}
                    </h3>
                    {vote.isActive ? (
                      <Badge variant="soumis">En cours</Badge>
                    ) : new Date() < vote.dateDebut ? (
                      <Badge variant="brouillon">À venir</Badge>
                    ) : (
                      <Badge variant="archive">Terminé</Badge>
                    )}
                    <Badge variant={vote.type === 'PUBLIC' ? 'default' : 'outline'}>
                      {vote.type === 'PUBLIC' ? 'Public' : 'Privé'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedVote(vote);
                        setIsModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-guinea-red"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  {showButtons && (
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {/* Ne pas permettre la modification si le sondage est terminé */}
                      {!isTermine && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/app/votes/${vote.id}/edit`)}
                          className="border-blue-700/60 bg-slate-950 text-blue-200 hover:border-blue-500 hover:bg-slate-900"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(vote.id)}
                        disabled={deleting === vote.id}
                        className="border-red-800/70 bg-red-950/30 text-red-200 hover:border-red-600 hover:bg-red-950/50"
                      >
                        {deleting === vote.id ? (
                          <span className="animate-spin">⏳</span>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                {vote.description && (
                  <p className="mb-3 text-slate-400">{vote.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      Du {new Date(vote.dateDebut).toLocaleDateString('fr-FR')} au{' '}
                      {new Date(vote.dateFin).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {vote.createdByPoste && <span>Par {vote.createdByPoste.nom}</span>}
                </div>
              </div>
            </div>

            {/* Résultats */}
            {vote.hasVoted && (
              <div className="mb-4 rounded-lg border border-slate-700/80 bg-slate-950/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">Résultats</span>
                  <span className="text-sm text-slate-500">{total} réponse{total > 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-slate-400">Oui</span>
                      <span className="text-sm font-medium text-slate-100">
                        {vote.ouiCount} ({ouiPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-emerald-600 transition-all"
                        style={{ width: `${ouiPercent}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-slate-400">Non</span>
                      <span className="text-sm font-medium text-slate-100">
                        {vote.nonCount} ({nonPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-red-600 transition-all"
                        style={{ width: `${nonPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                {vote.userVote !== null && (
                  <div className="mt-3 text-sm text-slate-400">
                    Votre choix : <strong className="text-slate-100">{vote.userVote ? 'Oui' : 'Non'}</strong>
                  </div>
                )}
                
                {/* Détails des réponses - Seulement pour Super Admin */}
                {isSuperAdmin && vote.detailedResponses && vote.detailedResponses.length > 0 && (
                  <div className="mt-4 border-t border-slate-700 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailedResponses(prev => ({
                          ...prev,
                          [vote.id]: !prev[vote.id]
                        }));
                      }}
                      className="mb-2 flex w-full items-center justify-between text-sm font-semibold text-slate-200 transition-colors hover:text-guinea-red"
                    >
                      <span>Détails des réponses (Super Admin uniquement)</span>
                      <span className="text-xs text-slate-500">
                        {showDetailedResponses[vote.id] ? 'Masquer' : 'Afficher'} ({vote.detailedResponses.length})
                      </span>
                    </button>
                    {showDetailedResponses[vote.id] && (
                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {vote.detailedResponses.map((response) => (
                          <div
                            key={response.id}
                            className="admin-panel flex items-center justify-between rounded p-2 text-xs shadow-none"
                          >
                            <span className="text-slate-300">
                              {response.user.member 
                                ? `${response.user.member.prenom} ${response.user.member.nom}`
                                : response.user.email}
                            </span>
                            <Badge variant={response.value ? 'default' : 'destructive'} className="text-xs">
                              {response.value ? 'Oui' : 'Non'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
                  {vote.isActive && !vote.hasVoted && (
                    <div className="flex items-center gap-3 border-t border-slate-700 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1 border-emerald-800/70 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-950/60"
                        onClick={() => handleVote(vote.id, true)}
                        disabled={voting === vote.id}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {voting === vote.id ? 'Envoi...' : 'Oui'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-800/70 bg-red-950/40 text-red-200 hover:bg-red-950/60"
                        onClick={() => handleVote(vote.id, false)}
                        disabled={voting === vote.id}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {voting === vote.id ? 'Envoi...' : 'Non'}
                      </Button>
                    </div>
                  )}

                  {!vote.isActive && !vote.hasVoted && (
                    <div className="border-t border-slate-700 pt-4">
                      <p className="text-center text-sm text-slate-500">
                        {new Date() < vote.dateDebut 
                          ? 'Ce sondage n\'est pas encore ouvert'
                          : 'Ce sondage n\'est plus actif'}
                      </p>
                    </div>
                  )}
          </div>
        );
      })}
        </>
      )}

      {/* Modal de détails du sondage */}
      {isModalOpen && selectedVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="admin-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-700 bg-slate-900/95 px-6 py-4 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-slate-100">Détails du sondage</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedVote(null);
                }}
                className="text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-6 p-6">
              {/* Titre et badges */}
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-slate-100">{selectedVote.titre}</h3>
                  {selectedVote.isActive ? (
                    <Badge variant="soumis">En cours</Badge>
                  ) : new Date() < selectedVote.dateDebut ? (
                    <Badge variant="brouillon">À venir</Badge>
                  ) : (
                    <Badge variant="archive">Terminé</Badge>
                  )}
                  <Badge variant={selectedVote.type === 'PUBLIC' ? 'default' : 'outline'}>
                    {selectedVote.type === 'PUBLIC' ? 'Public' : 'Privé'}
                  </Badge>
                </div>
                {selectedVote.description && (
                  <p className="mt-2 text-slate-400">{selectedVote.description}</p>
                )}
              </div>

              {/* Informations */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    <strong>Date de début :</strong> {new Date(selectedVote.dateDebut).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    <strong>Date de fin :</strong> {new Date(selectedVote.dateFin).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {selectedVote.createdByPoste && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <VoteIcon className="h-4 w-4" />
                    <span className="text-sm">
                      <strong>Créé par :</strong> {selectedVote.createdByPoste.nom}
                    </span>
                  </div>
                )}
              </div>

              {/* Résultats */}
              {selectedVote.hasVoted && (
                <div className="space-y-4 rounded-lg border border-slate-700/80 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-100">Résultats</h4>
                    <span className="text-sm text-slate-500">
                      {selectedVote.totalVotes} réponse{selectedVote.totalVotes > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300">Oui</span>
                        <span className="text-sm font-semibold text-slate-100">
                          {selectedVote.ouiCount} ({selectedVote.totalVotes > 0 ? Math.round((selectedVote.ouiCount / selectedVote.totalVotes) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-emerald-600 transition-all"
                          style={{ 
                            width: `${selectedVote.totalVotes > 0 ? Math.round((selectedVote.ouiCount / selectedVote.totalVotes) * 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300">Non</span>
                        <span className="text-sm font-semibold text-slate-100">
                          {selectedVote.nonCount} ({selectedVote.totalVotes > 0 ? Math.round((selectedVote.nonCount / selectedVote.totalVotes) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${selectedVote.totalVotes > 0 ? Math.round((selectedVote.nonCount / selectedVote.totalVotes) * 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {selectedVote.userVote !== null && (
                    <div className="mt-3 border-t border-slate-700 pt-3">
                      <p className="text-sm text-slate-400">
                        Votre choix :{' '}
                        <strong className="text-slate-100">{selectedVote.userVote ? 'Oui' : 'Non'}</strong>
                      </p>
                    </div>
                  )}

                  {/* Détails des réponses - Seulement pour Super Admin */}
                  {isSuperAdmin && selectedVote.detailedResponses && selectedVote.detailedResponses.length > 0 && (
                    <div className="mt-4 border-t border-slate-700 pt-4">
                      <button
                        onClick={() => {
                          setShowDetailedResponses(prev => ({
                            ...prev,
                            [selectedVote.id]: !prev[selectedVote.id]
                          }));
                        }}
                        className="mb-3 flex w-full items-center justify-between text-sm font-semibold text-slate-200 transition-colors hover:text-guinea-red"
                      >
                        <span>Détails des réponses (Super Admin uniquement)</span>
                        <span className="text-xs text-slate-500">
                          {showDetailedResponses[selectedVote.id] ? 'Masquer' : 'Afficher'} ({selectedVote.detailedResponses.length})
                        </span>
                      </button>
                      {showDetailedResponses[selectedVote.id] && (
                        <div className="max-h-60 space-y-2 overflow-y-auto">
                          {selectedVote.detailedResponses.map((response) => (
                            <div
                              key={response.id}
                              className="admin-panel flex items-center justify-between rounded p-2 text-sm shadow-none"
                            >
                              <span className="text-slate-300">
                                {response.user.member 
                                  ? `${response.user.member.prenom} ${response.user.member.nom}`
                                  : response.user.email}
                              </span>
                              <Badge variant={response.value ? 'default' : 'destructive'} className="text-xs">
                                {response.value ? 'Oui' : 'Non'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-700 pt-4">
                {selectedVote.isActive && !selectedVote.hasVoted && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 border-emerald-800/70 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-950/60"
                      onClick={() => {
                        handleVote(selectedVote.id, true);
                        setIsModalOpen(false);
                      }}
                      disabled={voting === selectedVote.id}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {voting === selectedVote.id ? 'Envoi...' : 'Oui'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-800/70 bg-red-950/40 text-red-200 hover:bg-red-950/60"
                      onClick={() => {
                        handleVote(selectedVote.id, false);
                        setIsModalOpen(false);
                      }}
                      disabled={voting === selectedVote.id}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {voting === selectedVote.id ? 'Envoi...' : 'Non'}
                    </Button>
                  </>
                )}
                {showButtons && !(new Date() > selectedVote.dateFin) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsModalOpen(false);
                      router.push(`/app/votes/${selectedVote.id}/edit`);
                    }}
                    className="border-blue-700/60 bg-slate-950 text-blue-200 hover:bg-slate-900"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedVote(null);
                  }}
                  className="border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-panel flex items-center justify-between px-6 py-4 shadow-none">
          <div className="text-sm text-slate-300">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a href={`/app/votes?page=${currentPage - 1}`}>
                <Button variant="outline" size="sm" className="border-slate-600 bg-slate-950 text-slate-200 hover:bg-slate-900">
                  Précédent
                </Button>
              </a>
            )}
            {currentPage < totalPages && (
              <a href={`/app/votes?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm" className="border-slate-600 bg-slate-950 text-slate-200 hover:bg-slate-900">
                  Suivant
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


