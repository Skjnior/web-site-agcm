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
        className="relative mx-4 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4">
          <h2 className="text-2xl font-bold text-slate-100">Détails du contenu</h2>
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

        <div className="space-y-6 p-6 text-slate-100">
          {/* En-tête */}
          <div className="border-b border-slate-700 pb-4">
            <h1 className="mb-3 text-3xl font-bold text-slate-100">{content.titre}</h1>
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
                <User className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-400">Auteur</p>
                  <p className="font-medium text-slate-100">{content.auteurPoste?.nom || 'N/A'}</p>
                </div>
              </div>
            )}
            {isSuperAdmin && content.mandat && (
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-400">Mandat</p>
                  <p className="font-medium text-slate-100">{content.mandat.titre}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-400">Date de création</p>
                <p className="font-medium text-slate-100">
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
                <User className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-400">Approuvé par</p>
                  <p className="font-medium text-slate-100">{content.approvedBy.email}</p>
                  {content.approvedAt && (
                    <p className="text-xs text-slate-500">
                      {new Date(content.approvedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Image principale */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-slate-100">Image principale</h2>
            <img
              src={content.imagePrincipale || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80'}
              alt={content.titre}
              className="max-w-full h-auto rounded-lg"
            />
          </div>

          {/* Contenu */}
          {content.contenu && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-slate-100">
                <FileText className="h-5 w-5" />
                Contenu
              </h2>
              <div className="max-w-none whitespace-pre-wrap rounded-lg bg-slate-800/80 p-4 text-slate-200">
                {content.contenu}
              </div>
            </div>
          )}

          {/* Lien externe */}
          {content.lienExterne && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-slate-100">
                <ExternalLink className="h-5 w-5" />
                Lien externe
              </h2>
              <a
                href={content.lienExterne}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-blue-400 hover:text-blue-300 hover:underline"
              >
                {content.lienExterne}
              </a>
            </div>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-semibold text-slate-100">Tags</h2>
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
            <div className="rounded-lg border border-red-900/50 bg-red-950/40 p-4">
              <h2 className="mb-2 text-lg font-semibold text-red-300">Motif du rejet</h2>
              <p className="text-red-200/90">{content.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



