import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AppLayoutClient from '@/components/layout/AppLayoutClient';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  // Récupérer les informations utilisateur
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      member: {
        include: {
          affectations: {
            where: {
              statut: 'ACTIF',
            },
            include: {
              poste: true,
              mandat: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect('/connexion');
  }

  const { getAffectationActive, isBureauActif } = await import('@/lib/rbac');

  // Adhérents simples : pas d'intranet sur le site (vie associative hors ligne / WhatsApp, etc.)
  if (user.roleSysteme === 'MEMBER' && !(await isBureauActif(user.id))) {
    redirect('/');
  }

  // Déterminer le rôle et les infos
  const userRole = user.roleSysteme;
  const affectation = await getAffectationActive(user.id);
  const isBureau = await isBureauActif(user.id);

  const userInfo = {
    name: user.member
      ? `${user.member.prenom} ${user.member.nom}`
      : user.email,
    email: user.email,
    poste: affectation?.poste.nom,
    mandat: affectation?.mandat
      ? `${new Date(affectation.mandat.dateDebut).getFullYear()} - ${new Date(affectation.mandat.dateFin).getFullYear()}`
      : undefined,
  };

  return (
    <AppLayoutClient
      userRole={userRole}
      isBureau={isBureau}
      posteNom={affectation?.poste.nom}
      userInfo={userInfo}
    >
      {children}
    </AppLayoutClient>
  );
}



