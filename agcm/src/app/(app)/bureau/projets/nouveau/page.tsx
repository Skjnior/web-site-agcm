import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import BureauProjetForm from '@/components/bureau/BureauProjetForm';

export const metadata: Metadata = {
  title: 'Nouveau projet - Bureau AGCM',
  description: 'Créer un projet rattaché à votre poste',
};

export default async function BureauProjetNouveauPage() {
  await assertBureauModuleOrRedirect('projets');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/bureau/projets">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Nouveau projet</h1>
          <p className="mt-1 text-slate-400">
            Le projet est rattaché à votre poste et au mandat en cours.
          </p>
        </div>
      </div>

      <BureauProjetForm />
    </div>
  );
}
