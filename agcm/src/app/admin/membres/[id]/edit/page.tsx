import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canActOnMemberRecord } from '@/lib/permissions';
import EditMemberClient from './EditMemberClient';

export const metadata: Metadata = {
  title: 'Modifier membre - Admin AGCM',
  description: 'Modifier les informations d\'un membre',
};

type EditMemberPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect('/connexion');
  }

  // Vérifier que l'utilisateur est admin ou super admin
  const userRole = (session.user as any).roleSysteme || session.user.role;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    redirect('/dashboard');
  }

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          roleSysteme: true,
        },
      },
    },
  });

  if (!member) {
    notFound();
  }

  // Vérifier les permissions
  const canAct = canActOnMemberRecord(userRole, member);
  if (!canAct) {
    redirect('/admin/membres');
  }

  return (
    <EditMemberClient
      member={member}
      currentUserRole={userRole}
    />
  );
}


