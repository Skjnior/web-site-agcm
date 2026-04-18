import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users, HandHeart, Building2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Demandes - Administration',
  description: 'Gérer les demandes d\'adhésion, partenariat et dons',
};

export default async function AdminDemandesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || (user.roleSysteme !== 'ADMIN' && user.roleSysteme !== 'SUPER_ADMIN')) {
    redirect('/dashboard');
  }

  // Compter les demandes en attente
  const [pendingAdhesions, pendingPartenariats, pendingDons] = await Promise.all([
    prisma.demandeAdhesion.count({ where: { statut: 'EN_ATTENTE' } }),
    prisma.demandePartenariat.count({ where: { statut: 'EN_ATTENTE' } }),
    prisma.donationIntent.count({ where: { statut: 'NOUVEAU' } }),
  ]);

  return (
    <div className="admin-page flex flex-col pointer-events-auto">
      <main className="flex-1 p-4 md:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="admin-glass flex flex-col justify-between gap-4 rounded-3xl p-8 shadow-sm md:flex-row md:items-center">
            <div>
              <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
                Gestion des demandes
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Traiter les demandes d&apos;adhésion, partenariat et intentions de dons
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/demandes/adhesions" className="group">
              <div className="admin-glass relative h-full overflow-hidden rounded-3xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative z-10 mb-4 flex items-start justify-between">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm transition-transform duration-300 group-hover:rotate-6 dark:border-blue-500/20 dark:bg-blue-950/40">
                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  {pendingAdhesions > 0 && (
                    <span className="animate-pulse rounded-full border border-red-200 bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:border-red-800/50 dark:bg-red-950/50 dark:text-red-300">
                      {pendingAdhesions} attente
                    </span>
                  )}
                </div>
                <div className="relative z-10">
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">Adhésions</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Gérer les inscriptions et devenir membre de l&apos;AGCM.
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-blue-50 opacity-50 blur-2xl transition-transform duration-700 group-hover:scale-150 dark:bg-blue-900/20" />
              </div>
            </Link>

            <Link href="/admin/demandes/partenariats" className="group">
              <div className="admin-glass relative h-full overflow-hidden rounded-3xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative z-10 mb-4 flex items-start justify-between">
                  <div className="rounded-2xl border border-green-100 bg-green-50 p-4 shadow-sm transition-transform duration-300 group-hover:rotate-6 dark:border-emerald-500/20 dark:bg-emerald-950/40">
                    <Building2 className="h-8 w-8 text-green-600 dark:text-emerald-400" />
                  </div>
                  {pendingPartenariats > 0 && (
                    <span className="animate-pulse rounded-full border border-red-200 bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:border-red-800/50 dark:bg-red-950/50 dark:text-red-300">
                      {pendingPartenariats} attente
                    </span>
                  )}
                </div>
                <div className="relative z-10">
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">Partenariats</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Étudier les propositions de collaborations et partenariats.
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-green-50 opacity-50 blur-2xl transition-transform duration-700 group-hover:scale-150 dark:bg-emerald-900/20" />
              </div>
            </Link>

            <Link href="/admin/demandes/dons" className="group">
              <div className="admin-glass relative h-full overflow-hidden rounded-3xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="relative z-10 mb-4 flex items-start justify-between">
                  <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 shadow-sm transition-transform duration-300 group-hover:rotate-6 dark:border-purple-500/20 dark:bg-purple-950/40">
                    <HandHeart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  {pendingDons > 0 && (
                    <span className="animate-pulse rounded-full border border-red-200 bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:border-red-800/50 dark:bg-red-950/50 dark:text-red-300">
                      {pendingDons} attente
                    </span>
                  )}
                </div>
                <div className="relative z-10">
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">Dons</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Traiter les intentions de dons et les dons manuels reçus.
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-purple-50 opacity-50 blur-2xl transition-transform duration-700 group-hover:scale-150 dark:bg-purple-900/20" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
