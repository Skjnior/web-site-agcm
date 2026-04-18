'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-100">
            <FileText className="h-8 w-8" />
            Gestion des contenus
          </h1>
          <p className="mt-1 text-slate-400">
            Super Admin : Visualisez et gérez tous les contenus de la plateforme
          </p>
        </div>
        <Link href="/bureau/contents/nouveau">
          <Button variant="add">
            <Plus className="h-4 w-4 mr-2" />
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

      {/* Filtres de recherche */}
      <div className="admin-panel p-4 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative flex items-center gap-2">
              <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Rechercher par titre ou contenu..."
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
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleResetFilters} size="sm">
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Filtres par statut */}
      <div className="admin-panel border overflow-hidden">
        <div className="flex gap-2 overflow-x-auto border-b border-slate-700 p-2">
          <Link href="/admin/contents?status=ALL">
            <Button
              variant={status === 'ALL' ? 'default' : 'ghost'}
              className="rounded-b-none whitespace-nowrap"
            >
              Tous ({stats.brouillon + stats.soumis + stats.approuve + stats.publie + stats.rejete + stats.archive})
            </Button>
          </Link>
          <Link href="/admin/contents?status=BROUILLON">
            <Button
              variant={status === 'BROUILLON' ? 'default' : 'ghost'}
              className="rounded-b-none whitespace-nowrap"
            >
              Brouillons ({stats.brouillon})
            </Button>
          </Link>
          <Link href="/admin/contents?status=SOUMIS">
            <Button
              variant={status === 'SOUMIS' ? 'default' : 'ghost'}
              className="rounded-b-none whitespace-nowrap"
            >
              En attente ({stats.soumis})
            </Button>
          </Link>
          <Link href="/admin/contents?status=APPROUVE">
            <Button
              variant={status === 'APPROUVE' ? 'default' : 'ghost'}
              className="rounded-b-none whitespace-nowrap"
            >
              Approuvés ({stats.approuve})
            </Button>
          </Link>
          <Link href="/admin/contents?status=PUBLIE">
            <Button
              variant={status === 'PUBLIE' ? 'default' : 'ghost'}
              className="rounded-b-none whitespace-nowrap"
            >
              Publiés ({stats.publie})
            </Button>
          </Link>
          <Link href="/admin/contents?status=REJETE">
            <Button
              variant={status === 'REJETE' ? 'default' : 'ghost'}
              className="rounded-b-none whitespace-nowrap"
            >
              Rejetés ({stats.rejete})
            </Button>
          </Link>
          <Link href="/admin/contents?status=ARCHIVE">
            <Button
              variant={status === 'ARCHIVE' ? 'default' : 'ghost'}
              className="rounded-b-none whitespace-nowrap"
            >
              Archivés ({stats.archive})
            </Button>
          </Link>
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

