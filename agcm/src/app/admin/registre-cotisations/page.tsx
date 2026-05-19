import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import RegistreCotisationsClient from '@/components/bureau/RegistreCotisationsClient';
import { prisma } from '@/lib/prisma';
import { formatDateYYYYMMDD, utcTodayDate } from '@/lib/registre-cotisations-utils';

export const metadata: Metadata = {
  title: 'Registre cotisations & absences - Admin AGCM',
  description: 'Situation des cotisations et absences (accès présidence / admin)',
};

export default async function AdminRegistreCotisationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/connexion');
  }

  const role =
    (session.user as { roleSysteme?: string }).roleSysteme ?? session.user.role;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    redirect('/bureau/registre-cotisations');
  }

  const latest = await prisma.memberRegistreCotisation.findFirst({
    orderBy: { dateReference: 'desc' },
    select: { dateReference: true },
  });
  const initialDateReference = formatDateYYYYMMDD(latest?.dateReference ?? utcTodayDate());

  return (
    <RegistreCotisationsClient
      backHref="/admin"
      title="Registre cotisations & absences"
      initialDateReference={initialDateReference}
    />
  );
}
