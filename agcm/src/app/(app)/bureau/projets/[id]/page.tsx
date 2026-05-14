import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, FolderOpen, ImageIcon, Pencil, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/lib/prisma';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ProjetMediaType, ProjetStatut } from '@prisma/client';
import { isLikelyImageAssetUrl } from '@/lib/media-display-url';

const STATUT_LABELS: Record<ProjetStatut, string> = {
  BROUILLON: 'Brouillon',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  SUSPENDU: 'Suspendu',
  ANNULE: 'Annulé',
};

function mediaTypeLabel(t: ProjetMediaType): string {
  return t === 'IMAGE' ? 'Image' : 'Document';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const projet = await prisma.projet.findUnique({
    where: { id },
    select: { titre: true },
  });
  if (!projet) return { title: 'Projet — Bureau' };
  return { title: `${projet.titre} — Bureau` };
}

export default async function BureauProjetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { ctx } = await assertBureauModuleOrRedirect('projets');

  const projet = await prisma.projet.findFirst({
    where: {
      id,
      responsablePosteId: { in: ctx.posteIds },
      mandatId: ctx.mandatId,
    },
    include: {
      medias: { orderBy: { ordre: 'asc' } },
      partenaires: {
        include: { partner: { select: { nom: true, siteUrl: true } } },
      },
    },
  });

  if (!projet) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 pb-10 text-slate-100 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/bureau/projets">
          <Button variant="outline" size="sm" className="border-slate-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Liste
          </Button>
        </Link>
        <Link href={`/bureau/projets/${projet.id}/edit`}>
          <Button size="sm" className="bg-slate-100 text-slate-900 hover:bg-white">
            <Pencil className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </Link>
      </div>

      <header className="space-y-4 border-b border-slate-700/60 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-slate-600 text-slate-200">
            {STATUT_LABELS[projet.statut]}
          </Badge>
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            {projet.visibiliteSite ? 'Visible sur le site' : 'Privé'}
          </Badge>
        </div>
        <div className="flex items-start gap-3">
          <FolderOpen className="mt-1 h-8 w-8 shrink-0 text-violet-400" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{projet.titre}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
              <Calendar className="h-4 w-4 shrink-0" />
              Créé le {format(new Date(projet.createdAt), 'dd MMM yyyy', { locale: fr })} — mis à jour le{' '}
              {format(new Date(projet.updatedAt), 'dd MMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-200">Objectif</h2>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5">
          <p className="whitespace-pre-wrap text-slate-300">{projet.objectif}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-200">Description</h2>
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5">
          <p className="whitespace-pre-wrap text-slate-300">{projet.description}</p>
        </div>
      </section>

      {projet.actions?.trim() ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-200">Actions prévues</h2>
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5">
            <p className="whitespace-pre-wrap text-slate-300">{projet.actions}</p>
          </div>
        </section>
      ) : null}

      {projet.partenaires.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-200">Partenaires</h2>
          <ul className="rounded-xl border border-slate-700/50 bg-slate-800/40 divide-y divide-slate-700/40">
            {projet.partenaires.map(({ partnerId, partner }) => (
              <li
                key={partnerId}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <span className="font-medium text-slate-200">{partner.nom}</span>
                {partner.siteUrl ? (
                  <a
                    href={partner.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-violet-400 hover:underline"
                  >
                    Site
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {projet.medias.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">
            Médias ({projet.medias.length})
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {projet.medias.map((m) => {
              const img = m.type === 'IMAGE' && isLikelyImageAssetUrl(m.url);
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
                      {mediaTypeLabel(m.type)} · ordre {m.ordre}
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
