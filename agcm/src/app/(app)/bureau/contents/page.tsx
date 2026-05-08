import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { canDeleteContent } from '@/lib/rbac';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import BureauContentsClient from './BureauContentsClient';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mes activités - Bureau AGCM',
  description: 'Gérer vos contenus et activités',
};

export default async function BureauContentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; search?: string }>;
}) {
  const params = await searchParams;

  const { user, ctx } = await assertBureauModuleOrRedirect('contents');

  const status = params.status || 'ALL';
  const page = parseInt(params.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = params.search || '';

  const where: Record<string, unknown> = {
    auteurPosteId: { in: ctx.posteIds },
    mandatId: ctx.mandatId,
  };

  if (status !== 'ALL') {
    where.statutWorkflow = status;
  }

  if (search) {
    where.OR = [
      { titre: { contains: search, mode: 'insensitive' } },
      { contenu: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, contents] = await Promise.all([
    prisma.content.count({ where }),
    prisma.content.findMany({
      where,
      include: {
        auteurPoste: {
          select: { id: true, nom: true, description: true },
        },
        mandat: {
          select: { id: true, titre: true, dateDebut: true, dateFin: true },
        },
        approvedBy: {
          select: { id: true, email: true },
        },
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100 sm:text-3xl">
            <FileText className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
            Mes activités
          </h1>
          <p className="mt-1 text-slate-400">
            Gérez vos contenus et activités pour le mandat en cours
          </p>
        </div>
        <Link href="/bureau/contents/nouveau" className="shrink-0 sm:self-start">
          <Button variant="add" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau contenu
          </Button>
        </Link>
      </div>

      <BureauContentsClient
        initialContents={contentsWithPerms}
        initialTotal={total}
        initialPage={page}
        initialTotalPages={totalPages}
        initialStatus={status}
        initialSearch={search}
      />
    </div>
  );
}
