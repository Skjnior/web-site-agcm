'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, User, FileText } from 'lucide-react';

interface Content {
  id: string;
  type: string;
  titre: string;
  contenu: string | null;
  statutWorkflow: string;
  visibiliteCible: string;
  createdAt: Date | string;
  auteurPoste: {
    nom: string;
    affectations: Array<{
      member: {
        prenom: string;
        nom: string;
        user: { email: string };
      };
    }>;
  };
  mandat: { titre: string };
  approvedBy: { email: string } | null;
  rejectionReason: string | null;
}

interface ApprobationModalProps {
  content: Content;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApprobationModal({
  content,
  isOpen,
  onClose,
}: ApprobationModalProps) {
  if (!isOpen || !content) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'soumis' | 'approuve' | 'rejete' | 'publie'> = {
      SOUMIS: 'soumis',
      APPROUVE: 'approuve',
      REJETE: 'rejete',
      PUBLIE: 'publie',
    };
    return variants[status] || 'soumis';
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

  const auteur = content.auteurPoste?.affectations?.[0]?.member;
  const date = typeof content.createdAt === 'string'
    ? new Date(content.createdAt)
    : content.createdAt;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative admin-panel shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Détails du contenu</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{content.titre}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant={getStatusBadge(content.statutWorkflow)}>
                {content.statutWorkflow}
              </Badge>
              <Badge variant="outline">{getTypeLabel(content.type)}</Badge>
              <Badge variant="outline">{getVisibiliteLabel(content.visibiliteCible)}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>
                {auteur
                  ? `${auteur.prenom} ${auteur.nom} (${content.auteurPoste.nom})`
                  : content.auteurPoste.nom}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{date.toLocaleDateString('fr-FR')}</span>
            </div>
            {content.approvedBy && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span>Approuvé par {content.approvedBy.email}</span>
              </div>
            )}
            {content.rejectionReason && (
              <div className="md:col-span-2 p-3 bg-red-50 rounded-lg">
                <p className="font-medium text-red-800">Motif du rejet :</p>
                <p className="text-red-700">{content.rejectionReason}</p>
              </div>
            )}
          </div>

          {content.contenu && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-2">Contenu</h4>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                {content.contenu}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
