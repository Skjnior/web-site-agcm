import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, ClipboardList, Users, Calendar, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Administration - AGCM',
  description: 'Tableau de bord administrateur',
};

export default async function AdminDashboardPage() {
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

  // Récupérer les statistiques
  const [
    pendingAdhesions,
    pendingPartenariats,
    pendingDons,
    totalMembers,
    activeMembers,
    totalEvents,
  ] = await Promise.all([
    prisma.demandeAdhesion.count({
      where: { statut: 'EN_ATTENTE' },
    }),
    prisma.demandePartenariat.count({
      where: { statut: 'EN_ATTENTE' },
    }),
    prisma.donationIntent.count({
      where: { statut: 'NOUVEAU' },
    }),
    prisma.member.count(),
    prisma.member.count({
      where: { statutMembre: 'ACTIF' },
    }),
    prisma.event.count(),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">Tableau de bord</h1>
        <p className="text-slate-400 mt-1">Vue d'ensemble de l'activité de l'AGCM</p>
      </div>

      {/* Alertes importantes */}
      {pendingAdhesions > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-900/40 to-orange-900/20 border border-yellow-500/20 rounded-3xl p-6 shadow-lg group backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
            <AlertCircle className="w-48 h-48 text-yellow-500" />
          </div>
          <div className="relative z-10 flex items-start gap-5">
            <div className="p-4 bg-yellow-500/20 backdrop-blur-sm rounded-2xl text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)] border border-yellow-500/30">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-yellow-500">Actions requises</h3>
              <p className="text-yellow-200 mt-1 text-sm md:text-base">
                {`${pendingAdhesions} demande${pendingAdhesions > 1 ? 's' : ''} d'adhésion en attente`}
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <Link href="/admin/demandes/adhesions">
                  <Button size="default" variant="outline" className="border-yellow-500/50 text-yellow-400 bg-yellow-950/50 hover:bg-yellow-500 hover:text-yellow-950 transition-all hover:scale-105 rounded-xl font-medium backdrop-blur-sm shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                    Voir les demandes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          href="/admin/demandes"
          title="Demandes"
          value={pendingAdhesions + pendingPartenariats + pendingDons}
          icon={ClipboardList}
          colorClass="text-blue-400"
          bgClass="bg-blue-500/10"
          borderClass="border-blue-500/20"
          glowClass="bg-blue-500"
        />
        <StatCard
          href="/admin/membres"
          title="Membres actifs"
          value={activeMembers}
          subtext={`sur ${totalMembers}`}
          icon={Users}
          colorClass="text-emerald-400"
          bgClass="bg-emerald-500/10"
          borderClass="border-emerald-500/20"
          glowClass="bg-emerald-500"
        />
        <StatCard
          href="/admin/evenements"
          title="Événements"
          value={totalEvents}
          icon={Calendar}
          colorClass="text-purple-400"
          bgClass="bg-purple-500/10"
          borderClass="border-purple-500/20"
          glowClass="bg-purple-500"
        />
      </div>

      {/* Actions rapides */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
        <h2 className="text-xl font-semibold text-slate-100 mb-6">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link href="/admin/actualites/nouveau">
            <Button className="w-full h-14 rounded-2xl bg-slate-800/50 hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 group shadow-sm flex items-center justify-center gap-3 backdrop-blur-sm">
              <CheckCircle className="h-5 w-5 text-slate-500 group-hover:text-blue-400 drop-shadow-none group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all" />
              <span className="font-medium">Créer Actualité</span>
            </Button>
          </Link>
          <Link href="/admin/demandes">
            <Button className="w-full h-14 rounded-2xl bg-slate-800/50 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 group shadow-sm flex items-center justify-center gap-3 backdrop-blur-sm">
              <ClipboardList className="h-5 w-5 text-slate-500 group-hover:text-indigo-400 drop-shadow-none group-hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)] transition-all" />
              <span className="font-medium">Traiter demandes</span>
            </Button>
          </Link>
          <Link href="/admin/membres">
            <Button className="w-full h-14 rounded-2xl bg-slate-800/50 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group shadow-sm flex items-center justify-center gap-3 backdrop-blur-sm">
              <Users className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 drop-shadow-none group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all" />
              <span className="font-medium">Gérer membres</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Composant interne pour les cartes statistiques
function StatCard({ href, title, value, subtext, icon: Icon, colorClass, bgClass, borderClass, glowClass }: any) {
  return (
    <Link href={href}>
      <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/50 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold tracking-tight text-slate-100 group-hover:scale-105 transition-transform origin-left drop-shadow-sm">
                {value}
              </p>
              {subtext && <p className="text-sm text-slate-500">{subtext}</p>}
            </div>
          </div>
          <div className={`p-4 rounded-2xl ${bgClass} ${borderClass} border shadow-inner transition-transform duration-300 group-hover:rotate-6`}>
            <Icon className={`h-6 w-6 ${colorClass} drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
          </div>
        </div>
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${glowClass} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-700`} />
      </div>
    </Link>
  );
}



