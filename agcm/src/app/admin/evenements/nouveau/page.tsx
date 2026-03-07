// app/admin/evenements/nouveau/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import EvenementForm from '@/components/admin/EvenementForm';

export const metadata: Metadata = {
  title: 'Nouvel événement - Admin AGCM',
  description: 'Créer un nouvel événement',
};

export default async function NouvelEvenementPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const userRole = (session?.user as any)?.roleSysteme || session?.user?.role;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole as string)) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pointer-events-auto">
      <main className="flex-1 p-4 md:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Nouvel événement
              </h1>
              <p className="text-slate-500 mt-1">Créer un nouvel événement dans le calendrier associatif</p>
            </div>
          </div>

          <EvenementForm />
        </div>
      </main>
    </div>
  );
}

