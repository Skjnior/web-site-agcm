import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { canAccessSalonBureau } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import ChatInterface from '@/components/app/ChatInterface';
import { MessageCircle, Lock, Shield } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Lock className="h-6 w-6 text-purple-400" />
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-purple-400" />
            Salon privé bureau
          </h1>
        </div>
        <p className="text-slate-400 mb-2">
          Espace de discussion réservé aux membres actifs du bureau exécutif.
        </p>
        {mandatActif && (
          <div className="flex items-center gap-2 text-sm text-purple-300/90">
            <Shield className="h-4 w-4" />
            <span>
              Mandat actif : {new Date(mandatActif.dateDebut).getFullYear()} – {new Date(mandatActif.dateFin).getFullYear()}.
              Les messages des anciens mandats ne sont pas accessibles.
            </span>
          </div>
        )}
      </div>

      <ChatInterface
        scope="PRIVE_BUREAU"
        canModerate={session.user.roleSysteme === 'SUPER_ADMIN'}
      />
    </div>
  );
}
