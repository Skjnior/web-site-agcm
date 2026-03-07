'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, X, FileText } from 'lucide-react';
import ContentsList from '@/components/bureau/ContentsList';

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
  const [contents, setContents] = useState<Content[]>(initialContents);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [status, setStatus] = useState(forceStatus || initialStatus);
  const [search, setSearch] = useState(searchParams.get('search') || initialSearch);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const statusValue = forceStatus || searchParams.get('status') || 'ALL';
    const searchValue = searchParams.get('search') || '';
    const pageValue = parseInt(searchParams.get('page') || '1');
    setStatus(statusValue);
    setSearch(searchValue);
    setPage(pageValue);
  }, [searchParams, forceStatus]);

  useEffect(() => {
    fetchContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        status: forceStatus || status,
      });
      const searchValue = searchParams.get('search') || '';
      if (searchValue) params.set('search', searchValue);

      const response = await fetch(`/api/bureau/contents?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur chargement');

      const result = await response.json();
      setContents(result.data || []);
      setTotal(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    params.set('status', newStatus);
    router.push(`/bureau/contents?${params.toString()}`);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (search) params.set('search', search);
    else params.delete('search');
    router.push(`/bureau/contents?${params.toString()}`);
  };

  const hasActiveFilters = search || (status && status !== 'ALL');

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative flex items-center gap-2">
              <SearchIcon className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Rechercher par titre ou contenu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-slate-900/50 border-slate-600 text-slate-100"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleSearch} className="shrink-0">
                <SearchIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" onClick={() => router.push('/bureau/contents')} size="sm">
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {!forceStatus && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="flex gap-2 border-b border-slate-700/50 p-2 overflow-x-auto">
            {['ALL', 'BROUILLON', 'SOUMIS', 'APPROUVE', 'PUBLIE', 'REJETE'].map((s) => (
              <Button
                key={s}
                variant={status === s ? 'default' : 'ghost'}
                size="sm"
                className="rounded-b-none whitespace-nowrap"
                onClick={() => handleFilterChange(s)}
              >
                {s === 'ALL' ? 'Tous' : s === 'BROUILLON' ? 'Brouillons' : s === 'SOUMIS' ? 'En attente' : s === 'APPROUVE' ? 'Approuvés' : s === 'PUBLIE' ? 'Publiés' : 'Rejetés'}
              </Button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-slate-400">Chargement...</p>
        </div>
      ) : (
        <ContentsList
          contents={contents}
          currentPage={page}
          totalPages={totalPages}
          total={total}
          isSuperAdmin={false}
          basePath={forceStatus === 'REJETE' ? '/bureau/contents/rejetes' : '/bureau/contents'}
        />
      )}
    </div>
  );
}
