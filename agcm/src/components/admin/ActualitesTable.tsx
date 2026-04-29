'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit, Eye, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SmartImage } from '@/components/ui/smart-image';
import AdminDeleteResourceButton from '@/components/admin/AdminDeleteResourceButton';

interface Actualite {
  id: string;
  titre: string;
  slug: string;
  imagePrincipale: string | null;
  statutWorkflow: string;
  createdAt: Date;
  auteur: {
    prenom: string;
    nom: string;
  } | null;
}

interface ActualitesTableProps {
  actualites: Actualite[];
  isSuperAdmin: boolean;
}

export default function ActualitesTable({ actualites, isSuperAdmin }: ActualitesTableProps) {
  const router = useRouter();

  return (
    <div className="admin-glass overflow-hidden rounded-3xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200/50 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/40">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Publication</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Auteur</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {actualites.map((actualite) => (
              <tr 
                key={actualite.id} 
                onClick={() => router.push(`/admin/actualites/${actualite.id}/edit`)}
                className="cursor-pointer transition-colors group hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {actualite.imagePrincipale ? (
                      <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                        <SmartImage
                          src={actualite.imagePrincipale}
                          alt={actualite.titre}
                          className="h-full w-full object-cover"
                          width={48}
                          height={48}
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                        <UserIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 truncate">{actualite.titre}</span>
                      <span className="text-xs text-slate-500 truncate">/{actualite.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                  {actualite.auteur ? `${actualite.auteur.prenom} ${actualite.auteur.nom}` : 'Système'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                  {format(new Date(actualite.createdAt), 'dd MMM yyyy', { locale: fr })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={
                      actualite.statutWorkflow === 'PUBLIE' ? 'approuve' :
                        actualite.statutWorkflow === 'BROUILLON' ? 'default' :
                          actualite.statutWorkflow}
                  >
                    {actualite.statutWorkflow}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/actualites/${actualite.id}/edit`}>
                      <Button variant="edit" size="sm" className="h-8 shadow-sm">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Modifier
                      </Button>
                    </Link>
                    <Link href={`/actualites/${actualite.slug}`} target="_blank">
                      <Button variant="view" size="sm" className="h-8 shadow-sm">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Voir
                      </Button>
                    </Link>
                    <AdminDeleteResourceButton
                      apiUrl={`/api/admin/actualites/${actualite.id}`}
                      title="Supprimer l'actualité"
                      message={`Êtes-vous sûr de vouloir supprimer l'actualité « ${actualite.titre} » ? Cette action est irréversible.`}
                      isSuperAdmin={isSuperAdmin}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
