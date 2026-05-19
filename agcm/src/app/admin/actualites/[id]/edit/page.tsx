// app/admin/actualites/[id]/edit/page.tsx
import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ActualiteForm, { ActualiteFormData } from '@/components/admin/ActualiteForm';

export const metadata: Metadata = {
  title: 'Modifier actualité - Admin AGCM',
  description: 'Modifier une actualité',
};

type EditActualitePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditActualitePage({ params }: EditActualitePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const userRole = (session.user as any).roleSysteme || session.user.role;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    redirect('/dashboard');
  }

  const resolvedParams = await params;
  const actualite = await prisma.content.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!actualite) {
    notFound();
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const resumeFromContenu = (raw: string | null) => {
    if (!raw) return '';
    const plain = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const max = 400;
    return plain.length <= max ? plain : `${plain.slice(0, max)}…`;
  };

  const initialData: Partial<ActualiteFormData> = {
    titre: actualite.titre,
    slug: actualite.id,
    resume: resumeFromContenu(actualite.contenu),
    content: actualite.contenu || '',
    categorie: actualite.type,
    tags: actualite.tags?.length ? actualite.tags.join(', ') : '',
    imageUrl: actualite.imagePrincipale || '',
    auteur: '',
    published: actualite.statutWorkflow === 'PUBLIE',
    datePublication: formatDateForInput(actualite.approvedAt),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Modifier l'actualité</h1>
        <p className="text-slate-500 mt-1">{actualite.titre}</p>
      </div>

      <ActualiteForm actualiteId={resolvedParams.id} initialData={initialData} />
    </div>
  );
}

