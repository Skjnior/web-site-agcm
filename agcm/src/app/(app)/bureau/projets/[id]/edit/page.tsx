import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import BureauProjetForm from '@/components/bureau/BureauProjetForm';

export const metadata: Metadata = {
  title: 'Modifier le projet - Bureau AGCM',
  description: 'Modifier un projet rattaché à votre poste',
};

export default async function BureauProjetEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { ctx } = await assertBureauModuleOrRedirect('projets');

  const projet = await prisma.projet.findFirst({
    where: {
      id,
      responsablePosteId: { in: ctx.posteIds },
      mandatId: ctx.mandatId,
    },
    include: {
      medias: { orderBy: { ordre: 'asc' } },
    },
  });

  if (!projet) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-8 sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/bureau/projets">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Modifier le projet</h1>
          <p className="mt-1 text-slate-400">
            Seuls les projets dont votre poste est responsable peuvent être modifiés ou supprimés.
          </p>
        </div>
      </div>

      <BureauProjetForm
        mode="edit"
        projetId={projet.id}
        initialValues={{
          titre: projet.titre,
          objectif: projet.objectif,
          description: projet.description,
          actions: projet.actions,
          statut: projet.statut,
          visibiliteSite: projet.visibiliteSite,
        }}
        initialMedias={projet.medias.map((m) => ({
          url: m.url,
          type: m.type,
          ordre: m.ordre,
        }))}
      />
    </div>
  );
}
