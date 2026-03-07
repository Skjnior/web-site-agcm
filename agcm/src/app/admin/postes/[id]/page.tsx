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
      <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error}</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
        </div>
      </div>
    );
  }

  if (!poste) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Poste introuvable.</p>
          <Button onClick={() => router.back()} className="mt-4">
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
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{poste.nom}</h1>
          <p className="text-gray-600 mt-1">Détails du poste</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/postes/${poste.id}/edit`}>
            <Button variant="edit" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
          <Button
            variant="delete"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClasses('', poste.estActif)}`}>
              {poste.estActif ? 'Actif' : 'Inactif'}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getPosteTypeBadgeClasses(poste.estBureau)}`}>
              {poste.estBureau ? 'Bureau exécutif' : 'Autre'}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Affectations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{poste._count.affectations}</p>
            <p className="text-xs text-gray-500 mt-1">
              {affectationsActives.length} active{affectationsActives.length > 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contenus créés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{poste._count.authoredContents}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Description</label>
            <p className="mt-1 text-gray-900">{poste.description || 'Aucune description'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date de création
              </label>
              <p className="mt-1 text-gray-900">{formatDateTime(poste.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dernière modification
              </label>
              <p className="mt-1 text-gray-900">{formatDateTime(poste.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {affectationsActives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Affectations actives ({affectationsActives.length})
            </CardTitle>
            <CardDescription>
              Membres actuellement affectés à ce poste
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {affectationsActives.map((affectation) => (
                <Card key={affectation.id} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {affectation.member.prenom} {affectation.member.nom}
                    </CardTitle>
                    <CardDescription>
                      <Link
                        href={`/admin/mandats/${affectation.mandat.id}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Building2 className="h-3 w-3" />
                        {affectation.mandat.titre}
                      </Link>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span>{affectation.member.user.email}</span>
                    </div>
                    {affectation.member.telephone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{affectation.member.telephone}</span>
                      </div>
                    )}
                    {affectation.member.ville && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{affectation.member.ville}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Mandat :</span>
                        <span className="font-medium">
                          {formatDate(affectation.mandat.dateDebut)} - {formatDate(affectation.mandat.dateFin)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-gray-500">Affectation :</span>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Affectations inactives ({affectationsInactives.length})
            </CardTitle>
            <CardDescription>
              Historique des affectations terminées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {affectationsInactives.map((affectation) => (
                <Card key={affectation.id} className="border-l-4 border-l-gray-300 opacity-75">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {affectation.member.prenom} {affectation.member.nom}
                    </CardTitle>
                    <CardDescription>
                      <Link
                        href={`/admin/mandats/${affectation.mandat.id}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Building2 className="h-3 w-3" />
                        {affectation.mandat.titre}
                      </Link>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span>{affectation.member.user.email}</span>
                    </div>
                    {affectation.member.telephone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{affectation.member.telephone}</span>
                      </div>
                    )}
                    {affectation.member.ville && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{affectation.member.ville}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Mandat :</span>
                        <span className="font-medium">
                          {formatDate(affectation.mandat.dateDebut)} - {formatDate(affectation.mandat.dateFin)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-gray-500">Affectation :</span>
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
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune affectation pour ce poste</p>
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

