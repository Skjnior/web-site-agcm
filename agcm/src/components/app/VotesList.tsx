'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Vote as VoteIcon, Plus, Edit, Trash2, X, Eye } from 'lucide-react';
import Link from 'next/link';

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

  // Debug pour diagnostic
  useEffect(() => {
    console.log('🔍 VotesList Debug:', {
      userRole,
      sessionRole,
      actualRole,
      isSuperAdmin,
      showButtons,
      sessionStatus: session ? 'loaded' : 'loading',
      sessionUser: session?.user,
    });
  }, [userRole, session, sessionRole, actualRole, isSuperAdmin, showButtons]);

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
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
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
        alert(data.error || 'Erreur lors du vote');
      }
    } catch (error) {
      alert('Erreur lors du vote');
    } finally {
      setVoting(null);
    }
  };

  // Debug immédiat pour voir les valeurs
  console.log('🔍 VotesList Render:', {
    userRole,
    userRoleType: typeof userRole,
    userRoleUpper: userRole?.toUpperCase(),
    sessionRole,
    sessionRoleType: typeof sessionRole,
    actualRole,
    isSuperAdmin,
    showButtons,
    'WILL SHOW BUTTONS': showButtons,
    'FORCE CHECK': userRole === 'SUPER_ADMIN' || sessionRole === 'SUPER_ADMIN',
  });

  return (
    <div className="space-y-4">
      {/* Bouton créer pour Super Admin */}
      {showButtons && (
        <div className="bg-white rounded-lg shadow-lg p-6 flex justify-between items-center border-2 border-guinea-red/20">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gestion des sondages</h2>
            <p className="text-sm text-gray-600 mt-1">En tant que Super Admin, vous pouvez créer, modifier et supprimer des sondages</p>
          </div>
          <Button 
            onClick={() => router.push('/app/votes/nouveau')}
            className="bg-gradient-to-r from-guinea-red to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un sondage
          </Button>
        </div>
      )}

      {votes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <VoteIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun sondage disponible</p>
          {showButtons && (
            <Button 
              variant="outline" 
              className="mt-4"
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
          <div key={vote.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2 gap-4">
                  <div className="flex items-center gap-3 flex-wrap flex-1">
                    <h3 
                      className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-guinea-red transition-colors"
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
                      className="text-gray-600 hover:text-guinea-red"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  {showButtons && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Ne pas permettre la modification si le sondage est terminé */}
                      {!isTermine && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/app/votes/${vote.id}/edit`)}
                          className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:border-blue-600"
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
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-400 hover:border-red-500"
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
                  <p className="text-gray-600 mb-3">{vote.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
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
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Résultats</span>
                  <span className="text-sm text-gray-500">{total} réponse{total > 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Oui</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vote.ouiCount} ({ouiPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${ouiPercent}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Non</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vote.nonCount} ({nonPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${nonPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                {vote.userVote !== null && (
                  <div className="mt-3 text-sm text-gray-600">
                    Votre choix : <strong>{vote.userVote ? 'Oui' : 'Non'}</strong>
                  </div>
                )}
                
                {/* Détails des réponses - Seulement pour Super Admin */}
                {isSuperAdmin && vote.detailedResponses && vote.detailedResponses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowDetailedResponses(prev => ({
                          ...prev,
                          [vote.id]: !prev[vote.id]
                        }));
                      }}
                      className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 hover:text-guinea-red transition-colors mb-2"
                    >
                      <span>Détails des réponses (Super Admin uniquement)</span>
                      <span className="text-xs text-gray-500">
                        {showDetailedResponses[vote.id] ? 'Masquer' : 'Afficher'} ({vote.detailedResponses.length})
                      </span>
                    </button>
                    {showDetailedResponses[vote.id] && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {vote.detailedResponses.map((response) => (
                          <div key={response.id} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                            <span className="text-gray-700">
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
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        className="flex-1 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                        onClick={() => handleVote(vote.id, true)}
                        disabled={voting === vote.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {voting === vote.id ? 'Envoi...' : 'Oui'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                        onClick={() => handleVote(vote.id, false)}
                        disabled={voting === vote.id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {voting === vote.id ? 'Envoi...' : 'Non'}
                      </Button>
                    </div>
                  )}

                  {!vote.isActive && !vote.hasVoted && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 text-center">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Détails du sondage</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedVote(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Titre et badges */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedVote.titre}</h3>
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
                  <p className="text-gray-700 mt-2">{selectedVote.description}</p>
                )}
              </div>

              {/* Informations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
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
                <div className="flex items-center gap-2 text-gray-600">
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
                  <div className="flex items-center gap-2 text-gray-600">
                    <VoteIcon className="h-4 w-4" />
                    <span className="text-sm">
                      <strong>Créé par :</strong> {selectedVote.createdByPoste.nom}
                    </span>
                  </div>
                )}
              </div>

              {/* Résultats */}
              {selectedVote.hasVoted && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Résultats</h4>
                    <span className="text-sm text-gray-500">
                      {selectedVote.totalVotes} réponse{selectedVote.totalVotes > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Oui</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {selectedVote.ouiCount} ({selectedVote.totalVotes > 0 ? Math.round((selectedVote.ouiCount / selectedVote.totalVotes) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${selectedVote.totalVotes > 0 ? Math.round((selectedVote.ouiCount / selectedVote.totalVotes) * 100) : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Non</span>
                        <span className="text-sm font-semibold text-gray-900">
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
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Votre choix : <strong className="text-gray-900">{selectedVote.userVote ? 'Oui' : 'Non'}</strong>
                      </p>
                    </div>
                  )}

                  {/* Détails des réponses - Seulement pour Super Admin */}
                  {isSuperAdmin && selectedVote.detailedResponses && selectedVote.detailedResponses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowDetailedResponses(prev => ({
                            ...prev,
                            [selectedVote.id]: !prev[selectedVote.id]
                          }));
                        }}
                        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 hover:text-guinea-red transition-colors mb-3"
                      >
                        <span>Détails des réponses (Super Admin uniquement)</span>
                        <span className="text-xs text-gray-500">
                          {showDetailedResponses[selectedVote.id] ? 'Masquer' : 'Afficher'} ({selectedVote.detailedResponses.length})
                        </span>
                      </button>
                      {showDetailedResponses[selectedVote.id] && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {selectedVote.detailedResponses.map((response) => (
                            <div key={response.id} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-200">
                              <span className="text-gray-700">
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
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                {selectedVote.isActive && !selectedVote.hasVoted && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 bg-green-50 hover:bg-green-100 border-green-300 text-green-700"
                      onClick={() => {
                        handleVote(selectedVote.id, true);
                        setIsModalOpen(false);
                      }}
                      disabled={voting === selectedVote.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {voting === selectedVote.id ? 'Envoi...' : 'Oui'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-red-50 hover:bg-red-100 border-red-300 text-red-700"
                      onClick={() => {
                        handleVote(selectedVote.id, false);
                        setIsModalOpen(false);
                      }}
                      disabled={voting === selectedVote.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
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
                    className="border-blue-500 text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedVote(null);
                  }}
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
        <div className="bg-white rounded-lg shadow px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <a href={`/app/votes?page=${currentPage - 1}`}>
                <Button variant="outline" size="sm">Précédent</Button>
              </a>
            )}
            {currentPage < totalPages && (
              <a href={`/app/votes?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm">Suivant</Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


