import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Dashboard - AGCM',
  description: 'Tableau de bord membre',
};

export default async function MemberDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.roleSysteme !== 'MEMBER') {
    redirect('/dashboard');
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.user.id },
  });

  if (!member) {
    redirect('/connexion');
  }

  const upcomingEvents = await prisma.event.findMany({
    where: {
      afficheSite: true,
      dateDebut: { gte: new Date() },
    },
    take: 5,
    orderBy: { dateDebut: 'asc' },
  });

  const recentContents = await prisma.content.findMany({
    where: {
      visibiliteCible: 'PUBLIC_SITE',
      statutWorkflow: 'PUBLIE',
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      auteurPoste: { select: { nom: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
          Bienvenue, {member?.prenom || 'Membre'} !
        </h1>
        <p className="text-slate-400 mt-1">Votre espace membre</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 rounded-full blur-3xl -z-10" />

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Événements à venir</p>
              <p className="text-4xl font-bold text-slate-100 mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">{upcomingEvents.length}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 shadow-inner group-hover:rotate-6 transition-transform duration-300">
              <svg className="h-7 w-7 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Actualités publiées</p>
              <p className="text-4xl font-bold text-slate-100 mt-2 tracking-tight group-hover:scale-105 transition-transform origin-left">{recentContents.length}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 shadow-inner group-hover:rotate-6 transition-transform duration-300">
              <svg className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Événements à venir */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="p-6 border-b border-slate-800/50 bg-slate-900/20">
            <h2 className="text-lg font-semibold text-slate-200">Événements à venir</h2>
          </div>
          <div className="p-6">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">Aucun événement prévu prochainement.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="group p-4 rounded-2xl border border-slate-800/30 bg-slate-800/10 hover:bg-slate-800/40 hover:border-blue-500/30 transition-all duration-300">
                    <h3 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{event.titre}</h3>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500/50" />
                      {new Date(event.dateDebut).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      {event.lieu && <span className="text-slate-400 ml-1">• {event.lieu}</span>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actualités récentes */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="p-6 border-b border-slate-800/50 bg-slate-900/20">
            <h2 className="text-lg font-semibold text-slate-200">Dernières actualités</h2>
          </div>
          <div className="p-6">
            {recentContents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm">Aucune actualité récente à afficher.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentContents.map((content) => (
                  <div key={content.id} className="group p-4 rounded-2xl border border-slate-800/30 bg-slate-800/10 hover:bg-slate-800/40 hover:border-emerald-500/30 transition-all duration-300">
                    <h3 className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">{content.titre}</h3>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs">{content.auteurPoste.nom}</span>
                      <span className="mx-1">•</span>
                      {new Date(content.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
