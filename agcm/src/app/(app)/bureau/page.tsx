import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAffectationActive, isBureauActif } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Calendar, FolderOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard Bureau - AGCM',
  description: 'Tableau de bord bureau',
};

export default async function BureauDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect('/connexion');
  }

  // Vérifier que l'utilisateur est membre du bureau
  const bureauActif = await isBureauActif(user.id);
  if (!bureauActif) {
    redirect('/app/dashboard');
  }

  const affectation = await getAffectationActive(user.id);
  const mandatActif = await getMandatActif();

  if (!affectation || !mandatActif) {
    redirect('/app/dashboard');
  }

  // Récupérer les statistiques du poste
  const [myContents, myProjets, myEvents, pendingContents] = await Promise.all([
    prisma.content.count({
      where: {
        auteurPosteId: affectation.posteId,
        mandatId: mandatActif.id,
      },
    }),
    prisma.projet.count({
      where: {
        responsablePosteId: affectation.posteId,
        mandatId: mandatActif.id,
      },
    }),
    prisma.event.count({
      where: {
        createdByPosteId: affectation.posteId,
        mandatId: mandatActif.id,
      },
    }),
    prisma.content.count({
      where: {
        auteurPosteId: affectation.posteId,
        mandatId: mandatActif.id,
        statutWorkflow: 'SOUMIS',
      },
    }),
  ]);

  const publishedContents = await prisma.content.count({
    where: {
      auteurPosteId: affectation.posteId,
      mandatId: mandatActif.id,
      statutWorkflow: 'PUBLIE',
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard - {affectation.poste.nom}
        </h1>
        <p className="text-gray-600 mt-1">
          Mandat {new Date(mandatActif.dateDebut).getFullYear()} - {new Date(mandatActif.dateFin).getFullYear()}
        </p>
      </div>

      {/* Statistiques du poste */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mes activités</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{myContents}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Publiées</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{publishedContents}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingContents}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projets</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{myProjets}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <FolderOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/bureau/contents/nouveau">
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Créer une activité
            </Button>
          </Link>
          <Link href="/bureau/projets/nouveau">
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Créer un projet
            </Button>
          </Link>
          <Link href="/bureau/evenements/nouveau">
            <Button className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Créer un événement
            </Button>
          </Link>
        </div>
      </div>

      {/* Activités récentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mes activités récentes</h2>
        </div>
        <div className="p-6">
          <Link href="/bureau/contents">
            <Button variant="outline">
              Voir toutes mes activités
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}



