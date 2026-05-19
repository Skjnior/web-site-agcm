import { Metadata } from 'next';
import { assertBureauModuleOrRedirect } from '@/lib/bureau-page-guard';
import RegistreCotisationsClient from '@/components/bureau/RegistreCotisationsClient';
import { prisma } from '@/lib/prisma';
import { formatDateYYYYMMDD, utcTodayDate } from '@/lib/registre-cotisations-utils';

export const metadata: Metadata = {
  title: 'Registre cotisations & absences - Bureau AGCM',
  description: 'Situation des cotisations et absences aux réunions',
};

export default async function BureauRegistreCotisationsPage() {
  await assertBureauModuleOrRedirect('paiements');

  const latest = await prisma.memberRegistreCotisation.findFirst({
    orderBy: { dateReference: 'desc' },
    select: { dateReference: true },
  });
  const initialDateReference = formatDateYYYYMMDD(latest?.dateReference ?? utcTodayDate());

  return (
    <RegistreCotisationsClient
      backHref="/bureau"
      title="Registre cotisations & absences"
      initialDateReference={initialDateReference}
    />
  );
}
