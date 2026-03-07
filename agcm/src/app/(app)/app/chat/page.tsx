import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { canAccessSalonBureau } from '@/lib/rbac';
import ChatInterface from '@/components/app/ChatInterface';
import { MessageCircle, Lock } from 'lucide-react';

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
    redirect('/dashboard');
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Lock className="h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-purple-600" />
            Salon privé bureau
          </h1>
        </div>
        <p className="text-gray-600">
          Espace de discussion réservé aux membres actifs du bureau exécutif.
        </p>
      </div>

      <ChatInterface
        scope="PRIVE_BUREAU"
        canModerate={session.user.roleSysteme === 'SUPER_ADMIN'}
      />
    </div>
  );
}
