'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Edit, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminDeleteResourceButton from '@/components/admin/AdminDeleteResourceButton';

interface Evenement {
  id: string;
  titre: string;
  slug: string;
  lieu: string | null;
  dateDebut: Date | null;
  statut: string;
  afficheSite: boolean;
}

interface EvenementsTableProps {
  evenements: Evenement[];
  isSuperAdmin: boolean;
}

export default function EvenementsTable({ evenements, isSuperAdmin }: EvenementsTableProps) {
  const router = useRouter();

  return (
    <div className="admin-glass overflow-hidden rounded-3xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200/50 bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/40">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Titre & Lieu</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Visibilité Site</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {evenements.map((evenement) => (
              <tr 
                key={evenement.id} 
                onClick={() => router.push(`/admin/evenements/${evenement.id}/edit`)}
                className="cursor-pointer transition-colors group hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100">{evenement.titre}</span>
                    {evenement.lieu && (
                      <span className="text-sm text-slate-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {evenement.lieu}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2 text-slate-400" />
                    {evenement.dateDebut ? format(new Date(evenement.dateDebut), 'dd MMM yyyy', { locale: fr }) : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={
                      evenement.statut === 'PASSE' ? 'default' :
                        evenement.statut === 'EN_COURS' ? 'soumis' :
                          'approuve'
                    }
                  >
                    {evenement.statut === 'PASSE' ? 'Terminé' :
                      evenement.statut === 'EN_COURS' ? 'En cours' :
                        'À venir'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${evenement.afficheSite
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}
                  >
                    {evenement.afficheSite ? 'Oui' : 'Non'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/evenements/${evenement.id}/edit`}>
                      <Button variant="edit" size="sm" className="h-8 shadow-sm">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Modifier
                      </Button>
                    </Link>
                    {evenement.afficheSite && (
                      <Link href={`/evenements/${evenement.slug}`} target="_blank">
                        <Button variant="view" size="sm" className="h-8 shadow-sm">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Voir
                        </Button>
                      </Link>
                    )}
                    <AdminDeleteResourceButton
                      apiUrl={`/api/admin/evenements/${evenement.id}`}
                      title="Supprimer l'événement"
                      message={`Êtes-vous sûr de vouloir supprimer l'événement « ${evenement.titre} » ? Cette action est irréversible.`}
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
