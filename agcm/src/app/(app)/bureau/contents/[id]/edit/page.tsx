import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isBureauActif, canModifyContent } from '@/lib/rbac';
import BureauContentEditForm from './BureauContentEditForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Modifier le contenu - Bureau AGCM',
  description: 'Modifier le contenu',
};

export default async function BureauContentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect('/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect('/connexion');
  }

  const bureauActif = await isBureauActif(user.id);
  if (!bureauActif) {
    redirect('/app/dashboard');
  }

  const content = await prisma.content.findUnique({
    where: { id },
  });

  if (!content) {
    notFound();
  }

  const { canModify } = await canModifyContent(user.id, id);
  if (!canModify) {
    redirect('/bureau/contents');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/bureau/contents/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Modifier le contenu</h1>
          <p className="text-slate-400 mt-1">{content.titre}</p>
        </div>
      </div>

      <BureauContentEditForm contentId={id} initialContent={content} />
    </div>
  );
}
