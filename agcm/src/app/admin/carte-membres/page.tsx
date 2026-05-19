import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CartesAdhesionClient from '@/components/admin/CartesAdhesionClient';

export const metadata: Metadata = {
  title: 'Cartes d’adhérent - AGCM',
  description:
    'Modèles de cartes membres (photo, coordonnées, bureau exécutif) pour impression — présidence / administration.',
};

export default async function CarteMembresPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { roleSysteme: true },
  });

  if (!user || (user.roleSysteme !== 'ADMIN' && user.roleSysteme !== 'SUPER_ADMIN')) {
    redirect('/dashboard');
  }

  return <CartesAdhesionClient />;
}
