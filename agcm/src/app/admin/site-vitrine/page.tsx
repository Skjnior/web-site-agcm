import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import SiteVitrineAdminClient from './SiteVitrineAdminClient';

export const metadata: Metadata = {
  title: 'Site vitrine - Admin AGCM',
  description: 'Gérer le contenu éditorial du site public',
};

function VitrineFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-slate-400 text-sm">
      Chargement…
    </div>
  );
}

export default async function AdminSiteVitrinePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin');
  }

  return (
    <Suspense fallback={<VitrineFallback />}>
      <SiteVitrineAdminClient />
    </Suspense>
  );
}
