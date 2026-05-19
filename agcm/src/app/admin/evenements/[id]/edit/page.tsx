// app/admin/evenements/[id]/edit/page.tsx
import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EvenementForm from '@/components/admin/EvenementForm';
import { formatDateLocal, formatTimeLocal } from '@/lib/admin/event-map';

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

  const userRole = (session?.user as { roleSysteme?: string } | undefined)?.roleSysteme || session?.user?.role;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole as string)) {
    redirect('/dashboard');
  }

  const evenement = await prisma.event.findUnique({
    where: { id },
    include: {
      medias: {
        orderBy: [{ isPrincipale: 'desc' }, { ordre: 'asc' }],
      },
    },
  });

  if (!evenement) {
    notFound();
  }

  const debut = evenement.dateDebut;
  const fin = evenement.dateFin ?? evenement.dateDebut;

  const principal =
    evenement.medias.find((m) => m.isPrincipale) ?? evenement.medias[0];

  /** Champs présents en base ; le reste du formulaire reste indicatif tant qu’ils ne sont pas modélisés. */
  const initialData = {
    titre: evenement.titre,
    slug: evenement.slug,
    description: evenement.description ?? '',
    type: 'AUTRE',
    dateEvenement: formatDateLocal(debut),
    heureDebut: formatTimeLocal(debut),
    heureFin: formatTimeLocal(fin),
    lieu: evenement.lieu ?? '',
    lienVisio: '',
    inscriptionRequise: false,
    placesMax: undefined as number | undefined,
    dateInscriptionFin: '',
    programme: '',
    intervenants: '',
    imageUrl: principal?.url ?? '',
    status: evenement.statut,
    published: evenement.afficheSite,
  };

  return (
    <div className="admin-page pointer-events-auto flex flex-col">
      <main className="mx-auto w-full max-w-[1600px] flex-1 overflow-x-hidden p-4 md:p-8">
        <div className="mx-auto max-w-5xl animate-in space-y-8 fade-in slide-in-from-bottom-4 duration-700">
          <div className="admin-glass flex flex-col justify-between gap-4 rounded-3xl p-8 shadow-sm md:flex-row md:items-center">
            <div>
              <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent">
                Modifier l&apos;événement
              </h1>
              <p className="mt-1 text-slate-500 transition-colors hover:text-slate-700">{evenement.titre}</p>
            </div>
          </div>

          <EvenementForm evenementId={id} initialData={initialData} />
        </div>
      </main>
    </div>
  );
}
