import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ProfilForm from '@/components/app/ProfilForm';

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
      user: {
        select: {
          email: true,
        },
      },
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
  });

  if (!member) {
    redirect('/connexion');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">Mon profil</h1>
        <p className="text-slate-400 mt-1">Gérez vos informations personnelles</p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-8 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
        <ProfilForm member={member} />
      </div>
    </div>
  );
}



