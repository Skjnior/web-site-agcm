import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { CreditCard, Receipt, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mes paiements - AGCM',
  description: 'Cotisations et historique des paiements',
};

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

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-purple-400" />
          Mes paiements
        </h1>
        <p className="text-slate-400 mt-1">Cotisations et historique</p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-6 border border-slate-700/50">
            <Receipt className="h-10 w-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">Historique des paiements</h3>
          <p className="text-slate-500 max-w-md mb-6">
            Votre historique de cotisations et paiements apparaîtra ici une fois la fonctionnalité activée.
          </p>

          <div className="w-full max-w-md bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-left">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300">
              <p className="font-medium text-slate-200 mb-1">Cotisation annuelle</p>
              <p>
                Pour régler votre cotisation ou obtenir des informations sur les modalités de paiement,
                contactez le trésorier de l&apos;association ou l&apos;équipe administrative.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
