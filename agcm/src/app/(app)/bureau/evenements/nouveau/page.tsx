import { Metadata } from 'next';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import BureauEvenementForm from './BureauEvenementForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nouvel événement - Bureau AGCM',
  description: 'Créer un nouvel événement',
};

export default async function BureauEvenementNouveauPage() {
  await assertBureauModuleOrRedirect('evenements');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/bureau/evenements">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Nouvel événement</h1>
          <p className="text-slate-400 mt-1">Créer un événement dans le calendrier</p>
        </div>
      </div>

      <BureauEvenementForm />
    </div>
  );
}
