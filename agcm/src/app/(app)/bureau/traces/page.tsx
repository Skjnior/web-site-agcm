import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBureauActif } from '@/lib/rbac';
import BureauTracesClient from './BureauTracesClient';

export const metadata: Metadata = {
  title: 'Historique des actions - Bureau AGCM',
  description: 'Qui a fait quoi sur vos contenus, projets et événements',
};

export default async function BureauTracesPage() {
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
    redirect('/app/dashboard');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Historique des actions</h1>
        <p className="text-slate-400 mt-1">
          Consultez qui a fait quoi sur vos contenus, projets et événements
        </p>
      </div>

      <BureauTracesClient />
    </div>
  );
}
