import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, FileText, Calendar, User, Eye } from 'lucide-react';
import Link from 'next/link';
import { isSuperAdmin } from '@/lib/permissions';

export const metadata: Metadata = {
  title: 'Détail du contenu - Super Admin AGCM',
  description: 'Détails du contenu',
};

type ContentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect('/connexion');
  }

  const userRole = (session.user as any).roleSysteme || session.user.role;
  if (!isSuperAdmin(userRole)) {
    redirect('/dashboard');
  }

  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      auteurPoste: {
        select: {
          id: true,
          nom: true,
          description: true,
        },
      },
      mandat: {
        select: {
          id: true,
          titre: true,
          dateDebut: true,
          dateFin: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!content) {
    notFound();
  }

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
    <div className="mx-auto max-w-4xl space-y-6 text-slate-100">
      <div className="flex items-center justify-between">
        <Link href="/admin/contents">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <Link href={`/admin/contents/${id}/edit`}>
          <Button variant="edit">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </Link>
      </div>

      <div className="admin-panel space-y-6 rounded-xl p-6">
        {/* En-tête */}
        <div className="border-b border-slate-700 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-slate-100">{content.titre}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={getStatusBadge(content.statutWorkflow)}>
                  {content.statutWorkflow}
                </Badge>
                <Badge variant="outline">{getTypeLabel(content.type)}</Badge>
                <Badge variant="outline">{getVisibiliteLabel(content.visibiliteCible)}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-400">Auteur</p>
              <p className="font-medium text-slate-100">{content.auteurPoste?.nom || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-400">Mandat</p>
              <p className="font-medium text-slate-100">{content.mandat?.titre || 'N/A'}</p>
            </div>
          </div>
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

        {/* Contenu */}
        {content.contenu && (
          <div>
            <h2 className="mb-3 text-xl font-semibold text-slate-100">Contenu</h2>
            <div className="max-w-none whitespace-pre-wrap text-slate-300 leading-relaxed">
              {content.contenu}
            </div>
          </div>
        )}

        {/* Lien externe */}
        {content.lienExterne && (
          <div>
            <h2 className="mb-3 text-xl font-semibold text-slate-100">Lien externe</h2>
            <a
              href={content.lienExterne}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {content.lienExterne}
            </a>
          </div>
        )}

        {/* Image principale */}
        {content.imagePrincipale && (
          <div>
            <h2 className="mb-3 text-xl font-semibold text-slate-100">Image principale</h2>
            <img
              src={content.imagePrincipale}
              alt={content.titre}
              className="max-w-full h-auto rounded-lg"
            />
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
  );
}


