import { Metadata } from 'next';
import { assertSiteMediaModuleOrRedirect } from '@/lib/bureau-page-guard';
import BureauPartenairesManager from '@/components/bureau/BureauPartenairesManager';
import { Handshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Partenaires - Bureau AGCM',
  description: 'Gérer les partenaires affichés sur le site public',
};

export default async function BureauPartenairesPage() {
  await assertSiteMediaModuleOrRedirect('partenaires');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Handshake className="h-7 w-7 text-red-400" />
          Partenaires
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Ajoutez, modifiez ou supprimez les partenaires. Seuls ceux marqués « visible site » et actifs
          apparaissent sur la page publique.
        </p>
      </div>
      <BureauPartenairesManager />
    </div>
  );
}
