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
      <div className="admin-page space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
        <div className="admin-glass rounded-2xl p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !affectation) {
    return (
      <div className="admin-page space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
        <div className="admin-glass rounded-2xl border border-red-200/80 bg-red-50/90 p-6 text-center dark:border-red-900/50 dark:bg-red-950/40">
          <p className="text-red-800 dark:text-red-200">{error || 'Affectation introuvable'}</p>
          <Link href="/admin/affectations" className="mt-4 inline-block">
            <Button variant="outline" className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800">
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
      <div className="admin-glass flex flex-col gap-4 rounded-2xl p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="shrink-0 border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="min-w-0">
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
              Détails de l'affectation
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Informations complètes sur cette affectation
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link href={`/admin/affectations/${affectation.id}/edit`}>
            <Button variant="edit" size="sm">
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
              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              {inactivating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-red-700 dark:border-red-400" />
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
            <Button variant="add" size="sm" onClick={handleActiver} disabled={activating}>
              {activating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
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
            <Button variant="delete" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Informations du membre */}
        <div className="admin-panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950/50">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Membre</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Nom complet</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {affectation.member.prenom} {affectation.member.nom}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
              <p className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                <Mail className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                {affectation.member.user.email}
              </p>
            </div>
            {affectation.member.telephone && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Téléphone</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{affectation.member.telephone}</p>
              </div>
            )}
            {affectation.member.ville && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ville</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{affectation.member.ville}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Rôle système</p>
              <Badge
                variant={affectation.member.user.roleSysteme === 'SUPER_ADMIN' ? 'default' : 'outline'}
                className="mt-1 border-slate-300 dark:border-slate-600"
              >
                {affectation.member.user.roleSysteme}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Statut compte</p>
              <Badge variant={affectation.member.user.isActive ? 'success' : 'destructive'} className="mt-1">
                {affectation.member.user.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informations du poste */}
        <div className="admin-panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-950/50">
              <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Poste</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Nom du poste</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{affectation.poste.nom}</p>
            </div>
            {affectation.poste.description && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Description</p>
                <p className="text-slate-900 dark:text-slate-100">{affectation.poste.description}</p>
              </div>
            )}
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bureau</p>
                <Badge variant={affectation.poste.estBureau ? 'success' : 'outline'} className="mt-1">
                  {affectation.poste.estBureau ? 'Oui' : 'Non'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Actif</p>
                <Badge variant={affectation.poste.estActif ? 'success' : 'destructive'} className="mt-1">
                  {affectation.poste.estActif ? 'Oui' : 'Non'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Informations du mandat */}
        <div className="admin-panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/50">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Mandat</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Titre</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{affectation.mandat.titre}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Période</p>
              <p className="text-slate-900 dark:text-slate-100">
                Du {new Date(affectation.mandat.dateDebut).toLocaleDateString('fr-FR')} au{' '}
                {affectation.mandat.dateFin
                  ? new Date(affectation.mandat.dateFin).toLocaleDateString('fr-FR')
                  : 'En cours'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Statut</p>
              <Badge variant={affectation.mandat.statut === 'ACTIF' ? 'success' : 'outline'} className="mt-1">
                {affectation.mandat.statut}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informations de l'affectation */}
        <div className="admin-panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950/40">
              <UserCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Affectation</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Statut</p>
              <Badge variant={affectation.statut === 'ACTIF' ? 'success' : 'destructive'} className="mt-1">
                {affectation.statut}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Date de début</p>
              <p className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                <Clock className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                {new Date(affectation.dateDebut).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            {affectation.dateFin && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Date de fin</p>
                <p className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                  <Clock className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
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
                <p className="text-sm text-slate-500 dark:text-slate-400">Raison d'inactivation</p>
                <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <p className="text-slate-900 dark:text-slate-100">{affectation.raisonInactivation}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Créée le</p>
              <p className="text-sm text-slate-900 dark:text-slate-100">
                {new Date(affectation.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Modifiée le</p>
              <p className="text-sm text-slate-900 dark:text-slate-100">
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

