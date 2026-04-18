'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Edit, Calendar, User, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Content {
  id: string;
  type: string;
  titre: string;
  contenu: string | null;
  lienExterne: string | null;
  imagePrincipale: string | null;
  statutWorkflow: string;
  visibiliteCible: string;
  tags: string[] | null;
  rejectionReason: string | null;
  createdAt: Date;
  approvedAt: Date | null;
  auteurPoste?: {
    nom: string;
  } | null;
  mandat?: {
    titre: string;
  } | null;
  approvedBy?: {
    email: string;
  } | null;
}

interface ContentDetailModalProps {
  content: Content | null;
  isOpen: boolean;
  onClose: () => void;
  isSuperAdmin?: boolean;
}

export default function ContentDetailModal({
  content,
  isOpen,
  onClose,
  isSuperAdmin = false,
}: ContentDetailModalProps) {
  if (!isOpen || !content) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'brouillon' | 'soumis' | 'approuve' | 'rejete' | 'publie' | 'archive'> = {
      BROUILLON: 'brouillon',
      SOUMIS: 'soumis',
      APPROUVE: 'approuve',
      REJETE: 'rejete',
      PUBLIE: 'publie',
      ARCHIVE: 'archive',
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

  const getVisibiliteLabel = (visibilite: string) => {
    const labels: Record<string, string> = {
      PRIVE_BUREAU: 'Privé Bureau',
      
      PUBLIC_SITE: 'Public Site',
    };
    return labels[visibilite] || visibilite;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Détails du contenu</h2>
          <div className="flex items-center gap-2">
            <Link href={isSuperAdmin ? `/admin/contents/${content.id}/edit` : `/bureau/contents/${content.id}/edit`}>
              <Button variant="edit" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6 text-gray-900">
          {/* En-tête */}
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{content.titre}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={getStatusBadge(content.statutWorkflow)}>
                {content.statutWorkflow}
              </Badge>
              <Badge variant="outline">{getTypeLabel(content.type)}</Badge>
              <Badge variant="outline">{getVisibiliteLabel(content.visibiliteCible)}</Badge>
            </div>
          </div>

          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isSuperAdmin && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Auteur</p>
                  <p className="font-medium text-gray-900">{content.auteurPoste?.nom || 'N/A'}</p>
                </div>
              </div>
            )}
            {isSuperAdmin && content.mandat && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Mandat</p>
                  <p className="font-medium text-gray-900">{content.mandat.titre}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date de création</p>
                <p className="font-medium text-gray-900">
                  {new Date(content.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            {content.approvedBy && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Approuvé par</p>
                  <p className="font-medium text-gray-900">{content.approvedBy.email}</p>
                  {content.approvedAt && (
                    <p className="text-xs text-gray-500">
                      {new Date(content.approvedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Image principale */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Image principale</h2>
            <img
              src={content.imagePrincipale || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'}
              alt={content.titre}
              className="max-w-full h-auto rounded-lg"
            />
          </div>

          {/* Contenu */}
          {content.contenu && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contenu
              </h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {content.contenu}
              </div>
            </div>
          )}

          {/* Lien externe */}
          {content.lienExterne && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Lien externe
              </h2>
              <a
                href={content.lienExterne}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {content.lienExterne}
              </a>
            </div>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Motif de rejet */}
          {content.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-900 mb-2">Motif du rejet</h2>
              <p className="text-red-700">{content.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



