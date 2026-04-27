import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfilForm from '@/components/app/ProfilForm';
import MemberPageShell from '@/components/app/MemberPageShell';
import { User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mon profil - AGCM',
  description: 'Gérer votre profil',
};

export default async function ProfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { email: true } },
      affectations: {
        where: { statut: 'ACTIF' },
        include: {
          poste: true,
          mandat: true,
        },
      },
    },
  });

  if (!member) {
    redirect('/connexion');
  }

  return (
    <MemberPageShell
      title="Mon profil"
      description="Gérez vos informations personnelles"
      icon={User}
      iconClassName="text-sky-400"
      narrow
    >
      <div className="admin-panel relative overflow-hidden p-6 sm:p-8">
        <div className="-z-10 absolute top-0 right-0 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        <ProfilForm member={member} dark />
      </div>
    </MemberPageShell>
  );
}
