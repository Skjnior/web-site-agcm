import { Metadata } from 'next';
import { assertSiteMediaModuleOrRedirect } from '@/lib/bureau-page-guard';
import BureauGalerieManager from '@/components/bureau/BureauGalerieManager';
import { Images } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Galerie photos - Bureau AGCM',
  description: 'Gérer les photos affichées sur le site public',
};

export default async function BureauGaleriePage() {
  await assertSiteMediaModuleOrRedirect('galerie');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Images className="h-7 w-7 text-red-400" />
          Galerie du site
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Importez des photos et choisissez celles visibles sur la page d&apos;accueil (les masquées restent
          enregistrées mais invisibles pour les visiteurs).
        </p>
      </div>
      <BureauGalerieManager />
    </div>
  );
}
