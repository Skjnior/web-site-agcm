import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Calendar, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import MemberPageShell from '@/components/app/MemberPageShell';

export const metadata: Metadata = {
  title: 'Mes événements - AGCM',
  description: 'Événements à venir et passés',
};

const STATUT_LABELS: Record<string, { label: string; color: string }> = {
  PASSE: { label: 'Passé', color: 'bg-slate-600/30 text-slate-400' },
  EN_COURS: { label: 'En cours', color: 'bg-emerald-500/20 text-emerald-400' },
  A_VENIR: { label: 'À venir', color: 'bg-blue-500/20 text-blue-400' },
};

export default async function MesEvenementsPage() {
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

  const now = new Date();

  const [aVenir, enCours, passes] = await Promise.all([
    prisma.event.findMany({
      where: { afficheSite: true, dateDebut: { gt: now } },
      orderBy: { dateDebut: 'asc' },
      include: {
        medias: { where: { isPrincipale: true }, take: 1 },
        createdByPoste: { select: { nom: true } },
      },
    }),
    prisma.event.findMany({
      where: {
        afficheSite: true,
        dateDebut: { lte: now },
        dateFin: { gte: now },
      },
      orderBy: { dateDebut: 'asc' },
      include: {
        medias: { where: { isPrincipale: true }, take: 1 },
        createdByPoste: { select: { nom: true } },
      },
    }),
    prisma.event.findMany({
      where: {
        afficheSite: true,
        OR: [
          { dateFin: { lt: now } },
          { dateFin: null, dateDebut: { lt: now } },
        ],
      },
      orderBy: { dateDebut: 'desc' },
      take: 10,
      include: {
        medias: { where: { isPrincipale: true }, take: 1 },
        createdByPoste: { select: { nom: true } },
      },
    }),
  ]);

  const EventCard = ({
    event,
    showStatut = true,
  }: {
    event: (typeof aVenir)[0];
    showStatut?: boolean;
  }) => {
    const statutInfo = STATUT_LABELS[event.statut] || STATUT_LABELS.A_VENIR;
    const imageUrl = event.medias[0]?.url;

    return (
      <Link
        href={`/evenements/${event.slug}`}
        className="admin-panel group block overflow-hidden transition-all hover:border-blue-500/30 hover:bg-slate-800/40"
      >
        <div className="flex flex-col sm:flex-row">
          {imageUrl && (
            <div className="sm:w-48 h-32 sm:h-auto bg-slate-800 relative flex-shrink-0">
              <img
                src={imageUrl}
                alt={event.titre}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {showStatut && (
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statutInfo.color}`}>
                  {statutInfo.label}
                </span>
              )}
              <span className="text-xs text-slate-500">{event.createdByPoste.nom}</span>
            </div>
            <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
              {event.titre}
            </h3>
            <p className="text-sm text-slate-500 mt-2 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(event.dateDebut).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {event.lieu && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.lieu}
                </span>
              )}
            </p>
            <p className="text-sm text-blue-400 mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
              Voir les détails <ArrowRight className="h-4 w-4" />
            </p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <MemberPageShell
      title="Mes événements"
      description="Découvrez et participez aux événements de l'association"
      icon={Calendar}
      iconClassName="text-blue-400"
      actions={
        <Link
          href="/evenements"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
        >
          <ExternalLink className="h-4 w-4" />
          Calendrier complet
        </Link>
      }
    >
      <div className="space-y-10">
      {/* À venir */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">À venir</h2>
        {aVenir.length === 0 ? (
          <div className="admin-panel p-12 text-center">
            <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">Aucun événement à venir.</p>
            <Link href="/evenements" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
              Voir le calendrier
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {aVenir.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* En cours */}
      {enCours.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-200 mb-4">En cours</h2>
          <div className="space-y-4">
            {enCours.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Passés */}
      {passes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Événements passés</h2>
          <div className="space-y-4">
            {passes.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
      </div>
    </MemberPageShell>
  );
}
