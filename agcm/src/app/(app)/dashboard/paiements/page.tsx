import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBureauActif, getBureauMandatContext } from '@/lib/rbac';
import { bureauMemberHasModule } from '@/lib/bureau-poste-perimetre';
import {
  CreditCard,
  ClipboardList,
  Info,
  MessageSquare,
  Users,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MemberPageShell from '@/components/app/MemberPageShell';

export const metadata: Metadata = {
  title: 'Mes paiements - AGCM',
  description: 'Cotisations et situation registre',
};

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}

export default async function PaiementsPage() {
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

  const isBureau = await isBureauActif(user.id);

  const member = await prisma.member.findUnique({
    where: { userId: user.id },
    select: { id: true, prenom: true, nom: true },
  });

  const personalHistory = member
    ? await prisma.memberRegistreCotisation.findMany({
        where: { memberId: member.id },
        orderBy: { dateReference: 'desc' },
        take: 18,
        select: {
          dateReference: true,
          situationText: true,
          absencesText: true,
          updatedAt: true,
        },
      })
    : [];

  let registreHub: {
    latestDate: Date | null;
    totalMembers: number;
    snapshotRows: number;
    snapshotFilled: number;
  } | null = null;

  const ctx = isBureau ? await getBureauMandatContext(user.id) : null;
  if (
    ctx &&
    bureauMemberHasModule(
      user.roleSysteme,
      ctx.affectations.map((a) => a.poste.nom),
      'paiements',
    )
  ) {
    const latest = await prisma.memberRegistreCotisation.findFirst({
      orderBy: { dateReference: 'desc' },
      select: { dateReference: true },
    });
    const totalMembers = await prisma.member.count();
    let snapshotRows = 0;
    let snapshotFilled = 0;
    if (latest) {
      const rows = await prisma.memberRegistreCotisation.findMany({
        where: { dateReference: latest.dateReference },
        select: { situationText: true, absencesText: true },
      });
      snapshotRows = rows.length;
      snapshotFilled = rows.filter(
        (r) =>
          (r.situationText?.trim() ?? '') !== '' || (r.absencesText?.trim() ?? '') !== '',
      ).length;
    }
    registreHub = {
      latestDate: latest?.dateReference ?? null,
      totalMembers,
      snapshotRows,
      snapshotFilled,
    };
  }

  return (
    <MemberPageShell
      title="Mes paiements"
      description="Cotisations et registre"
      icon={CreditCard}
      iconClassName="text-purple-400"
      narrow
    >
      <div className="space-y-8">
        {registreHub && (
          <div className="admin-glass rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-emerald-200">
                  <ClipboardList className="h-5 w-5 shrink-0" />
                  <h3 className="font-semibold">Registre cotisations & absences</h3>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  En tant que membre du bureau avec le module finances, vous pouvez consulter et mettre à jour le
                  tableau complet (équivalent Excel/PDF).
                </p>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-slate-500" />
                    {registreHub.totalMembers} membres en base
                  </li>
                  {registreHub.latestDate ? (
                    <li className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4 text-slate-500" />
                      Dernière date de situation : <strong className="font-medium">{fmtDate(registreHub.latestDate)}</strong>
                    </li>
                  ) : (
                    <li className="text-slate-500">Aucune date de situation enregistrée encore.</li>
                  )}
                  {registreHub.latestDate ? (
                    <li>
                      Lignes renseignées :{' '}
                      <strong className="text-slate-200">
                        {registreHub.snapshotFilled}
                      </strong>{' '}
                      / {registreHub.snapshotRows} entrées pour cette date
                    </li>
                  ) : null}
                </ul>
              </div>
              <Button asChild className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-500">
                <Link href="/bureau/registre-cotisations">Ouvrir le registre</Link>
              </Button>
            </div>
          </div>
        )}

        {isBureau && (
          <Link href="/app/chat">
            <div className="admin-glass rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 transition-colors hover:bg-purple-500/15">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/20">
                  <MessageSquare className="h-7 w-7 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-200">Salon privé bureau</h3>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Échanges réservés aux membres du bureau du mandat actif
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-purple-500/40 text-purple-300 hover:bg-purple-500/20"
                >
                  Accéder
                </Button>
              </div>
            </div>
          </Link>
        )}

        <div className="admin-panel p-6 md:p-8">
          <h3 className="mb-1 text-lg font-semibold text-slate-200">Votre situation au registre</h3>
          <p className="mb-6 text-sm text-slate-500">
            Les montants et mentions sont saisis par le bureau (finances / trésorerie). Ce n’est pas un relevé bancaire
            automatique.
          </p>

          {!member ? (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
              Aucune fiche membre n’est liée à votre compte. La situation cotisation ne peut pas s’afficher ici ; contactez
              un administrateur pour associer votre profil ou consultez le bureau.
            </div>
          ) : personalHistory.length === 0 ? (
            <p className="text-sm text-slate-400">
              Aucune entrée de registre pour <strong className="text-slate-200">{member.prenom} {member.nom}</strong>{' '}
              pour l’instant. Dès qu’une date de situation sera enregistrée pour vous, elle apparaîtra ci-dessous.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-700/50">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-700/80 bg-slate-800/80 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date de situation</th>
                    <th className="px-4 py-3 font-medium">Situation cotisation</th>
                    <th className="px-4 py-3 font-medium">Absences</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {personalHistory.map((row) => (
                    <tr key={row.dateReference.toISOString()} className="hover:bg-slate-800/40">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                        {fmtDate(row.dateReference)}
                      </td>
                      <td className="max-w-md px-4 py-3 text-slate-400 whitespace-pre-wrap break-words">
                        {row.situationText?.trim() ? row.situationText : '—'}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-slate-400 whitespace-pre-wrap break-words">
                        {row.absencesText?.trim() ? row.absencesText : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex w-full max-w-none gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-left">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
          <div className="text-sm text-slate-300">
            <p className="mb-1 font-medium text-slate-200">Paiement en ligne & historique bancaire</p>
            <p>
              Il n’y a pas encore de connexion à une passerelle de paiement : les encaissements réels se font selon les
              modalités communiquées par le trésorier. Pour toute question ou preuve de paiement, contactez le bureau.
            </p>
          </div>
        </div>
      </div>
    </MemberPageShell>
  );
}
