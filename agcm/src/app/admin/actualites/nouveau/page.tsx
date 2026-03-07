// app/admin/actualites/nouveau/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import ActualiteForm from '@/components/admin/ActualiteForm';

export const metadata: Metadata = {
  title: 'Nouvelle actualité - Admin AGCM',
  description: 'Créer une nouvelle actualité',
};

export default async function NouvelleActualitePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const userRole = (session.user as any).roleSysteme || session.user.role;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Nouvelle actualité</h1>
        <p className="text-slate-500 mt-1">Publier du contenu informatif pour vos membres</p>
      </div>

      <ActualiteForm />
    </div>
  );
}

