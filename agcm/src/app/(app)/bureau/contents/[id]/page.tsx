import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { isBureauActif, canModifyContent } from '@/lib/rbac';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, User, FileText, ExternalLink, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Détail contenu - Bureau AGCM',
  description: 'Détails du contenu',
};

export default async function BureauContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect('/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect('/connexion');
  }

  const bureauActif = await isBureauActif(user.id);
  if (!bureauActif) {
    redirect('/app/dashboard');
  }

  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      auteurPoste: { select: { id: true, nom: true, description: true } },
      mandat: { select: { id: true, titre: true, dateDebut: true, dateFin: true } },
      approvedBy: { select: { id: true, email: true } },
    },
  });

  if (!content) {
    notFound();
  }

  const { canModify } = await canModifyContent(user.id, id);
  const { getAffectationActive } = await import('@/lib/rbac');
  const affectation = await getAffectationActive(user.id);
  const isOwner = affectation?.posteId === content.auteurPosteId;
  if (!isOwner && !canModify) {
    redirect('/bureau/contents');
  }

  const getStatusBadge = (status: string) => {
    const v: Record<string, 'brouillon' | 'soumis' | 'approuve' | 'rejete' | 'publie' | 'archive'> = {
      BROUILLON: 'brouillon',
      SOUMIS: 'soumis',
      APPROUVE: 'approuve',
      REJETE: 'rejete',
      PUBLIE: 'publie',
      ARCHIVE: 'archive',
    };
    return v[status] || 'brouillon';
  };

  const getTypeLabel = (type: string) =>
    ({ ACTIVITE: 'Activité', ACTUALITE: 'Actualité', PARTAGE: 'Partage', ANNONCE: 'Annonce' }[type] || type);

  const getVisibiliteLabel = (v: string) =>
    ({ PRIVE_BUREAU: 'Privé Bureau', PUBLIC_SITE: 'Public Site' }[v] || v);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/bureau/contents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        {(content.statutWorkflow === 'BROUILLON' || content.statutWorkflow === 'REJETE') && canModify && (
          <Link href={`/bureau/contents/${id}/edit`}>
            <Button variant="edit" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 space-y-6">
        <div className="border-b border-slate-700/50 pb-4">
          <h1 className="text-3xl font-bold text-slate-100 mb-3">{content.titre}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant={getStatusBadge(content.statutWorkflow)}>{content.statutWorkflow}</Badge>
            <Badge variant="outline">{getTypeLabel(content.type)}</Badge>
            <Badge variant="outline">{getVisibiliteLabel(content.visibiliteCible)}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-slate-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Auteur</p>
              <p className="font-medium">{content.auteurPoste.nom}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Mandat</p>
              <p className="font-medium">{content.mandat.titre}</p>
            </div>
          </div>
        </div>

        {content.rejectionReason && (
          <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-300 mb-1">Motif du rejet</p>
                <p className="text-sm text-red-200">{content.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}

        {content.contenu && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Contenu</span>
            </div>
            <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
              {content.contenu}
            </div>
          </div>
        )}

        {content.imagePrincipale && (
          <div className="space-y-2">
            <span className="font-medium text-slate-400">Image principale</span>
            <img
              src={content.imagePrincipale.startsWith('/') ? content.imagePrincipale : content.imagePrincipale}
              alt={content.titre}
              className="rounded-lg max-w-full h-auto max-h-80 object-cover"
            />
          </div>
        )}

        {content.lienExterne && (
          <a
            href={content.lienExterne}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <ExternalLink className="h-4 w-4" />
            Lien externe
          </a>
        )}
      </div>
    </div>
  );
}
