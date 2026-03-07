import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Événements - Bureau',
  description: 'Gérer les événements',
};

export default async function BureauEvenementsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      member: {
        include: {
          affectations: {
            where: { statut: 'ACTIF' },
            include: {
              poste: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.member) {
    redirect('/dashboard');
  }

  const isBureau = user.member.affectations.some(aff => aff.poste.estBureau);
  if (!isBureau) {
    redirect('/dashboard');
  }

  const evenements = await prisma.event.findMany({
    orderBy: {
      dateDebut: 'desc',
    },
    take: 20,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Événements</h1>
          <p className="text-gray-600 mt-1">{evenements.length} événement(s)</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {evenements.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun événement pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {evenements.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">{event.titre}</h3>
                <p className="text-sm text-gray-600 mt-1">{event.description || 'Aucune description'}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>Date: {new Date(event.dateDebut).toLocaleDateString('fr-FR')}</span>
                  <span>Lieu: {event.lieu || 'Non spécifié'}</span>
                  <span>Afficher sur le site: {event.afficheSite ? 'Oui' : 'Non'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


