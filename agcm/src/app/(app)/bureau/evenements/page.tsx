import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import BureauRowEditDeleteActions from '@/components/bureau/BureauRowEditDeleteActions';
import { Calendar, Plus, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata: Metadata = {
  title: 'Événements - Bureau',
  description: 'Gérer les événements',
};

type AfficheFilter = 'ALL' | 'oui' | 'non';

function buildEvenementsSearchParams(opts: {
  q: string;
  statut: string;
  affiche: AfficheFilter;
  limit: number;
  page: number;
}) {
  const p = new URLSearchParams();
  if (opts.q.trim()) p.set('q', opts.q.trim());
  if (opts.statut && opts.statut !== 'ALL') p.set('statut', opts.statut);
  if (opts.affiche !== 'ALL') p.set('affiche', opts.affiche);
  if (opts.limit !== 20) p.set('limit', String(opts.limit));
  if (opts.page > 1) p.set('page', String(opts.page));
  return p.toString();
}

export default async function BureauEvenementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statut?: string; affiche?: string; page?: string; limit?: string }>;
}) {
  const params = await searchParams;

  const { ctx } = await assertBureauModuleOrRedirect('evenements');

  const q = params.q || '';
  const statut = params.statut || 'ALL';
  const afficheRaw = params.affiche || 'ALL';
  const affiche: AfficheFilter =
    afficheRaw === 'oui' || afficheRaw === 'non' ? afficheRaw : 'ALL';

  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const rawLimit = parseInt(params.limit || '20', 10);
  const limit = Math.min(100, Math.max(1, isNaN(rawLimit) ? 20 : rawLimit));
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {
    createdByPosteId: { in: ctx.posteIds },
    mandatId: ctx.mandatId,
  };

  if (statut !== 'ALL') {
    where.statut = statut;
  }
  if (affiche === 'oui') {
    where.afficheSite = true;
  }
  if (affiche === 'non') {
    where.afficheSite = false;
  }
  if (q.trim()) {
    where.OR = [
      { titre: { contains: q.trim(), mode: 'insensitive' } },
      { description: { contains: q.trim(), mode: 'insensitive' } },
      { lieu: { contains: q.trim(), mode: 'insensitive' } },
    ];
  }

  const [total, evenements] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { dateDebut: 'desc' },
      skip: offset,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;
  const stableBase = (pageNum: number) =>
    buildEvenementsSearchParams({ q, statut, affiche, limit, page: pageNum });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Mes événements</h1>
          <p className="mt-1 text-slate-400">
            Événements créés depuis votre poste sur le mandat en cours ({total})
          </p>
        </div>
        <Link href="/bureau/evenements/nouveau" className="shrink-0">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel événement
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
        <form method="get" className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="min-w-0 flex-1 lg:max-w-md">
            <Label htmlFor="be-q" className="text-xs font-medium text-slate-400">
              Recherche
            </Label>
            <Input
              id="be-q"
              name="q"
              defaultValue={q}
              placeholder="Titre, description, lieu…"
              className="mt-1.5 border-slate-600 bg-slate-900/50 text-slate-100"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[160px]">
            <Label htmlFor="be-statut" className="text-xs font-medium text-slate-400">
              Statut
            </Label>
            <select
              id="be-statut"
              name="statut"
              defaultValue={statut}
              className="mt-1.5 flex h-10 w-full rounded-md border border-slate-600 bg-slate-900/50 px-3 text-sm text-slate-100"
            >
              <option value="ALL">Tous</option>
              <option value="PASSE">Terminé</option>
              <option value="EN_COURS">En cours</option>
              <option value="A_VENIR">À venir</option>
            </select>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[160px]">
            <Label htmlFor="be-affiche" className="text-xs font-medium text-slate-400">
              Site public
            </Label>
            <select
              id="be-affiche"
              name="affiche"
              defaultValue={affiche}
              className="mt-1.5 flex h-10 w-full rounded-md border border-slate-600 bg-slate-900/50 px-3 text-sm text-slate-100"
            >
              <option value="ALL">Tous</option>
              <option value="oui">Affiché</option>
              <option value="non">Non affiché</option>
            </select>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[100px]">
            <Label htmlFor="be-limit" className="text-xs font-medium text-slate-400">
              Par page
            </Label>
            <select
              id="be-limit"
              name="limit"
              defaultValue={String(limit)}
              className="mt-1.5 flex h-10 w-full rounded-md border border-slate-600 bg-slate-900/50 px-3 text-sm text-slate-100"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:pb-0.5">
            <Button type="submit" className="w-full sm:w-auto">
              Filtrer
            </Button>
            <Button type="button" variant="outline" className="w-full border-slate-600 sm:w-auto" asChild>
              <Link href="/bureau/evenements">Réinitialiser</Link>
            </Button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50">
        {evenements.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <p className="text-slate-400">
              Aucun événement pour ces filtres. Essayez « Réinitialiser » ou élargissez la recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="border-b border-slate-700/50 bg-slate-800/90">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Titre & lieu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Site public
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {evenements.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-700/20">
                    <td className="px-4 py-4 align-top">
                      <span className="font-medium text-slate-100">{event.titre}</span>
                      {event.lieu ? (
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {event.lieu}
                        </p>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-slate-300">
                      {format(new Date(event.dateDebut), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <Badge
                        variant={
                          event.statut === 'PASSE'
                            ? 'default'
                            : event.statut === 'EN_COURS'
                              ? 'soumis'
                              : 'approuve'
                        }
                      >
                        {event.statut === 'PASSE'
                          ? 'Terminé'
                          : event.statut === 'EN_COURS'
                            ? 'En cours'
                            : 'À venir'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-slate-400">
                      {event.afficheSite ? 'Oui' : 'Non'}
                    </td>
                    <td className="px-4 py-4 align-middle text-right">
                      <BureauRowEditDeleteActions
                        editHref={`/bureau/evenements/${event.id}/edit`}
                        deleteApiUrl={`/api/bureau/evenements/${event.id}`}
                        resourceKind="cet événement"
                        resourceTitle={event.titre}
                        publicPageHref={
                          event.afficheSite ? `/evenements/${event.slug}` : undefined
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-700 bg-slate-900/80 px-3 py-4 sm:flex-row sm:items-center sm:px-6">
            <div className="text-center text-sm text-slate-300 sm:text-left">
              Affichage de {(page - 1) * limit + 1} à {Math.min(page * limit, total)} sur {total}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              {page > 1 && (
                <Link href={`/bureau/evenements?${stableBase(page - 1)}`}>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                    Précédent
                  </Button>
                </Link>
              )}
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Link key={pageNum} href={`/bureau/evenements?${stableBase(pageNum)}`}>
                      <Button
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className="min-w-[40px] border-slate-600 text-slate-200 hover:bg-slate-800"
                      >
                        {pageNum}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              {page < totalPages && (
                <Link href={`/bureau/evenements?${stableBase(page + 1)}`}>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                    Suivant
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
