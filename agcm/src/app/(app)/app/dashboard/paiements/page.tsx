import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBureauActif } from '@/lib/rbac';
import { CreditCard, Receipt, Info, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MemberPageShell from '@/components/app/MemberPageShell';

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

  const isBureau = await isBureauActif(user.id);

  return (
    <MemberPageShell
      title="Mes paiements"
      description="Cotisations et historique"
      icon={CreditCard}
      iconClassName="text-purple-400"
      narrow
    >
      <div className="space-y-8">
      {isBureau && (
        <Link href="/app/chat">
          <div className="admin-glass rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 transition-colors hover:bg-purple-500/15">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-200">Salon privé bureau</h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  Échanges et documents réservés aux membres du bureau du mandat actif
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-purple-500/40 text-purple-300 hover:bg-purple-500/20 shrink-0">
                Accéder
              </Button>
            </div>
          </div>
        </Link>
      )}

      <div className="admin-panel p-8">
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
    </MemberPageShell>
  );
}
