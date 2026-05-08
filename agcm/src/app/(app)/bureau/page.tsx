import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getBureauMandatContext, isBureauActif } from '@/lib/rbac';
import { bureauMemberHasModule, getBureauPerimetreForPostes } from '@/lib/bureau-poste-perimetre';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FileText, FolderOpen, Calendar, History } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard Bureau - AGCM',
  description: 'Tableau de bord bureau',
};

const cardBase =
  'group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-slate-600/80 hover:bg-slate-800/40';

export default async function BureauDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect('/connexion');
  }

  const bureauActif = await isBureauActif(user.id);
  if (!bureauActif) {
    redirect('/');
  }

  const ctx = await getBureauMandatContext(user.id);

  if (!ctx) {
    redirect('/');
  }

  const { mandat: mandatActif, posteIds, primaryAffectation: affectation } = ctx;
  const posteNoms = ctx.affectations.map((a) => a.poste.nom);
  const { focusLines } = getBureauPerimetreForPostes(posteNoms);

  const canContents = bureauMemberHasModule(user.roleSysteme, posteNoms, 'contents');
  const canProjets = bureauMemberHasModule(user.roleSysteme, posteNoms, 'projets');
  const canEvenements = bureauMemberHasModule(user.roleSysteme, posteNoms, 'evenements');
  const canTraces = bureauMemberHasModule(user.roleSysteme, posteNoms, 'traces');

  let myContents = 0;
  let myProjets = 0;
  let pendingContents = 0;
  let publishedContents = 0;
  let myEvenements = 0;

  if (canContents) {
    const [c, pending, pub] = await Promise.all([
      prisma.content.count({
        where: { auteurPosteId: { in: posteIds }, mandatId: mandatActif.id },
      }),
      prisma.content.count({
        where: {
          auteurPosteId: { in: posteIds },
          mandatId: mandatActif.id,
          statutWorkflow: 'SOUMIS',
        },
      }),
      prisma.content.count({
        where: {
          auteurPosteId: { in: posteIds },
          mandatId: mandatActif.id,
          statutWorkflow: 'PUBLIE',
        },
      }),
    ]);
    myContents = c;
    pendingContents = pending;
    publishedContents = pub;
  }

  if (canProjets) {
    myProjets = await prisma.projet.count({
      where: { responsablePosteId: { in: posteIds }, mandatId: mandatActif.id },
    });
  }

  if (canEvenements) {
    myEvenements = await prisma.event.count({
      where: { createdByPosteId: { in: posteIds }, mandatId: mandatActif.id },
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">
          Dashboard - {affectation.poste.nom}
        </h1>
        <p className="mt-1 text-slate-400">
          Mandat {new Date(mandatActif.dateDebut).getFullYear()} -{' '}
          {new Date(mandatActif.dateFin).getFullYear()}
        </p>
        {focusLines.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
            <p className="font-medium text-slate-200">Périmètre de votre fonction</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-slate-400">
              {focusLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {canContents && (
          <>
            <Link href="/bureau/contents" className="block">
              <div className={cardBase}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Mes activités</p>
                    <p className="mt-2 text-3xl font-bold text-slate-100">{myContents}</p>
                  </div>
                  <div className="rounded-full bg-blue-500/15 p-3 ring-1 ring-blue-500/20">
                    <FileText className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/bureau/contents?status=PUBLIE" className="block">
              <div className={cardBase}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Publiées</p>
                    <p className="mt-2 text-3xl font-bold text-slate-100">{publishedContents}</p>
                  </div>
                  <div className="rounded-full bg-emerald-500/15 p-3 ring-1 ring-emerald-500/20">
                    <FileText className="h-6 w-6 text-emerald-400" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/bureau/contents?status=SOUMIS" className="block">
              <div className={cardBase}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">En attente</p>
                    <p className="mt-2 text-3xl font-bold text-slate-100">{pendingContents}</p>
                  </div>
                  <div className="rounded-full bg-amber-500/15 p-3 ring-1 ring-amber-500/20">
                    <FileText className="h-6 w-6 text-amber-400" />
                  </div>
                </div>
              </div>
            </Link>
          </>
        )}

        {canProjets && (
          <Link href="/bureau/projets" className="block">
            <div className={cardBase}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Projets</p>
                  <p className="mt-2 text-3xl font-bold text-slate-100">{myProjets}</p>
                </div>
                <div className="rounded-full bg-violet-500/15 p-3 ring-1 ring-violet-500/20">
                  <FolderOpen className="h-6 w-6 text-violet-400" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {canEvenements && (
          <Link href="/bureau/evenements" className="block">
            <div className={cardBase}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Événements</p>
                  <p className="mt-2 text-3xl font-bold text-slate-100">{myEvenements}</p>
                </div>
                <div className="rounded-full bg-cyan-500/15 p-3 ring-1 ring-cyan-500/20">
                  <Calendar className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {canTraces && (
          <Link href="/bureau/traces" className="block">
            <div className={cardBase}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Historique</p>
                  <p className="mt-2 text-sm font-medium text-slate-200">Actions &amp; validations</p>
                </div>
                <div className="rounded-full bg-slate-500/15 p-3 ring-1 ring-slate-500/20">
                  <History className="h-6 w-6 text-slate-300" />
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {(canContents || canProjets || canEvenements) && (
        <div className="admin-glass rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Actions rapides</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {canContents && (
              <Link href="/bureau/contents/nouveau">
                <Button
                  className="w-full border-slate-600 bg-slate-900/50 text-slate-100 hover:bg-slate-800 hover:text-white"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une activité
                </Button>
              </Link>
            )}
            {canProjets && (
              <Link href="/bureau/projets/nouveau">
                <Button
                  className="w-full border-slate-600 bg-slate-900/50 text-slate-100 hover:bg-slate-800 hover:text-white"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un projet
                </Button>
              </Link>
            )}
            {canEvenements && (
              <Link href="/bureau/evenements/nouveau">
                <Button
                  className="w-full border-slate-600 bg-slate-900/50 text-slate-100 hover:bg-slate-800 hover:text-white"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un événement
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {canContents && (
        <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/50 shadow-lg backdrop-blur-sm">
          <div className="border-b border-slate-700/50 p-6">
            <h2 className="text-lg font-semibold text-slate-100">Mes activités récentes</h2>
          </div>
          <div className="p-6">
            <Link href="/bureau/contents">
              <Button
                variant="outline"
                className="border-slate-600 bg-slate-900/50 text-slate-100 hover:bg-slate-800"
              >
                Voir toutes mes activités
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
