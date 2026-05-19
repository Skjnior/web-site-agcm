import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAdminDashboardChartData } from '@/lib/admin/dashboard-stats';
import AdminDashboardCharts from '@/components/admin/AdminDashboardCharts';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, ClipboardList, Users, Calendar, AlertCircle, Mail, HandHeart, Building2 } from 'lucide-react';

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
    pendingContactMessages,
    totalMembers,
    activeMembers,
    totalEvents,
    dashboardCharts,
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
    prisma.messageContact.count({
      where: { statut: 'NOUVEAU' },
    }),
    prisma.member.count(),
    prisma.member.count({
      where: { statutMembre: 'ACTIF' },
    }),
    prisma.event.count(),
    getAdminDashboardChartData(),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-3xl font-bold text-transparent">
          Tableau de bord
        </h1>
        <p className="mt-1 text-slate-400">Vue d&apos;ensemble de l&apos;activité de l&apos;AGCM</p>
      </div>

      {/* Alertes : demandes à traiter (visible dès l'arrivée sur le tableau de bord) */}
      {pendingAdhesions + pendingPartenariats + pendingDons + pendingContactMessages > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-950/50 via-orange-950/30 to-slate-900/40 p-6 shadow-lg backdrop-blur-md">
          <div className="pointer-events-none absolute -right-8 -top-8 opacity-[0.07]">
            <AlertCircle className="h-44 w-44 text-amber-400" />
          </div>
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-start">
            <div className="shrink-0 rounded-2xl border border-amber-500/35 bg-amber-500/15 p-4 text-amber-400">
              <AlertCircle className="h-7 w-7" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold text-amber-200">Actions requises</h3>
              <p className="mt-1 text-sm text-amber-100/80">
                Des éléments nécessitent votre attention. Accédez directement aux listes concernées.
              </p>
              <ul className="mt-5 space-y-3">
                {pendingAdhesions > 0 && (
                  <li className="flex flex-col gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" aria-hidden />
                      <div>
                        <p className="font-medium text-slate-100">Adhésions en attente</p>
                        <p className="text-sm text-slate-400">
                          {pendingAdhesions} demande{pendingAdhesions > 1 ? 's' : ''} à traiter
                        </p>
                      </div>
                    </div>
                    <Link href="/admin/demandes/adhesions" className="shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-blue-500/40 text-blue-300 hover:bg-blue-500/15 sm:w-auto"
                      >
                        Voir les adhésions
                      </Button>
                    </Link>
                  </li>
                )}
                {pendingDons > 0 && (
                  <li className="flex flex-col gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <HandHeart className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" aria-hidden />
                      <div>
                        <p className="font-medium text-slate-100">Intentions de don</p>
                        <p className="text-sm text-slate-400">
                          {pendingDons} signalement{pendingDons > 1 ? 's' : ''} non pris en charge
                        </p>
                      </div>
                    </div>
                    <Link href="/admin/demandes/dons" className="shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-purple-500/40 text-purple-300 hover:bg-purple-500/15 sm:w-auto"
                      >
                        Voir les dons
                      </Button>
                    </Link>
                  </li>
                )}
                {pendingContactMessages > 0 && (
                  <li className="flex flex-col gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" aria-hidden />
                      <div>
                        <p className="font-medium text-slate-100">Messages contact</p>
        <p className="mt-1 text-slate-400">
                          {pendingContactMessages} nouveau
                          {pendingContactMessages > 1 ? 'x' : ''} message
                          {pendingContactMessages > 1 ? 's' : ''} via le formulaire contact
                        </p>
                      </div>
                    </div>
                    <Link href="/admin/messages-contact" className="shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15 sm:w-auto"
                      >
                        Ouvrir les messages
                      </Button>
                    </Link>
                  </li>
                )}
                {pendingPartenariats > 0 && (
                  <li className="flex flex-col gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                      <div>
                        <p className="font-medium text-slate-100">Partenariats en attente</p>
                        <p className="text-sm text-slate-400">
                          {pendingPartenariats} demande{pendingPartenariats > 1 ? 's' : ''} à examiner
                        </p>
                      </div>
                    </div>
                    <Link href="/admin/demandes/partenariats" className="shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/15 sm:w-auto"
                      >
                        Voir les partenariats
                      </Button>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          href="/admin/demandes"
          title="Demandes"
          value={pendingAdhesions + pendingPartenariats + pendingDons + pendingContactMessages}
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

      <AdminDashboardCharts data={dashboardCharts} />

      {/* Actions rapides */}
      <div className="admin-glass relative overflow-hidden rounded-3xl p-8 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        <h2 className="mb-6 text-xl font-semibold text-slate-100">Actions rapides</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/actualites/nouveau">
            <Button className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-800/50 text-slate-300 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/20 hover:text-blue-400">
              <CheckCircle className="h-5 w-5 text-slate-500 transition-all group-hover:text-blue-400 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
              <span className="font-medium">Créer Actualité</span>
            </Button>
          </Link>
          <Link href="/admin/demandes">
            <Button className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-800/50 text-slate-300 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:bg-indigo-500/20 hover:text-indigo-400">
              <ClipboardList className="h-5 w-5 text-slate-500 transition-all group-hover:text-indigo-400 group-hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
              <span className="font-medium">Traiter demandes</span>
            </Button>
          </Link>
          <Link href="/admin/membres">
            <Button className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-800/50 text-slate-300 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:text-emerald-400">
              <Users className="h-5 w-5 text-slate-500 transition-all group-hover:text-emerald-400 group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
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
      <div className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/40 p-6 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-400">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="origin-left text-4xl font-bold tracking-tight text-slate-100 transition-transform group-hover:scale-105 drop-shadow-sm">
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



