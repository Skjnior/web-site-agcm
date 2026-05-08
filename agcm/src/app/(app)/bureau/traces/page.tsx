import { Metadata } from 'next';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import BureauTracesClient from './BureauTracesClient';

export const metadata: Metadata = {
  title: 'Historique des actions - Bureau AGCM',
  description: 'Qui a fait quoi sur vos contenus, projets et événements',
};

export default async function BureauTracesPage() {
  await assertBureauModuleOrRedirect('traces');

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
