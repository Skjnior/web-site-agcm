import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canActOnUser } from '@/lib/permissions';
import MemberDetailClient from './MemberDetailClient';

export const metadata: Metadata = {
  title: 'Détail membre - Admin AGCM',
  description: 'Détails et gestion d\'un membre',
};

type MemberDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberDetailPage({ params }: MemberDetailPageProps) {
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
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
      },
      affectations: {
        where: { statut: 'ACTIF' },
        include: {
          poste: {
            select: {
              id: true,
              nom: true,
              description: true,
              estBureau: true,
            },
          },
          mandat: {
            select: {
              id: true,
              titre: true,
              dateDebut: true,
              dateFin: true,
              statut: true,
            },
          },
        },
        orderBy: {
          dateDebut: 'desc',
        },
      },
    },
  });

  // S'assurer que affectations est toujours un tableau
  if (member && !member.affectations) {
    member.affectations = [];
  }

  if (!member) {
    notFound();
  }

  // Vérifier les permissions
  const canAct = canActOnUser(userRole, member.user.roleSysteme);

  return (
    <MemberDetailClient
      member={member}
      currentUserRole={userRole}
      currentUserId={session.user.id}
      canAct={canAct}
    />
  );
}
