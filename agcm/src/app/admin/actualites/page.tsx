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

export const metadata: Metadata = {
  title: 'Gestion des actualités - Admin AGCM',
  description: 'Gérer les actualités de l\'AGCM',
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ActualitesAdminPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const userRole = (session.user as any).roleSysteme || session.user.role;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const [actualites, total] = await Promise.all([
    prisma.content.findMany({
      where: { type: 'ACTUALITE' },
      orderBy: { createdAt: 'desc' },
      include: {
        auteurPoste: true,
      },
      skip,
      take: pageSize,
    }),
    prisma.content.count({
      where: { type: 'ACTUALITE' },
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

      {actualites.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-16 text-center shadow-sm">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Aucune actualité trouvée</h3>
          <p className="text-slate-500 mb-6">Commencez par créer votre première actualité pour informer vos membres.</p>
          <Link href="/admin/actualites/nouveau">
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 transition-all rounded-xl">
              Créer une actualité
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Auteur</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actualites.map((actualite) => (
                  <tr key={actualite.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {actualite.imagePrincipale ? (
                          <div className="h-10 w-10 rounded-lg bg-cover bg-center border border-slate-200 shrink-0" style={{ backgroundImage: `url(${actualite.imagePrincipale})` }} />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                        <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{actualite.titre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{actualite.auteurPoste?.nom || 'Administration'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {actualite.createdAt ? format(new Date(actualite.createdAt), 'dd MMM yyyy', { locale: fr }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          actualite.statutWorkflow === 'PUBLIE' ? 'approuve' :
                            actualite.statutWorkflow === 'BROUILLON' ? 'default' :
                              'soumis'
                        }
                      >
                        {actualite.statutWorkflow === 'PUBLIE' ? 'Publié' :
                          actualite.statutWorkflow === 'BROUILLON' ? 'Brouillon' :
                            actualite.statutWorkflow}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/actualites/${actualite.id}/edit`}>
                          <Button variant="edit" size="sm" className="h-8 shadow-sm">
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            Modifier
                          </Button>
                        </Link>
                        {actualite.statutWorkflow === 'PUBLIE' && (
                          <Link href={`/actualites/${actualite.id}`} target="_blank">
                            <Button variant="view" size="sm" className="h-8 shadow-sm">
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Voir
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-slate-200/50 px-6 py-4 flex items-center justify-between bg-slate-50/50">
              <div className="text-sm text-slate-500 font-medium">
                Page {page} sur {totalPages} <span className="text-slate-400">({total} résultats)</span>
              </div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/admin/actualites?page=${page - 1}`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600">Précédent</Button>
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`/admin/actualites?page=${page + 1}`}>
                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600">Suivant</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

