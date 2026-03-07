import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getAffectationActive, isBureauActif } from '@/lib/rbac';

// Rediriger vers le dashboard approprié selon le rôle
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

  // Rediriger selon le rôle
  if (user.roleSysteme === 'SUPER_ADMIN') {
    redirect('/admin');
  } else if (user.roleSysteme === 'ADMIN') {
    redirect('/admin');
  } else {
    const bureauActif = await isBureauActif(user.id);
    if (bureauActif) {
      redirect('/bureau');
    } else {
      redirect('/app/dashboard');
    }
  }
}



