import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClipboardList, Users, HandHeart, Building2 } from 'lucide-react';

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
          <div className="admin-glass rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Gestion des demandes</h1>
              <p className="text-slate-500 mt-1">Traiter les demandes d'adhésion, partenariat et intentions de dons</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/demandes/adhesions" className="group">
              <div className="admin-glass relative h-full overflow-hidden rounded-3xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between relative z-10 mb-4">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm transition-transform duration-300 group-hover:rotate-6">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  {pendingAdhesions > 0 && (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-700 border border-red-200 animate-pulse">
                      {pendingAdhesions} attente
                    </span>
                  )}
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Adhésions</h3>
                  <p className="text-sm text-slate-500">
                    Gérer les inscriptions et devenir membre de l'AGCM.
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-50 opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>
            </Link>

            <Link href="/admin/demandes/partenariats" className="group">
              <div className="admin-glass relative h-full overflow-hidden rounded-3xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between relative z-10 mb-4">
                  <div className="p-4 rounded-2xl bg-green-50 border border-green-100 shadow-sm transition-transform duration-300 group-hover:rotate-6">
                    <Building2 className="h-8 w-8 text-green-600" />
                  </div>
                  {pendingPartenariats > 0 && (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-700 border border-red-200 animate-pulse">
                      {pendingPartenariats} attente
                    </span>
                  )}
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Partenariats</h3>
                  <p className="text-sm text-slate-500">
                    Étudier les propositions de collaborations et partenariats.
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-green-50 opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>
            </Link>

            <Link href="/admin/demandes/dons" className="group">
              <div className="admin-glass relative h-full overflow-hidden rounded-3xl p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between relative z-10 mb-4">
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 shadow-sm transition-transform duration-300 group-hover:rotate-6">
                    <HandHeart className="h-8 w-8 text-purple-600" />
                  </div>
                  {pendingDons > 0 && (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-700 border border-red-200 animate-pulse">
                      {pendingDons} attente
                    </span>
                  )}
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Dons</h3>
                  <p className="text-sm text-slate-500">
                    Traiter les intentions de dons et les dons manuels reçus.
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-50 opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
