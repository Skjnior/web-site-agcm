import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Projets - Bureau',
  description: 'Gérer les projets',
};

export default async function BureauProjetsPage() {
  const { ctx } = await assertBureauModuleOrRedirect('projets');

  const projets = await prisma.projet.findMany({
    where: {
      responsablePosteId: { in: ctx.posteIds },
      mandatId: ctx.mandatId,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Mes projets</h1>
          <p className="mt-1 text-slate-400">
            Projets dont votre poste est responsable (mandat en cours)
          </p>
        </div>
        <Button className="bg-slate-100 text-slate-900 hover:bg-white">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50">
        {projets.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <p className="text-slate-400">Aucun projet assigné à votre poste pour ce mandat</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {projets.map((projet) => (
                  <tr key={projet.id} className="hover:bg-slate-700/20">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
