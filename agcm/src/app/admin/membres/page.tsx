import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canActOnMemberRecord } from '@/lib/permissions';
import { listMembersForAdmin } from '@/lib/membres-admin-list';
import MembresPageClient from './MembresPageClient';
import type { Prisma } from '@prisma/client';
import type { StatutMembre } from '@prisma/client';

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
  const bureauOnly = parseParam(params.bureau) === '1';
  const page = parseInt(parseParam(params.page) || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const baseWhere: Prisma.MemberWhereInput = {};
  if (statusFilter && statusFilter !== 'all') {
    baseWhere.statutMembre = statusFilter as StatutMembre;
  }
  if (typeFilter) {
    // memberType n'existe pas dans le schéma
  }
  if (search) {
    baseWhere.OR = [
      { prenom: { contains: search, mode: 'insensitive' } },
      { nom: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { telephone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const { total, members } = await listMembersForAdmin({
    baseWhere,
    skip: offset,
    take: limit,
    bureauOnly,
  });

  const membersWithPermissions = members.map((member) => ({
    ...member,
    memberType: null as string | null,
    canAct: canActOnMemberRecord(userRole, {
      user: member.user ? { roleSysteme: member.user.role } : null,
    }),
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
      initialBureauOnly={bureauOnly}
      currentUserRole={userRole}
      currentUserId={session.user.id}
    />
  );
}

