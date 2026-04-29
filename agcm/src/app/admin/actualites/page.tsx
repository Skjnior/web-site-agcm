// app/admin/actualites/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Plus, FileText, Image as ImageIcon } from 'lucide-react';
import AdminDeleteResourceButton from '@/components/admin/AdminDeleteResourceButton';
import ActualitesFilters from '@/components/admin/ActualitesFilters';
import ActualitesTable from '@/components/admin/ActualitesTable';
import { StatutWorkflow } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Gestion des actualités - Admin AGCM',
  description: 'Gérer les actualités de l\'AGCM',
};

type Props = {
  searchParams: Promise<{ 
    page?: string;
    q?: string;
    status?: string;
    type?: string;
  }>;
};

export default async function ActualitesAdminPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const userRole = (session.user as { roleSysteme?: string; role?: string }).roleSysteme || session.user.role;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    redirect('/dashboard');
  }

  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const q = params.q || '';
  const statusFilter = params.status || 'all';
  const typeFilter = params.type || 'all';
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  
  if (q) {
    where.titre = { contains: q, mode: 'insensitive' };
  }
  
  if (statusFilter && statusFilter !== 'all') {
    where.statutWorkflow = statusFilter as StatutWorkflow;
  }

  if (typeFilter && typeFilter !== 'all') {
    where.type = typeFilter;
  }

  const [actualites, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        auteurPoste: true,
      },
      skip,
      take: pageSize,
    }),
    prisma.content.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            Gestion des actualités
          </h1>
          <p className="text-slate-500 mt-1">Créer et gérer les publications</p>
        </div>
        <Link href="/admin/actualites/nouveau">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-105 rounded-xl font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle actualité
          </Button>
        </Link>
      </div>

      <ActualitesFilters />

      {actualites.length === 0 ? (
        <div className="admin-glass rounded-3xl p-16 text-center shadow-sm">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            {q || (statusFilter && statusFilter !== 'all') 
              ? 'Aucun résultat pour vos filtres' 
              : 'Aucune actualité trouvée'}
          </h3>
          <p className="text-slate-500 mb-6">
            {q || (statusFilter && statusFilter !== 'all')
              ? 'Essayez de modifier vos termes de recherche ou vos filtres.'
              : 'Commencez par créer votre première actualité pour informer vos membres.'}
          </p>
          {!q && (!statusFilter || statusFilter === 'all') && (
            <Link href="/admin/actualites/nouveau">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 transition-all rounded-xl">
                Créer une actualité
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <ActualitesTable actualites={actualites as any} isSuperAdmin={isSuperAdmin} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200/50 bg-slate-50/50 px-6 py-4 dark:border-slate-700/50 dark:bg-slate-900/40">
              <div className="text-sm text-slate-500 font-medium">
                Page {page} sur {totalPages} <span className="text-slate-400">({total} résultats)</span>
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/admin/actualites?page=${page - 1}${q ? `&q=${q}` : ''}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${typeFilter !== 'all' ? `&type=${typeFilter}` : ''}`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600">Précédent</Button>
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`/admin/actualites?page=${page + 1}${q ? `&q=${q}` : ''}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${typeFilter !== 'all' ? `&type=${typeFilter}` : ''}`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600">Suivant</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

