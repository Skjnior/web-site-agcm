import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isBureauActif } from '@/lib/rbac';

/**
 * Routeur central : hors du layout (app) pour que les MEMBER simples
 * puissent être renvoyés vers le site public sans passer par l'intranet.
 *
 * Admins et bureau sont redirigés à partir du JWT quand possible (évite un `users.findUnique`
 * puis un second aller-retour Postgres). Fallback DB uniquement pour MEMBER dont le token pourrait être
 * obsolète sans `canAccessIntranet`.
 */
export default async function DashboardRouter() {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const u = session.user as {
    id?: string;
    role?: string;
    roleSysteme?: string;
    canAccessIntranet?: boolean;
  };

  const role = u.roleSysteme || u.role || 'MEMBER';

  if (!u.id) {
    redirect('/connexion');
  }

  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    redirect('/admin');
  }

  if (u.canAccessIntranet === true) {
    redirect('/bureau');
  }

  if (role === 'MEMBER') {
    const bureauActif = await isBureauActif(u.id);
    if (bureauActif) {
      redirect('/bureau');
    }
  }

  redirect('/');
}
