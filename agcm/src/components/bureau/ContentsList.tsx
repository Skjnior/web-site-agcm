'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Send, FileText, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Content {
  id: string;
  type: string;
  titre: string;
  contenu: string | null;
  statutWorkflow: string;
  visibiliteCible: string;
  createdAt: Date;
  rejectionReason: string | null;
  auteurPoste?: {
    id: string;
    nom: string;
    description: string | null;
  } | null;
  mandat?: {
    id: string;
    titre: string;
    dateDebut: Date;
    dateFin: Date;
  } | null;
  approvedBy?: {
    id: string;
    email: string;
  } | null;
}

interface ContentsListProps {
  contents: Content[];
  currentPage: number;
  totalPages: number;
  total: number;
  isSuperAdmin?: boolean;
  /** Base path pour la pagination (ex: /bureau/contents/rejetes) */
  basePath?: string;
  /** Taille de page côté API (affichage pagination) */
  pageSize?: number;
  /** Si défini, remplace les liens `basePath?page=` (ex. conserver status/search) */
  getPaginationHref?: (page: number) => string;
}

export default function ContentsList({
  contents,
  currentPage,
  totalPages,
  total,
  isSuperAdmin = false,
  basePath = '/bureau/contents',
  pageSize = 10,
  getPaginationHref,
}: ContentsListProps) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const router = useRouter();

  const pageHref = (pageNum: number) =>
    getPaginationHref ? getPaginationHref(pageNum) : `${basePath}?page=${pageNum}`;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'brouillon' | 'soumis' | 'approuve' | 'rejete' | 'publie'> = {
      BROUILLON: 'brouillon',
      SOUMIS: 'soumis',
      APPROUVE: 'approuve',
      REJETE: 'rejete',
      PUBLIE: 'publie',
    };
    return variants[status] || 'brouillon';
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

  const handleSubmit = async (contentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir soumettre ce contenu au Président pour validation ?')) {
      return;
    }

    setSubmitting(contentId);
    try {
      const response = await fetch(`/api/bureau/contents/${contentId}/submit`, {
        method: 'POST',
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la soumission');
      }
    } catch (error) {
      alert('Erreur lors de la soumission');
    } finally {
      setSubmitting(null);
    }
  };

  if (contents.length === 0) {
    if (isSuperAdmin) {
      return (
        <div className="admin-panel rounded-lg p-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-slate-500" />
          <p className="mb-4 text-slate-400">Aucun contenu</p>
          <Link href="/bureau/contents/nouveau">
            <Button>Créer un contenu</Button>
          </Link>
        </div>
      );
    }
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-4 text-gray-600">Aucun contenu</p>
        <Link href="/bureau/contents/nouveau">
          <Button>Créer votre premier contenu</Button>
        </Link>
      </div>
    );
  }

  const shellClass = isSuperAdmin
    ? 'admin-panel overflow-hidden rounded-lg'
    : 'overflow-hidden rounded-lg bg-white shadow';

  return (
    <div className={shellClass}>
      <div className="w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full min-w-[700px] sm:min-w-[1000px] lg:min-w-[1200px]">
          <thead className={isSuperAdmin ? 'bg-slate-800/90' : 'bg-gray-50'}>
            <tr>
              <th
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isSuperAdmin ? 'text-slate-400' : 'text-gray-500'}`}
                style={{ width: '30%', minWidth: '300px' }}
              >
                Titre
              </th>
              {isSuperAdmin && (
                <th
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isSuperAdmin ? 'text-slate-400' : 'text-gray-500'}`}
                  style={{ width: '15%', minWidth: '150px' }}
                >
                  Auteur
                </th>
              )}
              <th
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isSuperAdmin ? 'text-slate-400' : 'text-gray-500'}`}
                style={{ width: '10%', minWidth: '100px' }}
              >
                Type
              </th>
              <th
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isSuperAdmin ? 'text-slate-400' : 'text-gray-500'}`}
                style={{ width: '12%', minWidth: '120px' }}
              >
                Statut
              </th>
              <th
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isSuperAdmin ? 'text-slate-400' : 'text-gray-500'}`}
                style={{ width: '12%', minWidth: '120px' }}
              >
                Date
              </th>
              <th
                className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${isSuperAdmin ? 'text-slate-400' : 'text-gray-500'}`}
                style={{ width: '21%', minWidth: '200px' }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={
              isSuperAdmin
                ? 'divide-y divide-slate-700 bg-slate-950'
                : 'divide-y divide-gray-200 bg-white'
            }
          >
            {contents.map((content) => (
              <tr
                key={content.id}
                onClick={() => router.push(isSuperAdmin ? `/admin/contents/${content.id}` : `/bureau/contents/${content.id}`)}
                className={`cursor-pointer transition-colors ${isSuperAdmin ? 'hover:bg-slate-800/60' : 'hover:bg-gray-50'}`}
              >
                <td className="px-4 py-4 align-top">
                  <div
                    className={`break-words pr-2 font-medium ${isSuperAdmin ? 'text-slate-100' : 'text-gray-900'}`}
                  >
                    {content.titre}
                  </div>
                  {content.contenu && (
                    <div
                      className={`mt-1 line-clamp-2 break-words pr-2 text-sm ${isSuperAdmin ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      {content.contenu.length > 150 ? `${content.contenu.substring(0, 150)}...` : content.contenu}
                    </div>
                  )}
                  {content.rejectionReason && (
                    <div
                      className={`mt-2 rounded-lg border p-2 ${isSuperAdmin ? 'border-red-900/50 bg-red-950/40' : 'border-red-200 bg-red-50'}`}
                    >
                      <div className="flex items-start gap-2">
                        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`mb-1 text-xs font-medium ${isSuperAdmin ? 'text-red-300' : 'text-red-900'}`}
                          >
                            Motif du rejet :
                          </p>
                          <p
                            className={`break-words text-xs ${isSuperAdmin ? 'text-red-200/90' : 'text-red-700'}`}
                          >
                            {content.rejectionReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
                {isSuperAdmin && (
                  <td className="px-4 py-4 align-top">
                    <div className="break-words pr-2 text-sm text-slate-100">
                      {content.auteurPoste?.nom || 'N/A'}
                    </div>
                    {content.mandat && (
                      <div className="mt-1 break-words pr-2 text-xs text-slate-400">
                        {content.mandat.titre}
                      </div>
                    )}
                  </td>
                )}
                <td className="px-4 py-4 align-top">
                  <span
                    className={`whitespace-nowrap text-sm ${isSuperAdmin ? 'text-slate-100' : 'text-gray-900'}`}
                  >
                    {getTypeLabel(content.type)}
                  </span>
                </td>
                <td className="px-4 py-4 align-top">
                  <Badge variant={getStatusBadge(content.statutWorkflow)} className="whitespace-nowrap">
                    {content.statutWorkflow}
                  </Badge>
                </td>
                <td
                  className={`px-4 py-4 align-top text-sm whitespace-nowrap ${isSuperAdmin ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {new Date(content.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-3 sm:px-4 py-4 align-top text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 sm:gap-1.5 flex-wrap">
                    <Link href={isSuperAdmin ? `/admin/contents/${content.id}` : `/bureau/contents/${content.id}`}>
                      <Button variant="view" size="sm" className="text-xs px-2 py-1 h-7">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Voir
                      </Button>
                    </Link>
                    {(content.statutWorkflow === 'BROUILLON' || content.statutWorkflow === 'REJETE' || isSuperAdmin) && (
                      <Link href={isSuperAdmin ? `/admin/contents/${content.id}/edit` : `/bureau/contents/${content.id}/edit`}>
                        <Button variant="edit" size="sm" className="text-xs px-2 py-1 h-7">
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Modifier
                        </Button>
                      </Link>
                    )}
                    {content.statutWorkflow === 'BROUILLON' && content.visibiliteCible !== 'PRIVE_BUREAU' && !isSuperAdmin && (
                      <Button
                        variant="default"
                        size="sm"
                        className="text-xs px-2 py-1 h-7"
                        onClick={() => handleSubmit(content.id)}
                        disabled={submitting === content.id}
                      >
                        {submitting === content.id ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5 mr-1" />
                        )}
                        {submitting === content.id ? 'Envoi...' : 'Soumettre'}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination améliorée */}
      {totalPages > 1 && (
        <div
          className={`flex flex-col items-center justify-between gap-3 border-t px-4 py-4 sm:flex-row sm:px-6 ${isSuperAdmin ? 'border-slate-700 bg-slate-900/80' : 'border-gray-200 bg-gray-50'}`}
        >
          <div
            className={`text-center text-sm sm:text-left ${isSuperAdmin ? 'text-slate-300' : 'text-gray-700'}`}
          >
            Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, total)} sur{' '}
            {total}
          </div>
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link href={pageHref(currentPage - 1)}>
                <Button variant="outline" size="sm">Précédent</Button>
              </Link>
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
                
                return (
                  <Link key={pageNum} href={pageHref(pageNum)}>
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
              <Link href={pageHref(currentPage + 1)}>
                <Button variant="outline" size="sm">Suivant</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

