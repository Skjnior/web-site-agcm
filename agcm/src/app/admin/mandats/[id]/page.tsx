'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, FileText, Edit, Trash2, Users, FileCheck, FolderKanban, CalendarDays, Briefcase, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Affectation {
  id: string;
  dateDebut: string;
  dateFin: string | null;
  statut: string;
  raisonInactivation: string | null;
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
  poste: {
    id: string;
    nom: string;
    description: string | null;
    estBureau: boolean;
    estActif: boolean;
  };
}

interface MandatDetail {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  pvDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    affectations: number;
    contents: number;
    projets: number;
    events: number;
    votes: number;
  };
  affectations?: Affectation[];
}

export default function SuperAdminMandatDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mandat, setMandat] = useState<MandatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMandatDetails();
    }
  }, [id]);

  const fetchMandatDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/super-admin/mandats/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des détails du mandat');
      }
      const result = await response.json();
      setMandat(result.mandat || result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce mandat ? Cette action est irréversible.')) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/super-admin/mandats/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      router.push('/admin/mandats');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guinea-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des détails du mandat...</p>
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

  if (!mandat) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Mandat introuvable.</p>
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

  // Vérifier si le mandat est passé (date de fin < aujourd'hui)
  const isMandatPasse = new Date(mandat.dateFin) < new Date();
  const canEdit = !isMandatPasse;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Détails du mandat</h1>
          <p className="text-gray-600 mt-1">{mandat.titre}</p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit ? (
            <Link href={`/admin/mandats/${mandat.id}/edit`}>
              <Button variant="outline" size="sm" className="border-blue-500 text-blue-700 hover:bg-blue-50">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="border-gray-300 text-gray-400 cursor-not-allowed"
              title="Ce mandat est terminé et ne peut plus être modifié"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier (indisponible)
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-400 hover:border-red-500"
          >
            {deleting ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Carte Informations principales */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Informations</h2>
          </div>
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Titre :</span> {mandat.titre}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Statut :</span>{' '}
            <Badge
              variant={
                mandat.statut === 'ACTIF'
                  ? 'success'
                  : mandat.statut === 'EXPIRE'
                  ? 'destructive'
                  : 'default'
              }
              className="ml-1"
            >
              {mandat.statut}
            </Badge>
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Date de début :</span> {formatDate(mandat.dateDebut)}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Date de fin :</span> {formatDate(mandat.dateFin)}
          </p>
        </div>

        {/* Carte Statistiques */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Statistiques</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Affectations</span>
              </div>
              <span className="font-semibold text-gray-900">
                {mandat._count?.affectations || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Contenus</span>
              </div>
              <span className="font-semibold text-gray-900">
                {mandat._count?.contents || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Projets</span>
              </div>
              <span className="font-semibold text-gray-900">
                {mandat._count?.projets || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Événements</span>
              </div>
              <span className="font-semibold text-gray-900">
                {mandat._count?.events || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Carte Document PV */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Document PV</h2>
          </div>
          {mandat.pvDocumentUrl ? (
            <a
              href={mandat.pvDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline text-sm"
            >
              Voir le document
            </a>
          ) : (
            <p className="text-gray-500 text-sm">Aucun document PV</p>
          )}
        </div>

        {/* Carte Dates système */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-orange-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Dates système</h2>
          </div>
          <p className="text-gray-700 mb-2 text-sm">
            <span className="font-medium">Créé le :</span> {formatDateTime(mandat.createdAt)}
          </p>
          <p className="text-gray-700 text-sm">
            <span className="font-medium">Modifié le :</span> {formatDateTime(mandat.updatedAt)}
          </p>
        </div>
      </div>

      {/* Section Bureau Exécutif */}
      {mandat.affectations && mandat.affectations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Bureau Exécutif</h2>
            <Badge variant="outline" className="ml-3">
              {mandat.affectations.length} membre{mandat.affectations.length > 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mandat.affectations.map((affectation) => (
              <div
                key={affectation.id}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">
                        {affectation.member.prenom} {affectation.member.nom}
                      </h3>
                    </div>
                    <Badge variant="default" className="mb-2">
                      {affectation.poste.nom}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{affectation.member.user.email}</span>
                  </div>
                  {affectation.member.telephone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{affectation.member.telephone}</span>
                    </div>
                  )}
                  {affectation.member.ville && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{affectation.member.ville}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span>Rôle : {affectation.member.user.roleSysteme}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {affectation.member.user.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={affectation.member.user.isActive ? 'text-green-600' : 'text-red-600'}>
                      {affectation.member.user.isActive ? 'Compte actif' : 'Compte inactif'}
                    </span>
                  </div>
                  {affectation.poste.description && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">{affectation.poste.description}</p>
                    </div>
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                    <p>Période : {formatDate(affectation.dateDebut)} - {affectation.dateFin ? formatDate(affectation.dateFin) : 'En cours'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!mandat.affectations || mandat.affectations.length === 0) && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-gray-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Bureau Exécutif</h2>
          </div>
          <p className="text-gray-500 text-center py-8">
            Aucun membre du bureau exécutif affecté à ce mandat.
          </p>
        </div>
      )}
    </div>
  );
}

