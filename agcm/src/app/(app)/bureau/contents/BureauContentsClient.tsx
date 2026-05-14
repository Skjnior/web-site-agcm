'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search as SearchIcon, X } from 'lucide-react';
import ContentsList from '@/components/bureau/ContentsList';

const BUREAU_CONTENT_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tous' },
  { value: 'BROUILLON', label: 'Brouillons' },
  { value: 'SOUMIS', label: 'En attente' },
  { value: 'APPROUVE', label: 'Approuvés' },
  { value: 'PUBLIE', label: 'Publiés' },
  { value: 'REJETE', label: 'Rejetés' },
] as const;

interface Content {
  id: string;
  type: string;
  titre: string;
  contenu: string | null;
  statutWorkflow: string;
  visibiliteCible: string;
  createdAt: Date;
  rejectionReason: string | null;
  auteurPoste?: {
    id: string;
    nom: string;
    description: string | null;
  } | null;
  mandat?: {
    id: string;
    titre: string;
    dateDebut: Date;
    dateFin: Date;
  } | null;
  approvedBy?: {
    id: string;
    email: string;
  } | null;
  /** Calculé côté serveur (RBAC) */
  canDelete?: boolean;
}

interface BureauContentsClientProps {
  initialContents: Content[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  initialStatus: string;
  initialSearch?: string;
  /** Force ce statut (ex: REJETE pour la page rejetes) */
  forceStatus?: string;
}

export default function BureauContentsClient({
  initialContents,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialStatus,
  initialSearch = '',
  forceStatus,
}: BureauContentsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchDraft, setSearchDraft] = useState(initialSearch);

  useEffect(() => {
    setSearchDraft(initialSearch);
  }, [initialSearch]);

  const contentsBasePath = forceStatus === 'REJETE' ? '/bureau/contents/rejetes' : '/bureau/contents';
  const status = forceStatus || searchParams.get('status') || initialStatus || 'ALL';
  const urlSearch = searchParams.get('search') || '';

  const handleFilterChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    params.set('status', newStatus);
    router.push(`${contentsBasePath}?${params.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    const term = searchDraft.trim();
    if (term) params.set('search', term);
    else params.delete('search');
    router.push(`${contentsBasePath}?${params.toString()}`);
  };

  const hasActiveFilters = Boolean(urlSearch) || (!forceStatus && status !== 'ALL');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-0 flex-1 sm:min-w-[min(100%,220px)]">
              <label htmlFor="bureau-content-search" className="mb-1.5 block text-xs font-medium text-slate-400">
                Recherche
              </label>
              <div className="relative flex items-center gap-2">
                <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
                <Input
                  id="bureau-content-search"
                  placeholder="Titre ou contenu..."
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="border-slate-600 bg-slate-900/50 pl-10 text-slate-100"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleSearch} className="shrink-0">
                  <SearchIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!forceStatus && (
              <div className="w-full sm:max-w-xs md:hidden">
                <label htmlFor="bureau-content-status" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Statut
                </label>
                <Select value={status} onValueChange={handleFilterChange}>
                  <SelectTrigger
                    id="bureau-content-status"
                    className="w-full border-slate-600 bg-slate-900/50 text-slate-100"
                  >
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUREAU_CONTENT_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => router.push(contentsBasePath)}
                size="sm"
                className="w-full shrink-0 sm:ml-auto sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>

          {!forceStatus && (
            <div className="hidden border-t border-slate-700/50 pt-3 md:block">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Filtrer par statut</p>
              <div className="flex flex-wrap gap-2">
                {BUREAU_CONTENT_STATUS_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={status === opt.value ? 'default' : 'outline'}
                    size="sm"
                    className="border-slate-600 text-slate-200 hover:bg-slate-800"
                    onClick={() => handleFilterChange(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ContentsList
        contents={initialContents}
        currentPage={initialPage}
        totalPages={initialTotalPages}
        total={initialTotal}
        isSuperAdmin={false}
        basePath={contentsBasePath}
        pageSize={20}
        getPaginationHref={(pageNum) => {
          const p = new URLSearchParams(searchParams.toString());
          p.set('page', String(pageNum));
          if (forceStatus) {
            p.delete('status');
          } else if (status && status !== 'ALL') {
            p.set('status', status);
          }
          const q = p.get('search');
          if (!q) p.delete('search');
          return `${contentsBasePath}?${p.toString()}`;
        }}
      />
    </div>
  );
}
