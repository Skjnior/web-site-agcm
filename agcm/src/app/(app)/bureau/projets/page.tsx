import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import BureauClickableTableRow from '@/components/bureau/BureauClickableTableRow';
import BureauRowEditDeleteActions from '@/components/bureau/BureauRowEditDeleteActions';
import BureauTableActionsCell from '@/components/bureau/BureauTableActionsCell';
import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata: Metadata = {
  title: 'Projets - Bureau',
  description: 'Gérer les projets',
};

type VisibiliteFilter = 'ALL' | 'oui' | 'non';

function buildProjetsSearchParams(opts: {
  q: string;
  statut: string;
  visibilite: VisibiliteFilter;
  limit: number;
  page: number;
}) {
  const p = new URLSearchParams();
  if (opts.q.trim()) p.set('q', opts.q.trim());
  if (opts.statut && opts.statut !== 'ALL') p.set('statut', opts.statut);
  if (opts.visibilite !== 'ALL') p.set('visibilite', opts.visibilite);
  if (opts.limit !== 20) p.set('limit', String(opts.limit));
  if (opts.page > 1) p.set('page', String(opts.page));
  return p.toString();
}

export default async function BureauProjetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; statut?: string; visibilite?: string; page?: string; limit?: string }>;
}) {
  const params = await searchParams;

  const { ctx } = await assertBureauModuleOrRedirect('projets');

  const q = params.q || '';
  const statut = params.statut || 'ALL';
  const visRaw = params.visibilite || 'ALL';
  const visibilite: VisibiliteFilter =
    visRaw === 'oui' || visRaw === 'non' ? visRaw : 'ALL';

  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const rawLimit = parseInt(params.limit || '20', 10);
  const limit = Math.min(100, Math.max(1, isNaN(rawLimit) ? 20 : rawLimit));
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {
    responsablePosteId: { in: ctx.posteIds },
    mandatId: ctx.mandatId,
  };

  if (statut !== 'ALL') {
    where.statut = statut;
  }
  if (visibilite === 'oui') {
    where.visibiliteSite = true;
  }
  if (visibilite === 'non') {
    where.visibiliteSite = false;
  }
  if (q.trim()) {
    where.OR = [
      { titre: { contains: q.trim(), mode: 'insensitive' } },
      { objectif: { contains: q.trim(), mode: 'insensitive' } },
      { description: { contains: q.trim(), mode: 'insensitive' } },
    ];
  }

  const [total, projets] = await Promise.all([
    prisma.projet.count({ where }),
    prisma.projet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;
  const stableBase = (pageNum: number) =>
    buildProjetsSearchParams({ q, statut, visibilite, limit, page: pageNum });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Mes projets</h1>
          <p className="mt-1 text-slate-400">
            Projets dont votre poste est responsable (mandat en cours) — {total} résultat(s)
          </p>
        </div>
        <Link href="/bureau/projets/nouveau" className="shrink-0">
          <Button className="bg-slate-100 text-slate-900 hover:bg-white">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
        <form method="get" className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="min-w-0 flex-1 lg:max-w-md">
            <Label htmlFor="bp-q" className="text-xs font-medium text-slate-400">
              Recherche
            </Label>
            <Input
              id="bp-q"
              name="q"
              defaultValue={q}
              placeholder="Titre, objectif, description…"
              className="mt-1.5 border-slate-600 bg-slate-900/50 text-slate-100"
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <Label htmlFor="bp-statut" className="text-xs font-medium text-slate-400">
              Statut
            </Label>
            <select
              id="bp-statut"
              name="statut"
              defaultValue={statut}
              className="mt-1.5 flex h-10 w-full rounded-md border border-slate-600 bg-slate-900/50 px-3 text-sm text-slate-100"
            >
              <option value="ALL">Tous</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[160px]">
            <Label htmlFor="bp-vis" className="text-xs font-medium text-slate-400">
              Site public
            </Label>
            <select
              id="bp-vis"
              name="visibilite"
              defaultValue={visibilite}
              className="mt-1.5 flex h-10 w-full rounded-md border border-slate-600 bg-slate-900/50 px-3 text-sm text-slate-100"
            >
              <option value="ALL">Tous</option>
              <option value="oui">Visible sur le site</option>
              <option value="non">Privé</option>
            </select>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[100px]">
            <Label htmlFor="bp-limit" className="text-xs font-medium text-slate-400">
              Par page
            </Label>
            <select
              id="bp-limit"
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
              <Link href="/bureau/projets">Réinitialiser</Link>
            </Button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50">
        {projets.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <p className="text-slate-400">
              Aucun projet pour ces filtres. Essayez « Réinitialiser » ou modifiez la recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-slate-700/50 bg-slate-800/90">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Projet
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Visibilité
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Créé le
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {projets.map((projet) => (
                  <BureauClickableTableRow key={projet.id} detailHref={`/bureau/projets/${projet.id}`}>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-2">
                        <FolderOpen className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                        <div>
                          <p className="font-medium text-slate-100">{projet.titre}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                            {projet.objectif || projet.description || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      <Badge variant="outline" className="border-slate-600 text-slate-200">
                        {projet.statut}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-slate-300">
                      {projet.visibiliteSite ? 'Public site' : 'Privé'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-sm text-slate-400">
                      {format(new Date(projet.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <BureauTableActionsCell className="px-4 py-4 align-middle text-right">
                      <BureauRowEditDeleteActions
                        detailHref={`/bureau/projets/${projet.id}`}
                        editHref={`/bureau/projets/${projet.id}/edit`}
                        deleteApiUrl={`/api/bureau/projets/${projet.id}`}
                        resourceKind="ce projet"
                        resourceTitle={projet.titre}
                      />
                    </BureauTableActionsCell>
                  </BureauClickableTableRow>
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
                <Link href={`/bureau/projets?${stableBase(page - 1)}`}>
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
                    <Link key={pageNum} href={`/bureau/projets?${stableBase(pageNum)}`}>
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
                <Link href={`/bureau/projets?${stableBase(page + 1)}`}>
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
