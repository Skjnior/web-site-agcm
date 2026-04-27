import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { canAccessSalonBureau } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import ChatInterface from '@/components/app/ChatInterface';
import { MemberPageHeader } from '@/components/app/MemberPageShell';
import { MessageCircle, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chat Bureau - AGCM',
  description: 'Salon privé bureau AGCM',
};

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const canAccessPrivate = await canAccessSalonBureau(session.user.id);

  if (!canAccessPrivate) {
    redirect('/app/dashboard');
  }

  const mandatActif = await getMandatActif();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <MemberPageHeader
        title="Salon privé bureau"
        description="Espace de discussion réservé aux membres actifs du bureau exécutif."
        icon={MessageCircle}
        iconClassName="text-purple-400"
      />

      {mandatActif && (
        <div className="admin-panel flex items-start gap-3 border border-purple-500/25 bg-purple-500/10 p-4 text-sm text-purple-200">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" aria-hidden />
          <p>
            Mandat actif : {new Date(mandatActif.dateDebut).getFullYear()} –{' '}
            {new Date(mandatActif.dateFin).getFullYear()}. Les messages des anciens mandats ne sont pas accessibles.
          </p>
        </div>
      )}

      <ChatInterface
        scope="PRIVE_BUREAU"
        canModerate={session.user.roleSysteme === 'SUPER_ADMIN'}
      />
    </div>
  );
}
