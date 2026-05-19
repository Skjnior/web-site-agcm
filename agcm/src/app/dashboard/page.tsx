import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBureauActif } from '@/lib/rbac';

/**
 * Routeur central : hors du layout (app) pour que les MEMBER simples
 * puissent être renvoyés vers le site public sans passer par l'intranet.
 */
export default async function DashboardRouter() {
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

  if (user.roleSysteme === 'SUPER_ADMIN') {
    redirect('/admin');
  }
  if (user.roleSysteme === 'ADMIN') {
    redirect('/admin');
  }

  const bureauActif = await isBureauActif(user.id);
  if (bureauActif) {
    redirect('/bureau');
  }

  redirect('/');
}
