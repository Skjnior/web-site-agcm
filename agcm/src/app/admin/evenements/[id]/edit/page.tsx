// app/admin/evenements/[id]/edit/page.tsx
import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EvenementForm from '@/components/admin/EvenementForm';

export const metadata: Metadata = {
  title: 'Modifier événement - Admin AGCM',
  description: 'Modifier un événement',
};

type EditEvenementPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEvenementPage({ params }: EditEvenementPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const userRole = (session?.user as any)?.roleSysteme || session?.user?.role;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole as string)) {
    redirect('/dashboard');
  }

  const evenement = await prisma.event.findUnique({
    where: { id },
  });

  if (!evenement) {
    notFound();
  }

  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const initialData = {
    titre: evenement.titre,
    slug: evenement.slug,
    description: evenement.description,
    type: 'CONFERENCE',
    dateEvenement: formatDateForInput(evenement.dateDebut),
    heureDebut: new Date(evenement.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    heureFin: evenement.dateFin ? new Date(evenement.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '17:00',
    lieu: evenement.lieu || '',
    lienVisio: '',
    inscriptionRequise: false,
    placesMax: undefined,
    dateInscriptionFin: undefined,
    programme: '',
    intervenants: '',
    imageUrl: '',
    status: evenement.statut,
    published: evenement.afficheSite,
  };

  return (
    <div className="admin-page flex flex-col pointer-events-auto">
      <main className="flex-1 p-4 md:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="admin-glass rounded-3xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Modifier l'événement
              </h1>
              <p className="text-slate-500 mt-1 transition-colors hover:text-slate-700">{evenement.titre}</p>
            </div>
          </div>

          <EvenementForm evenementId={id} initialData={initialData} />
        </div>
      </main>
    </div>
  );
}

