import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SuperAdminContentsClient from './SuperAdminContentsClient';

export const metadata: Metadata = {
  title: 'Gestion des contenus - Super Admin AGCM',
  description: 'Gérer tous les contenus de la plateforme',
};

export default async function SuperAdminContentsPage({
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

  // Vérifier que l'utilisateur est Super Admin
  const userRole = (user as any).roleSysteme;
  if (userRole !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const status = params.status || 'ALL';
  const page = parseInt(params.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = params.search || '';

  // Construire la requête where - Super Admin voit TOUS les contenus
  const where: any = {};

  if (status !== 'ALL') {
    where.statutWorkflow = status;
  }

  // Recherche par titre ou contenu
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
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Compter par statut - Super Admin voit tous les contenus
  const [brouillonCount, soumisCount, approuveCount, publieCount, rejeteCount, archiveCount] = await Promise.all([
    prisma.content.count({
      where: { statutWorkflow: 'BROUILLON' },
    }),
    prisma.content.count({
      where: { statutWorkflow: 'SOUMIS' },
    }),
    prisma.content.count({
      where: { statutWorkflow: 'APPROUVE' },
    }),
    prisma.content.count({
      where: { statutWorkflow: 'PUBLIE' },
    }),
    prisma.content.count({
      where: { statutWorkflow: 'REJETE' },
    }),
    prisma.content.count({
      where: { statutWorkflow: 'ARCHIVE' },
    }),
  ]);

  return (
    <SuperAdminContentsClient
      initialContents={contents}
      initialTotal={total}
      initialPage={page}
      initialTotalPages={totalPages}
      initialStatus={status}
      initialStats={{
        brouillon: brouillonCount,
        soumis: soumisCount,
        approuve: approuveCount,
        publie: publieCount,
        rejete: rejeteCount,
        archive: archiveCount,
      }}
    />
  );
}

