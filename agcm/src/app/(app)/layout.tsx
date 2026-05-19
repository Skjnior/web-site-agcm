import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppLayoutClient from '@/components/layout/AppLayoutClient';
import { ALL_BUREAU_MODULES, getBureauPerimetreForPostes, type BureauModule } from '@/lib/bureau-poste-perimetre';
import { getIntranetHomeHref } from '@/lib/intranet-home-href';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const sessionUser = session.user as {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    roleSysteme?: string;
    canAccessIntranet?: boolean;
  };

  const userRole = (sessionUser.roleSysteme || sessionUser.role || 'MEMBER') as
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'MEMBER';

  const isBureau =
    userRole === 'MEMBER' && sessionUser.canAccessIntranet === true;

  if (userRole === 'MEMBER' && !isBureau) {
    redirect('/');
  }

  const { getAffectationActive, getBureauMandatContext } = await import('@/lib/rbac');

  const affectation = isBureau ? await getAffectationActive(session.user.id) : null;

  const userInfo = {
    name: sessionUser.name || sessionUser.email || '',
    email: sessionUser.email || '',
    poste: affectation?.poste.nom,
    mandat: affectation?.mandat
      ? `${new Date(affectation.mandat.dateDebut).getFullYear()} - ${new Date(affectation.mandat.dateFin).getFullYear()}`
      : undefined,
  };

  let allowedBureauModules: BureauModule[] | undefined;
  if (isBureau) {
    const ctxMandat = await getBureauMandatContext(session.user.id);
    allowedBureauModules = ctxMandat
      ? Array.from(getBureauPerimetreForPostes(ctxMandat.affectations.map((a) => a.poste.nom)).modules)
      : ALL_BUREAU_MODULES;
  }

  const intranetHomeHref = getIntranetHomeHref(userRole, { isBureau });

  return (
    <AppLayoutClient
      userRole={userRole}
      isBureau={isBureau}
      intranetHomeHref={intranetHomeHref}
      posteNom={affectation?.poste.nom}
      allowedBureauModules={allowedBureauModules}
      userInfo={userInfo}
    >
      {children}
    </AppLayoutClient>
  );
}



