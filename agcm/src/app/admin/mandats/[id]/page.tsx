'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, FileText, Edit, Trash2, Users, FileCheck, FolderKanban, CalendarDays, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { memberContactEmail } from '@/lib/member-contact';

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
    email: string | null;
    user: {
      id: string;
      email: string;
      roleSysteme: string;
      isActive: boolean;
    } | null;
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
      <div className="admin-page space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
        <div className="admin-glass rounded-2xl p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Chargement des détails du mandat...</p>
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

  if (!mandat) {
    return (
      <div className="admin-page space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
        <div className="admin-glass rounded-2xl border border-amber-200/80 bg-amber-50/90 p-6 text-center dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-amber-900 dark:text-amber-200">Mandat introuvable.</p>
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

  // Vérifier si le mandat est passé (date de fin < aujourd'hui)
  const isMandatPasse = new Date(mandat.dateFin) < new Date();
  const canEdit = !isMandatPasse;

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
              Détails du mandat
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">{mandat.titre}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {canEdit ? (
            <Link href={`/admin/mandats/${mandat.id}/edit`}>
              <Button variant="edit" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="cursor-not-allowed border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500"
              title="Ce mandat est terminé et ne peut plus être modifié"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier (indisponible)
            </Button>
          )}
          <Button variant="delete" size="sm" onClick={handleDelete} disabled={deleting}>
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Carte Informations principales */}
        <div className="admin-panel p-6">
          <div className="mb-4 flex items-center">
            <Calendar className="mr-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Informations</h2>
          </div>
          <p className="mb-2 text-slate-700 dark:text-slate-300">
            <span className="font-medium">Titre :</span> {mandat.titre}
          </p>
          <p className="mb-2 text-slate-700 dark:text-slate-300">
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
          <p className="mb-2 text-slate-700 dark:text-slate-300">
            <span className="font-medium">Date de début :</span> {formatDate(mandat.dateDebut)}
          </p>
          <p className="text-slate-700 dark:text-slate-300">
            <span className="font-medium">Date de fin :</span> {formatDate(mandat.dateFin)}
          </p>
        </div>

        {/* Carte Statistiques */}
        <div className="admin-panel p-6">
          <div className="mb-4 flex items-center">
            <FileText className="mr-3 h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Statistiques</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">Affectations</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {mandat._count?.affectations || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">Contenus</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {mandat._count?.contents || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">Projets</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {mandat._count?.projets || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">Événements</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {mandat._count?.events || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Carte Document PV */}
        <div className="admin-panel p-6">
          <div className="mb-4 flex items-center">
            <FileText className="mr-3 h-6 w-6 text-violet-600 dark:text-violet-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Document PV</h2>
          </div>
          {mandat.pvDocumentUrl ? (
            <a
              href={mandat.pvDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Voir le document
            </a>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Aucun document PV</p>
          )}
        </div>

        {/* Carte Dates système */}
        <div className="admin-panel p-6">
          <div className="mb-4 flex items-center">
            <Calendar className="mr-3 h-6 w-6 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Dates système</h2>
          </div>
          <p className="mb-2 text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium">Créé le :</span> {formatDateTime(mandat.createdAt)}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium">Modifié le :</span> {formatDateTime(mandat.updatedAt)}
          </p>
        </div>
      </div>

      {/* Section Bureau Exécutif */}
      {mandat.affectations && mandat.affectations.length > 0 && (
        <div className="admin-panel p-6">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Bureau Exécutif</h2>
            <Badge variant="outline" className="border-slate-300 dark:border-slate-600 dark:text-slate-200">
              {mandat.affectations.length} membre{mandat.affectations.length > 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mandat.affectations.map((affectation) => (
              <div
                key={affectation.id}
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/40"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <User className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {affectation.member.prenom} {affectation.member.nom}
                      </h3>
                    </div>
                    <Badge variant="default" className="mb-2">
                      {affectation.poste.nom}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span>{memberContactEmail(affectation.member) || '—'}</span>
                  </div>
                  {affectation.member.telephone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <span>{affectation.member.telephone}</span>
                    </div>
                  )}
                  {affectation.member.ville && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <span>{affectation.member.ville}</span>
                    </div>
                  )}
                  {affectation.member.user ? (
                    <>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Shield className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <span>Rôle : {affectation.member.user.roleSysteme}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {affectation.member.user.isActive ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <span
                          className={
                            affectation.member.user.isActive
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-red-700 dark:text-red-400'
                          }
                        >
                          {affectation.member.user.isActive ? 'Compte actif' : 'Compte inactif'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pas de compte de connexion.</p>
                  )}
                  {affectation.poste.description && (
                    <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-600">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{affectation.poste.description}</p>
                    </div>
                  )}
                  <div className="mt-2 border-t border-slate-200 pt-2 text-xs text-slate-500 dark:text-slate-400">
                    <p>
                      Période : {formatDate(affectation.dateDebut)} -{' '}
                      {affectation.dateFin ? formatDate(affectation.dateFin) : 'En cours'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!mandat.affectations || mandat.affectations.length === 0) && (
        <div className="admin-panel p-6">
          <div className="mb-4 flex items-center gap-3">
            <Users className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Bureau Exécutif</h2>
          </div>
          <p className="py-8 text-center text-slate-500 dark:text-slate-400">
            Aucun membre du bureau exécutif affecté à ce mandat.
          </p>
        </div>
      )}
    </div>
  );
}

