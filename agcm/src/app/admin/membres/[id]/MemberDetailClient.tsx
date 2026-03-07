'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Shield, Edit, Trash2, Loader2 } from 'lucide-react';
import { formatRole } from '@/lib/role-utils';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import InputModal from '@/components/ui/InputModal';

interface MemberDetailClientProps {
  member: {
    id: string;
    prenom: string;
    nom: string;
    telephone: string | null;
    ville: string | null;
    pays: string | null;
    bio: string | null;
    statutMembre: string;
    dateAdhesion: Date | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      email: string;
      roleSysteme: string;
      isActive: boolean;
      lastLogin: Date | null;
      createdAt: Date;
    };
    affectations?: Array<{
      id: string;
      poste: {
        id: string;
        nom: string;
        description: string | null;
        estBureau: boolean;
      };
      mandat: {
        id: string;
        titre: string;
        dateDebut: Date;
        dateFin: Date;
        statut: string;
      };
    }>;
  };
  currentUserRole: string;
  currentUserId: string;
  canAct: boolean;
}

function formatDate(date: Date | null) {
  if (!date) return 'Non définie';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export default function MemberDetailClient({
  member: initialMember,
  currentUserRole,
  currentUserId,
  canAct,
}: MemberDetailClientProps) {
  const router = useRouter();
  const [member, setMember] = useState(initialMember);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [suspendModal, setSuspendModal] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      ACTIF: 'Actif',
      SUSPENDU: 'Suspendu',
      RADIE: 'Radié',
    };
    return labels[statut] || statut;
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/membres/${member.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      setDeleteModal(false);
      setSuccessModal({ isOpen: true, message: 'Membre supprimé avec succès' });
      setTimeout(() => {
        router.push('/admin/membres');
      }, 1500);
    } catch (error: any) {
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors de la suppression' });
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (reason: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/membres/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statutMembre: 'SUSPENDU' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suspension');
      }

      const result = await response.json();
      setMember(result.member);
      setSuspendModal(false);
      setSuccessModal({ isOpen: true, message: 'Membre suspendu avec succès' });
    } catch (error: any) {
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors de la suspension' });
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/membres/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statutMembre: 'ACTIF' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la réactivation');
      }

      const result = await response.json();
      setMember(result.member);
      setSuccessModal({ isOpen: true, message: 'Membre réactivé avec succès' });
    } catch (error: any) {
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors de la réactivation' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/membres">
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {member.prenom} {member.nom}
            </h1>
            <p className="text-gray-600 mt-1">Détails et informations du membre</p>
          </div>
          {canAct && (
            <div className="flex items-center gap-2">
              {member.statutMembre === 'SUSPENDU' ? (
                <Button
                  variant="add"
                  size="sm"
                  onClick={handleReactivate}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Réactiver
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSuspendModal(true)}
                  disabled={loading || member.statutMembre === 'RADIE'}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
                >
                  Suspendre
                </Button>
              )}
              <Button
                variant="edit"
                size="sm"
                onClick={() => router.push(`/admin/membres/${member.id}/edit`)}
                disabled={loading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button
                variant="delete"
                size="sm"
                onClick={() => setDeleteModal(true)}
                disabled={loading || member.user.id === currentUserId}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Prénom</label>
                    <p className="text-gray-900">{member.prenom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom</label>
                    <p className="text-gray-900">{member.nom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <p className="text-gray-900">{member.user.email}</p>
                  </div>
                  {member.telephone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone
                      </label>
                      <p className="text-gray-900">{member.telephone}</p>
                    </div>
                  )}
                  {member.ville && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Ville
                      </label>
                      <p className="text-gray-900">{member.ville}</p>
                    </div>
                  )}
                  {member.pays && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Pays</label>
                      <p className="text-gray-900">{member.pays}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date d'adhésion
                    </label>
                    <p className="text-gray-900">{formatDate(member.dateAdhesion)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Statut</label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          member.statutMembre === 'ACTIF' ? 'approuve' :
                          member.statutMembre === 'SUSPENDU' ? 'rejete' :
                          'soumis'
                        }
                      >
                        {getStatutLabel(member.statutMembre)}
                      </Badge>
                    </div>
                  </div>
                </div>
                {member.bio && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Biographie</label>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{member.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Affectations */}
            {member.affectations && member.affectations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Postes et mandats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {member.affectations.map((affectation) => (
                      <div
                        key={affectation.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">
                            {affectation.poste.nom}
                          </h4>
                          <Badge
                            variant={affectation.poste.estBureau ? 'approuve' : 'soumis'}
                          >
                            {affectation.poste.estBureau ? 'Bureau exécutif' : 'Autre'}
                          </Badge>
                        </div>
                        {affectation.poste.description && (
                          <p className="text-sm text-gray-600">{affectation.poste.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            <strong>Mandat:</strong> {affectation.mandat.titre}
                          </span>
                          <span>
                            <strong>Période:</strong>{' '}
                            {formatDate(affectation.mandat.dateDebut)} - {formatDate(affectation.mandat.dateFin)}
                          </span>
                        </div>
                        <div>
                          <Badge
                            variant={
                              affectation.mandat.statut === 'ACTIF' ? 'approuve' :
                              affectation.mandat.statut === 'EXPIRE' ? 'rejete' :
                              'soumis'
                            }
                          >
                            {affectation.mandat.statut}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compte utilisateur */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compte utilisateur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Rôle système</label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        member.user.roleSysteme === 'SUPER_ADMIN' ? 'approuve' :
                        member.user.roleSysteme === 'ADMIN' ? 'approuve' :
                        'soumis'
                      }
                    >
                      {formatRole(member.user.roleSysteme)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Statut du compte</label>
                  <div className="mt-1">
                    <Badge
                      variant={member.user.isActive ? 'approuve' : 'rejete'}
                    >
                      {member.user.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date de création</label>
                  <p className="text-gray-900 text-sm">{formatDate(member.user.createdAt)}</p>
                </div>
                {member.user.lastLogin && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dernière connexion</label>
                    <p className="text-gray-900 text-sm">
                      {new Intl.DateTimeFormat('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(member.user.lastLogin))}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations système */}
            <Card>
              <CardHeader>
                <CardTitle>Informations système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Membre</span>
                  <span className="text-gray-900 font-mono">{member.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ID Utilisateur</span>
                  <span className="text-gray-900 font-mono">{member.user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Créé le</span>
                  <span className="text-gray-900">{formatDate(member.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Modifié le</span>
                  <span className="text-gray-900">{formatDate(member.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        message="Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible et supprimera également le compte utilisateur associé."
        type="danger"
        confirmText="Supprimer"
        isLoading={loading}
      />
      <InputModal
        isOpen={suspendModal}
        onClose={() => setSuspendModal(false)}
        onConfirm={handleSuspend}
        title="Suspendre le membre"
        message="Veuillez saisir la raison de la suspension :"
        label="Raison de la suspension"
        placeholder="Ex: Non-paiement de cotisation, comportement inapproprié..."
        required={true}
        type="textarea"
        confirmText="Suspendre"
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => {
          setSuccessModal({ isOpen: false, message: '' });
          if (successModal.message.includes('supprimé')) {
            router.push('/admin/membres');
          } else {
            router.refresh();
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

