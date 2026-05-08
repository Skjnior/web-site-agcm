import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBureauActif, getAffectationActive } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import BureauContentsClient from '../BureauContentsClient';

export const metadata: Metadata = {
  title: 'Contenus rejetés - Bureau AGCM',
  description: 'Contenus rejetés par le Président',
};

export default async function BureauContentsRejetesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

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
    redirect('/');
  }

  const affectation = await getAffectationActive(user.id);
  const mandatActif = await getMandatActif();
  if (!affectation || !mandatActif) {
    redirect('/');
  }

  const page = parseInt(params.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const where = {
    auteurPosteId: affectation.posteId,
    mandatId: mandatActif.id,
    statutWorkflow: 'REJETE' as const,
  };

  const [total, contents] = await Promise.all([
    prisma.content.count({ where }),
    prisma.content.findMany({
      where,
      include: {
        auteurPoste: { select: { id: true, nom: true, description: true } },
        mandat: { select: { id: true, titre: true, dateDebut: true, dateFin: true } },
        approvedBy: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Contenus rejetés</h1>
        <p className="text-slate-400 mt-1">
          Contenus rejetés par le Président. Vous pouvez les modifier et les resoumettre.
        </p>
      </div>

      <BureauContentsClient
        initialContents={contents}
        initialTotal={total}
        initialPage={page}
        initialTotalPages={totalPages}
        initialStatus="REJETE"
        forceStatus="REJETE"
      />
    </div>
  );
}
