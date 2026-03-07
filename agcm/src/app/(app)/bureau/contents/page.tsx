import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBureauActif, getAffectationActive } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
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
    redirect('/app/dashboard');
  }

  const affectation = await getAffectationActive(user.id);
  const mandatActif = await getMandatActif();
  if (!affectation || !mandatActif) {
    redirect('/app/dashboard');
  }

  const status = params.status || 'ALL';
  const page = parseInt(params.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = params.search || '';

  const where: Record<string, unknown> = {
    auteurPosteId: affectation.posteId,
    mandatId: mandatActif.id,
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Mes activités
          </h1>
          <p className="text-slate-400 mt-1">
            Gérez vos contenus et activités pour le mandat en cours
          </p>
        </div>
        <Link href="/bureau/contents/nouveau">
          <Button variant="add">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau contenu
          </Button>
        </Link>
      </div>

      <BureauContentsClient
        initialContents={contents}
        initialTotal={total}
        initialPage={page}
        initialTotalPages={totalPages}
        initialStatus={status}
        initialSearch={search}
      />
    </div>
  );
}
