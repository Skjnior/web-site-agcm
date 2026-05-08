import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import { Calendar, Plus, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Événements - Bureau',
  description: 'Gérer les événements',
};

export default async function BureauEvenementsPage() {
  const { ctx } = await assertBureauModuleOrRedirect('evenements');

  const evenements = await prisma.event.findMany({
    where: {
      createdByPosteId: { in: ctx.posteIds },
      mandatId: ctx.mandatId,
    },
    orderBy: { dateDebut: 'desc' },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Mes événements</h1>
          <p className="mt-1 text-slate-400">
            Événements créés depuis votre poste sur le mandat en cours ({evenements.length})
          </p>
        </div>
        <Link href="/bureau/evenements/nouveau">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel événement
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50">
        {evenements.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <p className="text-slate-400">Aucun événement créé par votre poste pour ce mandat</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
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
                    Voir
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
                          event.statut === 'PASSE' ? 'default' : event.statut === 'EN_COURS' ? 'soumis' : 'approuve'
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
                    <td className="px-4 py-4 align-top text-right">
                      {event.afficheSite ? (
                        <Link
                          href={`/evenements/${event.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          Page publique
                        </Link>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
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
