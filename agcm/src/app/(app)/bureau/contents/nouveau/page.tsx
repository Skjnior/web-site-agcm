import { Metadata } from 'next';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import BureauContentForm from './BureauContentForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nouveau contenu - Bureau AGCM',
  description: 'Créer un nouveau contenu ou activité',
};

export default async function BureauContentNouveauPage() {
  await assertBureauModuleOrRedirect('contents');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/bureau/contents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Nouveau contenu</h1>
          <p className="text-slate-400 mt-1">Créez une activité, actualité ou annonce</p>
        </div>
      </div>

      <BureauContentForm />
    </div>
  );
}
