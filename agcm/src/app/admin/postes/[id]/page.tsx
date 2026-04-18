'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Briefcase, Users, FileText, Calendar, User, Mail, Phone, MapPin, Building2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getStatusBadgeClasses, getRoleBadgeClasses, getPosteTypeBadgeClasses } from '@/lib/ui-utils';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import { cn } from '@/lib/utils';

interface Affectation {
  id: string;
  dateDebut: string;
  dateFin: string | null;
  statut: string;
  mandat: {
    id: string;
    titre: string;
    dateDebut: string;
    dateFin: string;
    statut: string;
  };
  member: {
    id: string;
    prenom: string;
    nom: string;
    telephone: string | null;
    ville: string | null;
    user: {
      email: string;
      roleSysteme: string;
      isActive: boolean;
    };
  };
}

interface Poste {
  id: string;
  nom: string;
  description: string | null;
  estBureau: boolean;
  estActif: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    affectations: number;
    authoredContents: number;
  };
  affectations: Affectation[];
}

export default function SuperAdminPosteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const posteId = params.id as string;

  const [poste, setPoste] = useState<Poste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  useEffect(() => {
    fetchPoste();
  }, [posteId]);

  const fetchPoste = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/super-admin/postes/${posteId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Poste introuvable');
        } else {
          setError('Erreur lors du chargement');
        }
        return;
      }

      const result = await response.json();
      setPoste(result.poste);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
        <div className="admin-glass rounded-2xl p-12 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
        <div className="admin-glass rounded-2xl border border-red-200/80 bg-red-50/90 p-6 text-center dark:border-red-900/50 dark:bg-red-950/40">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4 border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
        </div>
      </div>
    );
  }

  if (!poste) {
    return (
      <div className="admin-page space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
        <div className="admin-glass rounded-2xl border border-amber-200/80 bg-amber-50/90 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-amber-900 dark:text-amber-200">Poste introuvable.</p>
          <Button onClick={() => router.back()} variant="outline" className="mt-4 border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  const handleDelete = () => {
    setDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!poste) return;
    
    setDeleteConfirmModal(false);
    try {
      setDeleting(true);
      const response = await fetch(`/api/super-admin/postes/${posteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      // Rediriger vers la liste des postes après suppression
      router.push('/admin/postes');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
      setErrorModal({ isOpen: true, message: err.message || 'Erreur lors de la suppression' });
      setDeleting(false);
    }
  };

  const affectationsActives = poste.affectations.filter(a => a.statut === 'ACTIF');
  const affectationsInactives = poste.affectations.filter(a => a.statut === 'INACTIF');

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
              {poste.nom}
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Détails du poste</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link href={`/admin/postes/${poste.id}/edit`}>
            <Button variant="edit" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={cn('admin-panel border-0 shadow-sm')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClasses('', poste.estActif)}`}>
              {poste.estActif ? 'Actif' : 'Inactif'}
            </span>
          </CardContent>
        </Card>

        <Card className={cn('admin-panel border-0 shadow-sm')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getPosteTypeBadgeClasses(poste.estBureau)}`}>
              {poste.estBureau ? 'Bureau exécutif' : 'Autre'}
            </span>
          </CardContent>
        </Card>

        <Card className={cn('admin-panel border-0 shadow-sm')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              <Users className="h-4 w-4" />
              Affectations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{poste._count.affectations}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {affectationsActives.length} active{affectationsActives.length > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className={cn('admin-panel border-0 shadow-sm')}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              <FileText className="h-4 w-4" />
              Contenus créés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{poste._count.authoredContents}</p>
          </CardContent>
        </Card>
      </div>

      <Card className={cn('admin-panel border-0 shadow-sm')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Briefcase className="h-5 w-5" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</label>
            <p className="mt-1 text-slate-900 dark:text-slate-100">{poste.description || 'Aucune description'}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2 dark:border-slate-700">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                Date de création
              </label>
              <p className="mt-1 text-slate-900 dark:text-slate-100">{formatDateTime(poste.createdAt)}</p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                Dernière modification
              </label>
              <p className="mt-1 text-slate-900 dark:text-slate-100">{formatDateTime(poste.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {affectationsActives.length > 0 && (
        <Card className={cn('admin-panel border-0 shadow-sm')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Users className="h-5 w-5" />
              Affectations actives ({affectationsActives.length})
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Membres actuellement affectés à ce poste
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {affectationsActives.map((affectation) => (
                <Card
                  key={affectation.id}
                  className="border-l-4 border-l-emerald-500 bg-slate-50/50 shadow-sm dark:border-l-emerald-600 dark:bg-slate-800/30"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
                      <User className="h-4 w-4" />
                      {affectation.member.prenom} {affectation.member.nom}
                    </CardTitle>
                    <CardDescription>
                      <Link
                        href={`/admin/mandats/${affectation.mandat.id}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <Building2 className="h-3 w-3" />
                        {affectation.mandat.titre}
                      </Link>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="h-3 w-3" />
                      <span>{affectation.member.user.email}</span>
                    </div>
                    {affectation.member.telephone && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="h-3 w-3" />
                        <span>{affectation.member.telephone}</span>
                      </div>
                    )}
                    {affectation.member.ville && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span>{affectation.member.ville}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 dark:border-slate-600">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Mandat :</span>
                        <span className="font-medium">
                          {formatDate(affectation.mandat.dateDebut)} - {formatDate(affectation.mandat.dateFin)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-slate-500 dark:text-slate-400">Affectation :</span>
                        <span className="font-medium">
                          {formatDate(affectation.dateDebut)}
                          {affectation.dateFin ? ` - ${formatDate(affectation.dateFin)}` : ' (en cours)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getRoleBadgeClasses(affectation.member.user.roleSysteme)}`}>
                          {affectation.member.user.roleSysteme}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClasses('', affectation.member.user.isActive)}`}>
                          {affectation.member.user.isActive ? 'Actif' : 'Inactif'}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClasses(affectation.mandat.statut)}`}>
                          {affectation.mandat.statut}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {affectationsInactives.length > 0 && (
        <Card className={cn('admin-panel border-0 shadow-sm')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Users className="h-5 w-5" />
              Affectations inactives ({affectationsInactives.length})
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              Historique des affectations terminées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {affectationsInactives.map((affectation) => (
                <Card
                  key={affectation.id}
                  className="border-l-4 border-l-slate-300 bg-slate-50/40 opacity-90 shadow-sm dark:border-l-slate-600 dark:bg-slate-800/25"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-slate-100">
                      <User className="h-4 w-4" />
                      {affectation.member.prenom} {affectation.member.nom}
                    </CardTitle>
                    <CardDescription>
                      <Link
                        href={`/admin/mandats/${affectation.mandat.id}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <Building2 className="h-3 w-3" />
                        {affectation.mandat.titre}
                      </Link>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="h-3 w-3" />
                      <span>{affectation.member.user.email}</span>
                    </div>
                    {affectation.member.telephone && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="h-3 w-3" />
                        <span>{affectation.member.telephone}</span>
                      </div>
                    )}
                    {affectation.member.ville && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <MapPin className="h-3 w-3" />
                        <span>{affectation.member.ville}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 dark:border-slate-600">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Mandat :</span>
                        <span className="font-medium">
                          {formatDate(affectation.mandat.dateDebut)} - {formatDate(affectation.mandat.dateFin)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-slate-500 dark:text-slate-400">Affectation :</span>
                        <span className="font-medium">
                          {formatDate(affectation.dateDebut)}
                          {affectation.dateFin ? ` - ${formatDate(affectation.dateFin)}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClasses('INACTIF')}`}>
                          INACTIF
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {poste.affectations.length === 0 && (
        <Card className={cn('admin-panel border-0 shadow-sm')}>
          <CardContent className="py-8 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-slate-400 dark:text-slate-500" />
            <p className="text-slate-600 dark:text-slate-400">Aucune affectation pour ce poste</p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <ConfirmationModal
        isOpen={deleteConfirmModal}
        onClose={() => setDeleteConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Supprimer le poste"
        message={`Êtes-vous sûr de vouloir supprimer le poste "${poste?.nom}" ?\n\nCette action va :\n- Mettre toutes les affectations actives en INACTIF\n- Archiver les contenus créés par ce poste\n- Les membres conserveront leur compte mais sans poste\n\nCette action est irréversible.`}
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

