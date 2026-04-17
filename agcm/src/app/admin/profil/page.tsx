import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfilForm from '@/components/app/ProfilForm';

export const metadata: Metadata = {
  title: 'Mon profil - Administration AGCM',
  description: 'Modifier vos informations personnelles et votre photo',
};

export default async function AdminProfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
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
    return (
      <div className="max-w-2xl mx-auto rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-amber-100">
        <h1 className="text-xl font-semibold mb-2">Fiche membre indisponible</h1>
        <p className="text-amber-200/90 text-sm leading-relaxed">
          Aucune fiche membre n’est liée à votre compte. Un super administrateur peut associer un profil
          membre à votre utilisateur pour activer cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
          Mon profil
        </h1>
        <p className="text-slate-400 mt-1">
          Vos informations affichées sur le site (ex. bureau actuel) et votre photo
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
        <ProfilForm
          member={member}
          dark
          userEmail={member.user.email}
          allowImageUpload
        />
      </div>
    </div>
  );
}
