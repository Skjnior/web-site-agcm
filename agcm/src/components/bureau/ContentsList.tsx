'use client';

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
}

export default function ContentsList({
  contents,
  currentPage,
  totalPages,
  total,
  isSuperAdmin = false,
  basePath = '/bureau/contents',
}: ContentsListProps) {
  const [submitting, setSubmitting] = useState<string | null>(null);

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
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Aucun contenu</p>
        <Link href="/bureau/contents/nouveau">
          <Button>
            Créer votre premier contenu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full min-w-[700px] sm:min-w-[1000px] lg:min-w-[1200px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '30%', minWidth: '300px' }}>
                Titre
              </th>
              {isSuperAdmin && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '15%', minWidth: '150px' }}>
                  Auteur
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '10%', minWidth: '100px' }}>
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '12%', minWidth: '120px' }}>
                Statut
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '12%', minWidth: '120px' }}>
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '21%', minWidth: '200px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contents.map((content) => (
              <tr key={content.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 align-top">
                  <div className="font-medium text-gray-900 break-words pr-2">{content.titre}</div>
                  {content.contenu && (
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2 break-words pr-2">
                      {content.contenu.length > 150 ? `${content.contenu.substring(0, 150)}...` : content.contenu}
                    </div>
                  )}
                  {content.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-red-900 mb-1">Motif du rejet :</p>
                          <p className="text-xs text-red-700 break-words">{content.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
                {isSuperAdmin && (
                  <td className="px-4 py-4 align-top">
                    <div className="text-sm text-gray-900 break-words pr-2">
                      {content.auteurPoste?.nom || 'N/A'}
                    </div>
                    {content.mandat && (
                      <div className="text-xs text-gray-500 break-words mt-1 pr-2">
                        {content.mandat.titre}
                      </div>
                    )}
                  </td>
                )}
                <td className="px-4 py-4 align-top">
                  <span className="text-sm text-gray-900 whitespace-nowrap">{getTypeLabel(content.type)}</span>
                </td>
                <td className="px-4 py-4 align-top">
                  <Badge variant={getStatusBadge(content.statutWorkflow)} className="whitespace-nowrap">
                    {content.statutWorkflow}
                  </Badge>
                </td>
                <td className="px-4 py-4 align-top text-sm text-gray-500 whitespace-nowrap">
                  {new Date(content.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-3 sm:px-4 py-4 align-top text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1 sm:gap-1.5 flex-wrap">
                    <Link href={isSuperAdmin ? `/super-admin/contents/${content.id}` : `/bureau/contents/${content.id}`}>
                      <Button variant="view" size="sm" className="text-xs px-2 py-1 h-7">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Voir
                      </Button>
                    </Link>
                    {(content.statutWorkflow === 'BROUILLON' || content.statutWorkflow === 'REJETE' || isSuperAdmin) && (
                      <Link href={isSuperAdmin ? `/super-admin/contents/${content.id}/edit` : `/bureau/contents/${content.id}/edit`}>
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
        <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200">
          <div className="text-sm text-gray-700 text-center sm:text-left">
            Affichage de {((currentPage - 1) * 10) + 1} à {Math.min(currentPage * 10, total)} sur {total}
          </div>
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link href={`${basePath}?page=${currentPage - 1}`}>
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
                  <Link key={pageNum} href={`${basePath}?page=${pageNum}`}>
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
              <Link href={`${basePath}?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm">Suivant</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

