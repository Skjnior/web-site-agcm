import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Calendar, Newspaper, ArrowRight, MapPin, User, LayoutDashboard } from 'lucide-react';
import MemberPageShell from '@/components/app/MemberPageShell';

export const metadata: Metadata = {
  title: 'Tableau de bord - AGCM',
  description: 'Votre espace membre',
};

export default async function MemberDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { member: true },
  });

  if (!user || user.roleSysteme !== 'MEMBER') {
    redirect('/dashboard');
  }

  const member = user.member;
  if (!member) redirect('/connexion');

  const now = new Date();

  const [upcomingEvents, recentContents, eventsCount, contentsCount] = await Promise.all([
    prisma.event.findMany({
      where: { afficheSite: true, dateDebut: { gte: now } },
      take: 5,
      orderBy: { dateDebut: 'asc' },
      select: {
        id: true,
        titre: true,
        slug: true,
        dateDebut: true,
        lieu: true,
        statut: true,
      },
    }),
    prisma.content.findMany({
      where: {
        visibiliteCible: 'PUBLIC_SITE',
        statutWorkflow: 'PUBLIE',
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        titre: true,
        type: true,
        createdAt: true,
        auteurPoste: { select: { nom: true } },
      },
    }),
    prisma.event.count({ where: { afficheSite: true, dateDebut: { gte: now } } }),
    prisma.content.count({
      where: {
        visibiliteCible: 'PUBLIC_SITE',
        statutWorkflow: 'PUBLIE',
      },
    }),
  ]);

  const TYPE_LABELS: Record<string, string> = {
    ACTUALITE: 'Actualité',
    ACTIVITE: 'Activité',
    PARTAGE: 'Partage',
    ANNONCE: 'Annonce',
  };

  return (
    <MemberPageShell
      title={`Bienvenue, ${member.prenom} !`}
      description="Votre espace membre AGCM"
      icon={LayoutDashboard}
      iconClassName="text-emerald-400"
      actions={
        <Link
          href="/app/dashboard/profil"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700/50 hover:text-white"
        >
          <User className="h-4 w-4" />
          Mon profil
        </Link>
      }
    >
      <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/app/dashboard/mes-evenements"
          className="admin-panel block p-6 transition-all hover:border-blue-500/30 hover:bg-slate-800/40 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Événements à venir</p>
              <p className="text-3xl font-bold text-slate-100 mt-1">{eventsCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
            Voir mes événements <ArrowRight className="h-4 w-4" />
          </p>
        </Link>

        <Link
          href="/app/dashboard/mes-activites"
          className="admin-panel block p-6 transition-all hover:border-emerald-500/30 hover:bg-slate-800/40 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Actualités & activités</p>
              <p className="text-3xl font-bold text-slate-100 mt-1">{contentsCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Newspaper className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
            Découvrir <ArrowRight className="h-4 w-4" />
          </p>
        </Link>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Événements à venir */}
        <div className="admin-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-700/80 p-4">
            <h2 className="text-lg font-semibold text-slate-200">Événements à venir</h2>
            <Link
              href="/app/dashboard/mes-evenements"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Voir tout
            </Link>
          </div>
          <div className="p-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aucun événement prévu.</p>
                <Link
                  href="/evenements"
                  className="inline-block mt-3 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Voir le calendrier
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/evenements/${event.slug}`}
                    className="block p-4 rounded-xl border border-slate-800/30 bg-slate-800/10 hover:bg-slate-800/40 hover:border-blue-500/30 transition-all group"
                  >
                    <h3 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                      {event.titre}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                      <span>
                        {new Date(event.dateDebut).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      {event.lieu && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.lieu}
                          </span>
                        </>
                      )}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actualités récentes */}
        <div className="admin-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-700/80 p-4">
            <h2 className="text-lg font-semibold text-slate-200">Dernières actualités</h2>
            <Link
              href="/app/dashboard/mes-activites"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Voir tout
            </Link>
          </div>
          <div className="p-4">
            {recentContents.length === 0 ? (
              <div className="text-center py-8">
                <Newspaper className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aucune actualité récente.</p>
                <Link
                  href="/actualites"
                  className="inline-block mt-3 text-emerald-400 hover:text-emerald-300 text-sm"
                >
                  Voir les actualités
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentContents.map((content) => (
                  <Link
                    key={content.id}
                    href={`/actualites/${content.id}`}
                    className="block p-4 rounded-xl border border-slate-800/30 bg-slate-800/10 hover:bg-slate-800/40 hover:border-emerald-500/30 transition-all group"
                  >
                    <h3 className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {content.titre}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs">
                        {TYPE_LABELS[content.type] || content.type}
                      </span>
                      <span>{content.auteurPoste.nom}</span>
                      <span>•</span>
                      <span>
                        {new Date(content.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </MemberPageShell>
  );
}
