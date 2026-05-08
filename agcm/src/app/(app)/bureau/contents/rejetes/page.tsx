import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { canDeleteContent } from '@/lib/rbac';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
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
  const params = await searchParams;

  const { user, ctx } = await assertBureauModuleOrRedirect('contents');

  const page = parseInt(params.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const where = {
    auteurPosteId: { in: ctx.posteIds },
    mandatId: ctx.mandatId,
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

  const contentsWithPerms = await Promise.all(
    contents.map(async (c) => ({
      ...c,
      canDelete: await canDeleteContent(user.id, c.id),
    })),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">Contenus rejetés</h1>
        <p className="mt-1 text-slate-400">
          Contenus rejetés par le Président. Vous pouvez les modifier et les resoumettre.
        </p>
      </div>

      <BureauContentsClient
        initialContents={contentsWithPerms}
        initialTotal={total}
        initialPage={page}
        initialTotalPages={totalPages}
        initialStatus="REJETE"
        forceStatus="REJETE"
      />
    </div>
  );
}
