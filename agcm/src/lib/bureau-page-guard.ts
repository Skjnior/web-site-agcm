import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBureauActif, getBureauMandatContext, isSuperAdmin } from '@/lib/rbac';
import { bureauMemberHasModule, type BureauModule } from '@/lib/bureau-poste-perimetre';
import { canManageSiteMediaModule, type SiteMediaModule } from '@/lib/site-media-access';

/**
 * À appeler en tête des pages `/bureau/*` (sauf `/bureau` accueil).
 * Redirige vers `/bureau` si le poste n’a pas le module.
 */
export async function assertBureauModuleOrRedirect(module: BureauModule) {
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

  if (!(await isBureauActif(user.id))) {
    redirect('/');
  }

  const ctx = await getBureauMandatContext(user.id);
  if (!ctx) {
    redirect('/');
  }

  const posteNoms = ctx.affectations.map((a) => a.poste.nom);
  if (!bureauMemberHasModule(user.roleSysteme, posteNoms, module)) {
    redirect('/bureau');
  }

  return { user, ctx };
}

/** Pages galerie / partenaires : super admin ou bureau avec le module. */
export async function assertSiteMediaModuleOrRedirect(module: SiteMediaModule) {
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

  if (isSuperAdmin(user)) {
    const ctx = await getBureauMandatContext(user.id);
    return { user, ctx };
  }

  if (!(await canManageSiteMediaModule(user, module))) {
    redirect('/bureau');
  }

  const ctx = await getBureauMandatContext(user.id);
  if (!ctx && !(await isBureauActif(user.id))) {
    redirect('/');
  }

  return { user, ctx };
}
