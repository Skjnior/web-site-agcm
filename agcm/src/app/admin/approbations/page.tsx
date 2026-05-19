import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { StatutWorkflow } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/rbac';
import ApprobationsPageClient from './ApprobationsPageClient';

export const metadata: Metadata = {
  title: 'Approbations - Admin AGCM',
  description: 'Valider les contenus soumis par le bureau',
};

export default async function ApprobationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !isAdmin(user)) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const status = (params.status || 'SOUMIS') as StatutWorkflow;
  const page = parseInt(params.page || '1');
  const limit = 10;
  const offset = (page - 1) * limit;

  const where = { statutWorkflow: status };

  const [total, contents] = await Promise.all([
    prisma.content.count({ where }),
    prisma.content.findMany({
      where,
      include: {
        auteurPoste: {
          select: {
            id: true,
            nom: true,
            affectations: {
              where: { statut: 'ACTIF' },
              include: {
                member: {
                  select: {
                    prenom: true,
                    nom: true,
                    email: true,
                    user: { select: { email: true } },
                  },
                },
              },
            },
          },
        },
        mandat: { select: { id: true, titre: true } },
        approvedBy: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const contentsWithCanApprove = contents.map((c) => ({
    ...c,
    canApprove: true,
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Approbations</h1>
        <p className="text-slate-400 mt-1">
          Validez les contenus soumis par les membres du bureau
        </p>
      </div>

      <ApprobationsPageClient
        initialContents={contentsWithCanApprove}
        initialPage={page}
        initialTotalPages={totalPages}
        initialTotal={total}
        initialStatus={status}
      />
    </div>
  );
}
