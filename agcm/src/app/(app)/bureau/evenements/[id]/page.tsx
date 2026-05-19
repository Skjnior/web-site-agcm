import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Pencil,
  ImageIcon,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isLikelyImageAssetUrl } from '@/lib/media-display-url';

function statutBadgeVariant(statut: string): 'default' | 'soumis' | 'approuve' {
  if (statut === 'PASSE') return 'default';
  if (statut === 'EN_COURS') return 'soumis';
  return 'approuve';
}

function statutLabel(statut: string): string {
  if (statut === 'PASSE') return 'Terminé';
  if (statut === 'EN_COURS') return 'En cours';
  return 'À venir';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    select: { titre: true },
  });
  if (!event) return { title: 'Événement — Bureau' };
  return { title: `${event.titre} — Bureau` };
}

export default async function BureauEvenementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { ctx } = await assertBureauModuleOrRedirect('evenements');

  const event = await prisma.event.findFirst({
    where: {
      id,
      createdByPosteId: { in: ctx.posteIds },
      mandatId: ctx.mandatId,
    },
    include: {
      medias: { orderBy: { ordre: 'asc' } },
    },
  });

  if (!event) {
    notFound();
  }

  const fmtDateTime = (d: Date) =>
    format(d, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 pb-10 text-slate-100 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/bureau/evenements">
            <Button variant="outline" size="sm" className="border-slate-600">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Liste
            </Button>
          </Link>
          <Link href={`/bureau/evenements/${event.id}/edit`}>
            <Button size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
        </div>
        {event.afficheSite ? (
          <Button variant="outline" size="sm" className="border-slate-600" asChild>
            <a href={`/evenements/${event.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Page publique
            </a>
          </Button>
        ) : null}
      </div>

      <header className="space-y-4 border-b border-slate-700/60 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statutBadgeVariant(event.statut)}>{statutLabel(event.statut)}</Badge>
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            {event.afficheSite ? 'Affiché sur le site' : 'Non affiché'}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{event.titre}</h1>
        <dl className="flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:flex-wrap">
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <dt className="sr-only">Début</dt>
              <dd>{fmtDateTime(event.dateDebut)}</dd>
              {event.dateFin ? (
                <>
                  <dt className="mt-1 sr-only">Fin</dt>
                  <dd className="mt-1 text-slate-400">
                    Fin&nbsp;: {fmtDateTime(event.dateFin)}
                  </dd>
                </>
              ) : null}
            </div>
          </div>
          {event.lieu ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <span>{event.lieu}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              Créé le {format(new Date(event.createdAt), 'dd MMM yyyy', { locale: fr })} — mis à jour le{' '}
              {format(new Date(event.updatedAt), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
        </dl>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-200">Description</h2>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5">
          <p className="whitespace-pre-wrap text-slate-300">{event.description}</p>
        </div>
      </section>

      {event.medias.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">
            Médias ({event.medias.length})
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {event.medias.map((m) => {
              const img = isLikelyImageAssetUrl(m.url);
              return (
                <li
                  key={m.id}
                  className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/40"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/40 px-3 py-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      {img ? (
                        <ImageIcon className="h-3.5 w-3.5" />
                      ) : (
                        <FileText className="h-3.5 w-3.5" />
                      )}
                      {m.isPrincipale ? 'Principale' : `Ordre ${m.ordre}`}
                    </span>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:underline"
                    >
                      Ouvrir
                    </a>
                  </div>
                  <div className="p-3">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URLs uploads variées
                      <img src={m.url} alt="" className="max-h-56 w-full rounded-lg object-contain" />
                    ) : (
                      <p className="truncate text-sm text-slate-400">{m.url}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
