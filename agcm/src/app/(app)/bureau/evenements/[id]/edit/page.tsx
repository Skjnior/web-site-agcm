import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import BureauEvenementForm from '@/components/bureau/BureauEvenementForm';
import { dateToDatetimeLocalValue } from '@/lib/datetime-local';

export const metadata: Metadata = {
  title: 'Modifier l\'événement - Bureau AGCM',
  description: 'Modifier un événement créé depuis votre poste',
};

export default async function BureauEvenementEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { ctx } = await assertBureauModuleOrRedirect('evenements');

  const event = await prisma.event.findFirst({
    where: {
      id,
      createdByPosteId: { in: ctx.posteIds },
      mandatId: ctx.mandatId,
    },
    include: {
      medias: { orderBy: { ordre: 'asc' } },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-8 sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/bureau/evenements">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Modifier l&apos;événement</h1>
          <p className="mt-1 text-slate-400">
            Le statut (passé / en cours / à venir) est recalculé automatiquement selon les dates.
          </p>
        </div>
      </div>

      <BureauEvenementForm
        mode="edit"
        eventId={event.id}
        initialValues={{
          titre: event.titre,
          description: event.description,
          dateDebut: dateToDatetimeLocalValue(event.dateDebut),
          dateFin: event.dateFin ? dateToDatetimeLocalValue(event.dateFin) : '',
          lieu: event.lieu ?? '',
          afficheSite: event.afficheSite,
        }}
        initialMedias={event.medias.map((m) => ({
          url: m.url,
          isPrincipale: m.isPrincipale,
          ordre: m.ordre,
        }))}
      />
    </div>
  );
}
