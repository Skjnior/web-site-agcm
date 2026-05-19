'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search as SearchIcon, X, FileText } from 'lucide-react';
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

interface SuperAdminContentsClientProps {
  initialContents: Content[];
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  initialStatus: string;
  initialStats: {
    brouillon: number;
    soumis: number;
    approuve: number;
    publie: number;
    rejete: number;
    archive: number;
  };
}

export default function SuperAdminContentsClient({
  initialContents,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialStatus,
  initialStats,
}: SuperAdminContentsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contents, setContents] = useState<Content[]>(initialContents);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [status, setStatus] = useState(initialStatus);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const statusValue = searchParams.get('status') || 'ALL';
    const searchValue = searchParams.get('search') || '';
    const pageValue = parseInt(searchParams.get('page') || '1');
    
    setStatus(statusValue);
    setSearch(searchValue);
    setPage(pageValue);
  }, [searchParams]);

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
        status: status,
      });

      const searchValue = searchParams.get('search') || '';
      if (searchValue) {
        params.set('search', searchValue);
      }

      const response = await fetch(`/api/super-admin/contents?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const result = await response.json();
      setContents(result.data || []);
      setTotal(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);
      
      // Récupérer les stats
      const statsResponse = await fetch('/api/super-admin/contents/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    router.push(`/admin/contents?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearch('');
    router.push('/admin/contents');
  };

  const hasActiveFilters = search || (status && status !== 'ALL');

  const goToStatus = (newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    params.set('status', newStatus);
    router.push(`/admin/contents?${params.toString()}`);
  };

  const hrefForStatusFilter = (value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('status', value);
    p.set('page', '1');
    return `/admin/contents?${p.toString()}`;
  };

  const adminStatusOptions = useMemo(() => {
    const totalAll =
      stats.brouillon +
      stats.soumis +
      stats.approuve +
      stats.publie +
      stats.rejete +
      stats.archive;
    return [
      { value: 'ALL', label: `Tous (${totalAll})` },
      { value: 'BROUILLON', label: `Brouillons (${stats.brouillon})` },
      { value: 'SOUMIS', label: `En attente (${stats.soumis})` },
      { value: 'APPROUVE', label: `Approuvés (${stats.approuve})` },
      { value: 'PUBLIE', label: `Publiés (${stats.publie})` },
      { value: 'REJETE', label: `Rejetés (${stats.rejete})` },
      { value: 'ARCHIVE', label: `Archivés (${stats.archive})` },
    ];
  }, [stats]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 pb-8 text-slate-100 sm:space-y-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100 sm:text-3xl">
            <FileText className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
            Gestion des contenus
          </h1>
          <p className="mt-1 text-slate-400">
            Super Admin : Visualisez et gérez tous les contenus de la plateforme
          </p>
        </div>
        <Link href="/bureau/contents/nouveau" className="shrink-0 lg:self-start">
          <Button variant="add" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau contenu
          </Button>
        </Link>
      </div>

      {/* Alerte Super Admin */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-950/40 p-4">
        <p className="text-sm text-blue-200">
          🔑 <strong>Super Admin :</strong> Vous avez accès à tous les contenus de tous les membres du bureau. Vous pouvez modifier, supprimer ou publier n'importe quel contenu.
        </p>
      </div>

      {/* Recherche + filtres statut */}
      <div className="admin-panel p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-0 flex-1 sm:min-w-[min(100%,220px)]">
              <label htmlFor="admin-content-search" className="mb-1.5 block text-xs font-medium text-slate-400">
                Recherche
              </label>
              <div className="relative flex items-center gap-2">
                <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
                <Input
                  id="admin-content-search"
                  placeholder="Titre ou contenu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="border-slate-600 bg-slate-800/50 pl-10 text-slate-100 placeholder:text-slate-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSearch}
                  className="shrink-0"
                >
                  <SearchIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="w-full sm:max-w-xs md:hidden">
              <label htmlFor="admin-content-status" className="mb-1.5 block text-xs font-medium text-slate-400">
                Statut
              </label>
              <Select value={status} onValueChange={goToStatus}>
                <SelectTrigger
                  id="admin-content-status"
                  className="w-full border-slate-600 bg-slate-800/50 text-slate-100"
                >
                  <SelectValue placeholder="Choisir un statut" />
                </SelectTrigger>
                <SelectContent>
                  {adminStatusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                size="sm"
                className="w-full shrink-0 sm:ml-auto sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>

          <div className="hidden border-t border-slate-700 pt-3 md:block">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Filtrer par statut</p>
            <div className="flex flex-wrap gap-2">
              {adminStatusOptions.map((opt) => (
                <Button
                  key={opt.value}
                  asChild
                  variant={status === opt.value ? 'default' : 'outline'}
                  size="sm"
                  className="border-slate-600 text-slate-200 hover:bg-slate-800"
                >
                  <Link href={hrefForStatusFilter(opt.value)}>{opt.label}</Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des contenus */}
      {loading ? (
        <div className="admin-panel p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-400">Chargement...</p>
        </div>
      ) : (
        <ContentsList
          contents={contents}
          currentPage={page}
          totalPages={totalPages}
          total={total}
          isSuperAdmin={true}
          basePath="/admin/contents"
          pageSize={20}
          getPaginationHref={(p) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(p));
            return `/admin/contents?${params.toString()}`;
          }}
        />
      )}
    </div>
  );
}

