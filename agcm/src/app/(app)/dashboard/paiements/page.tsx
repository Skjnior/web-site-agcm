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
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/20">
                  <MessageSquare className="h-7 w-7 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-200">Salon privé bureau</h3>
                  <p className="mt-0.5 text-sm text-slate-400">
                    Échanges et documents réservés aux membres du bureau du mandat actif
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-purple-500/40 text-purple-300 hover:bg-purple-500/20"
                >
                  Accéder
                </Button>
              </div>
            </div>
          </Link>
        )}

        <div className="admin-panel p-8">
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800/50">
              <Receipt className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-slate-200">Historique des paiements</h3>
            <p className="mb-6 max-w-md text-slate-500">
              Votre historique de cotisations et paiements apparaîtra ici une fois la fonctionnalité activée.
            </p>

            <div className="flex w-full max-w-md gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-left">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
              <div className="text-sm text-slate-300">
                <p className="mb-1 font-medium text-slate-200">Cotisation annuelle</p>
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
