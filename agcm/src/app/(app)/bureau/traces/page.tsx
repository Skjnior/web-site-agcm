import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import { getBureauMandatContext } from '@/lib/rbac';
import { bureauMemberHasModule } from '@/lib/bureau-poste-perimetre';
import BureauTracesClient from './BureauTracesClient';

export const metadata: Metadata = {
  title: 'Historique des actions - Bureau AGCM',
  description: 'Qui a fait quoi sur vos contenus, projets et événements',
};

export default async function BureauTracesPage() {
  await assertBureauModuleOrRedirect('traces');

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/connexion');
  }

  const [user, ctx] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { roleSysteme: true },
    }),
    getBureauMandatContext(session.user.id),
  ]);

  if (!ctx) {
    redirect('/');
  }

  const posteNoms = ctx.affectations.map((a) => a.poste.nom);
  const role = user?.roleSysteme ?? 'MEMBER';

  const entityTypes: string[] = ['all'];
  if (bureauMemberHasModule(role, posteNoms, 'contents')) {
    entityTypes.push('Content');
  }
  if (bureauMemberHasModule(role, posteNoms, 'projets')) {
    entityTypes.push('Projet');
  }
  if (bureauMemberHasModule(role, posteNoms, 'evenements')) {
    entityTypes.push('Event');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Historique des actions</h1>
        <p className="text-slate-400 mt-1">
          Consultez qui a fait quoi sur vos contenus, projets et événements (selon votre périmètre).
        </p>
      </div>

      <BureauTracesClient entityTypes={entityTypes} />
    </div>
  );
}
