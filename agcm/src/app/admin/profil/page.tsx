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
        <h1 className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
          Mon profil
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Vos informations affichées sur le site (ex. bureau actuel) et votre photo
        </p>
      </div>

      <div className="admin-glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        <ProfilForm
          member={member}
          userEmail={member.user.email}
          allowImageUpload
        />
      </div>
    </div>
  );
}
