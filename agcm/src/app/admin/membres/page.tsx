import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MembersTable from '@/components/admin/MembersTable';
import { canActOnUser } from '@/lib/permissions';
import MembresPageClient from './MembresPageClient';

export const metadata: Metadata = {
  title: 'Gestion des membres - Admin AGCM',
  description: 'Gérer les membres de l\'AGCM',
};

type MembresPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function MembresPage({ searchParams }: MembresPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  // Vérifier que l'utilisateur est admin ou super admin
  // Le rôle peut être dans session.user.role ou session.user.roleSysteme selon la configuration
  const userRole = (session.user as any).roleSysteme || session.user.role;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const statusFilter = parseParam(params.status);
  const typeFilter = parseParam(params.type);
  const search = parseParam(params.q);
  const page = parseInt(parseParam(params.page) || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  // Construire la clause where
  const where: any = {};
  if (statusFilter) {
    where.statutMembre = statusFilter;
  }
  if (typeFilter) {
    // Note: memberType n'existe pas dans le schéma, on peut l'ignorer ou le mapper
  }
  if (search) {
    where.OR = [
      { prenom: { contains: search, mode: 'insensitive' } },
      { nom: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { telephone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, members] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            roleSysteme: true,
          },
        },
      },
      orderBy: {
        dateAdhesion: 'desc',
      },
      skip: offset,
      take: limit,
    }),
  ]);

  // Ajouter l'information de permission pour chaque membre
  const membersWithPermissions = members.map((member) => ({
    ...member,
    memberType: null, // Removed from schema
    user: {
      id: member.user.id,
      email: member.user.email,
      role: member.user.roleSysteme,
    },
    canAct: canActOnUser(userRole, member.user.roleSysteme),
  }));

  const stats = {
    total: await prisma.member.count(),
    actifs: await prisma.member.count({ where: { statutMembre: 'ACTIF' } }),
    suspendus: await prisma.member.count({ where: { statutMembre: 'SUSPENDU' } }),
    radies: await prisma.member.count({ where: { statutMembre: 'RADIE' } }),
  };

  return (
    <MembresPageClient
      initialMembers={membersWithPermissions}
      initialStats={stats}
      initialTotal={total}
      initialPage={page}
      initialTotalPages={Math.ceil(total / limit)}
      initialStatusFilter={statusFilter}
      initialTypeFilter={typeFilter}
      initialSearch={search}
      currentUserRole={userRole}
      currentUserId={session.user.id}
    />
  );
}

