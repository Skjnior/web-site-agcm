'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserCheck, Calendar, Briefcase, User, Mail, Clock, Edit, Trash2, CheckCircle, X } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import InputModal from '@/components/ui/InputModal';
import Link from 'next/link';

interface AffectationDetails {
  id: string;
  dateDebut: string;
  dateFin: string | null;
  statut: string;
  raisonInactivation: string | null;
  createdAt: string;
  updatedAt: string;
  mandat: {
    id: string;
    titre: string;
    dateDebut: string;
    dateFin: string | null;
    statut: string;
  };
  poste: {
    id: string;
    nom: string;
    description: string | null;
    estBureau: boolean;
    estActif: boolean;
  };
  member: {
    id: string;
    prenom: string;
    nom: string;
    telephone: string | null;
    ville: string | null;
    user: {
      id: string;
      email: string;
      roleSysteme: string;
      isActive: boolean;
    };
  };
}

export default function AffectationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [affectation, setAffectation] = useState<AffectationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [inactivating, setInactivating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [inactivateModal, setInactivateModal] = useState<{ isOpen: boolean; raison: string }>({ isOpen: false, raison: '' });
  const [activateConfirmModal, setActivateConfirmModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  useEffect(() => {
    fetchAffectation();
  }, [id]);

  const handleInactiver = () => {
    setInactivateModal({ isOpen: true, raison: '' });
  };

  const handleInactivateInput = (raison: string) => {
    if (!raison || raison.trim() === '') {
      setErrorModal({ isOpen: true, message: 'La raison est obligatoire' });
      setInactivateModal({ isOpen: false, raison: '' });
      return;
    }
    setInactivateModal({ isOpen: false, raison });
    // Ouvrir la confirmation avec la raison
    setActivateConfirmModal(false);
    confirmInactivate(raison);
  };

  const confirmInactivate = async (raison: string) => {
    try {
      setInactivating(true);
      const response = await fetch(`/api/super-admin/affectations/${id}/inactiver`, {
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

      // Recharger les données
      await fetchAffectation();
      setSuccessModal({ isOpen: true, message: 'Affectation inactivée avec succès' });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inactivation');
      setErrorModal({ isOpen: true, message: err.message || 'Erreur lors de l\'inactivation' });
    } finally {
      setInactivating(false);
    }
  };

  const handleActiver = () => {
    setActivateConfirmModal(true);
  };

  const confirmActivate = async () => {
    setActivateConfirmModal(false);
    try {
      setActivating(true);
      const response = await fetch(`/api/super-admin/affectations/${id}/activer`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'activation');
      }

      // Recharger les données
      await fetchAffectation();
      setSuccessModal({ isOpen: true, message: 'Affectation activée avec succès' });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'activation');
      setErrorModal({ isOpen: true, message: err.message || 'Erreur lors de l\'activation' });
    } finally {
      setActivating(false);
    }
  };

  const handleDelete = () => {
    if (!affectation) return;

    // Vérifier si l'affectation est passée
    const isPassee = affectation.dateFin && new Date(affectation.dateFin) < new Date();
    if (isPassee) {
      setErrorModal({ isOpen: true, message: 'Impossible de supprimer une affectation passée. Seules les affectations présentes ou futures peuvent être supprimées.' });
      return;
    }

    setDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    setDeleteConfirmModal(false);
    try {
      setDeleting(true);
      const response = await fetch(`/api/super-admin/affectations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      // Rediriger vers la liste
      router.push('/admin/affectations');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      setErrorModal({ isOpen: true, message: err.message || 'Erreur lors de la suppression' });
    } finally {
      setDeleting(false);
    }
  };

  const fetchAffectation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/super-admin/affectations/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Affectation introuvable');
        } else {
          setError('Erreur lors du chargement');
        }
        return;
      }

      const data = await response.json();
      setAffectation(data.affectation);
    } catch (err) {
      setError('Erreur lors du chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guinea-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !affectation) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error || 'Affectation introuvable'}</p>
          <Link href="/admin/affectations" className="mt-4 inline-block">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Détails de l'affectation</h1>
          <p className="text-gray-600 mt-1">Informations complètes sur cette affectation</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/affectations/${affectation.id}/edit`}>
            <Button variant="outline" size="sm" className="border-blue-500 text-blue-700 hover:bg-blue-50">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
          {affectation.statut === 'ACTIF' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInactiver}
              disabled={inactivating}
              className="border-red-500 text-red-700 hover:bg-red-50"
            >
              {inactivating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                  Inactivation...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Inactiver
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleActiver}
              disabled={activating}
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              {activating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2"></div>
                  Activation...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activer
                </>
              )}
            </Button>
          )}
          {affectation.dateFin && new Date(affectation.dateFin) >= new Date() && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="border-red-500 text-red-700 hover:bg-red-50"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations du membre */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Membre</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="text-gray-900 font-medium">
                {affectation.member.prenom} {affectation.member.nom}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900 font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {affectation.member.user.email}
              </p>
            </div>
            {affectation.member.telephone && (
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="text-gray-900 font-medium">{affectation.member.telephone}</p>
              </div>
            )}
            {affectation.member.ville && (
              <div>
                <p className="text-sm text-gray-500">Ville</p>
                <p className="text-gray-900 font-medium">{affectation.member.ville}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Rôle système</p>
              <Badge variant={affectation.member.user.roleSysteme === 'SUPER_ADMIN' ? 'default' : 'outline'}>
                {affectation.member.user.roleSysteme}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut compte</p>
              <Badge variant={affectation.member.user.isActive ? 'success' : 'destructive'}>
                {affectation.member.user.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informations du poste */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Briefcase className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Poste</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nom du poste</p>
              <p className="text-gray-900 font-medium">{affectation.poste.nom}</p>
            </div>
            {affectation.poste.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-900">{affectation.poste.description}</p>
              </div>
            )}
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-gray-500">Bureau</p>
                <Badge variant={affectation.poste.estBureau ? 'success' : 'outline'}>
                  {affectation.poste.estBureau ? 'Oui' : 'Non'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Actif</p>
                <Badge variant={affectation.poste.estActif ? 'success' : 'destructive'}>
                  {affectation.poste.estActif ? 'Oui' : 'Non'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Informations du mandat */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Mandat</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Titre</p>
              <p className="text-gray-900 font-medium">{affectation.mandat.titre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Période</p>
              <p className="text-gray-900">
                Du {new Date(affectation.mandat.dateDebut).toLocaleDateString('fr-FR')} au{' '}
                {affectation.mandat.dateFin
                  ? new Date(affectation.mandat.dateFin).toLocaleDateString('fr-FR')
                  : 'En cours'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <Badge variant={affectation.mandat.statut === 'ACTIF' ? 'success' : 'outline'}>
                {affectation.mandat.statut}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informations de l'affectation */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Affectation</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <Badge variant={affectation.statut === 'ACTIF' ? 'success' : 'destructive'}>
                {affectation.statut}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de début</p>
              <p className="text-gray-900 font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {new Date(affectation.dateDebut).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            {affectation.dateFin && (
              <div>
                <p className="text-sm text-gray-500">Date de fin</p>
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {new Date(affectation.dateFin).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
            {affectation.raisonInactivation && (
              <div>
                <p className="text-sm text-gray-500">Raison d'inactivation</p>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{affectation.raisonInactivation}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Créée le</p>
              <p className="text-gray-900 text-sm">
                {new Date(affectation.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Modifiée le</p>
              <p className="text-gray-900 text-sm">
                {new Date(affectation.updatedAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InputModal
        isOpen={inactivateModal.isOpen}
        onClose={() => setInactivateModal({ isOpen: false, raison: '' })}
        onConfirm={handleInactivateInput}
        title="Inactiver l'affectation"
        message="Veuillez saisir la raison de l'inactivation :"
        label="Raison d'inactivation"
        placeholder="Ex: Fin de mandat, démission, révocation..."
        required={true}
        type="textarea"
        confirmText="Continuer"
      />
      <ConfirmationModal
        isOpen={activateConfirmModal}
        onClose={() => setActivateConfirmModal(false)}
        onConfirm={confirmActivate}
        title="Activer l'affectation"
        message="Êtes-vous sûr de vouloir activer cette affectation ?"
        type="info"
        confirmText="Activer"
        isLoading={activating}
      />
      <ConfirmationModal
        isOpen={deleteConfirmModal}
        onClose={() => setDeleteConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer l'affectation"
        message="Êtes-vous sûr de vouloir supprimer cette affectation ? Cette action est irréversible."
        type="danger"
        confirmText="Supprimer"
        isLoading={deleting}
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

