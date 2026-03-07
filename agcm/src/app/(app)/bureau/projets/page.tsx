import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { FolderOpen, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Projets - Bureau',
  description: 'Gérer les projets',
};

export default async function BureauProjetsPage() {
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

  const activePosteIds = user.member.affectations.map((aff) => aff.posteId);

  const projets = await prisma.projet.findMany({
    where: {
      responsablePosteId: {
        in: activePosteIds,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes projets</h1>
          <p className="text-gray-600 mt-1">{projets.length} projet(s)</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau projet
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {projets.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun projet pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projets.map((projet) => (
              <div key={projet.id} className="p-6 hover:bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">{projet.titre}</h3>
                <p className="text-sm text-gray-600 mt-1">{projet.description || 'Aucune description'}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>Statut: {projet.statut}</span>
                  <span>Visibilité: {projet.visibiliteSite ? 'Public' : 'Privé'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


