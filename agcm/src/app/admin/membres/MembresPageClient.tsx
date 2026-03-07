'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon, X } from 'lucide-react';
import MembersTable from '@/components/admin/MembersTable';

interface Member {
  id: string;
  prenom: string;
  nom: string;
  email?: string;
  telephone: string | null;
  ville: string | null;
  pays: string | null;
  statutMembre: string;
  memberType: string | null;
  dateAdhesion: Date | null;
  user: {
    id: string;
    email: string;
    role: string;
  };
  canAct: boolean;
}

interface Stats {
  total: number;
  actifs: number;
  suspendus: number;
  radies: number;
}

interface MembresPageClientProps {
  initialMembers: Member[];
  initialStats: Stats;
  initialTotal: number;
  initialPage: number;
  initialTotalPages: number;
  initialStatusFilter?: string;
  initialTypeFilter?: string;
  initialSearch?: string;
  currentUserRole: string;
  currentUserId: string;
}

export default function MembresPageClient({
  initialMembers,
  initialStats,
  initialTotal,
  initialPage,
  initialTotalPages,
  initialStatusFilter,
  initialTypeFilter,
  initialSearch,
  currentUserRole,
  currentUserId,
}: MembresPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(initialSearch || '');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || 'all');
  const [typeFilter, setTypeFilter] = useState(initialTypeFilter || 'all');

  useEffect(() => {
    const searchValue = searchParams.get('q') || '';
    const statusValue = searchParams.get('status') || 'all';
    const typeValue = searchParams.get('type') || 'all';
    const pageValue = parseInt(searchParams.get('page') || '1');

    setSearch(searchValue);
    setStatusFilter(statusValue);
    setTypeFilter(typeValue);
    setPage(pageValue);
  }, [searchParams]);

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, typeFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });

      const searchValue = searchParams.get('q') || '';
      const statusValue = searchParams.get('status') || '';
      const typeValue = searchParams.get('type') || '';

      if (searchValue) params.set('q', searchValue);
      if (statusValue && statusValue !== 'all') params.set('status', statusValue);
      if (typeValue && typeValue !== 'all') params.set('type', typeValue);

      const response = await fetch(`/api/admin/membres?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const result = await response.json();
      setMembers(result.data || []);
      setTotal(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);

      // Fetch stats
      const statsResponse = await fetch('/api/admin/membres/stats');
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

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`);
  };

  const handleSearch = () => {
    handleFilterChange('q', search);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    router.push('/admin/membres');
  };

  const hasActiveFilters = searchParams.get('q') ||
    (searchParams.get('status') && searchParams.get('status') !== 'all') ||
    (searchParams.get('type') && searchParams.get('type') !== 'all');

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des membres</h1>
          <p className="text-gray-600 mt-1">
            Gérer les membres et leurs validations
          </p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-700">Radiés</div>
          <div className="text-2xl font-bold text-orange-900">{stats.radies}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700">Actifs</div>
          <div className="text-2xl font-bold text-green-900">{stats.actifs}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-700">Suspendus</div>
          <div className="text-2xl font-bold text-red-900">{stats.suspendus}</div>
        </div>
      </div>

      {/* Filtres de recherche */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative flex items-center gap-2">
              <SearchIcon className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Rechercher par nom, email, téléphone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10 text-gray-900"
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
          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) => {
              setStatusFilter(value);
              handleFilterChange('status', value);
            }}
          >
            <SelectTrigger className="w-[180px] text-gray-900">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all" className="text-gray-900">Tous les statuts</SelectItem>
              <SelectItem value="EN_ATTENTE" className="text-gray-900">En attente</SelectItem>
              <SelectItem value="ACTIF" className="text-gray-900">Actif</SelectItem>
              <SelectItem value="SUSPENDU" className="text-gray-900">Suspendu</SelectItem>
              <SelectItem value="RADIE" className="text-gray-900">Radié</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={typeFilter || 'all'}
            onValueChange={(value) => {
              setTypeFilter(value);
              handleFilterChange('type', value);
            }}
          >
            <SelectTrigger className="w-[180px] text-gray-900">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all" className="text-gray-900">Tous les types</SelectItem>
              <SelectItem value="ETUDIANT" className="text-gray-900">Étudiant</SelectItem>
              <SelectItem value="PROFESSIONNEL" className="text-gray-900">Professionnel</SelectItem>
              <SelectItem value="HONORAIRE" className="text-gray-900">Honoraire</SelectItem>
              <SelectItem value="PARTENAIRE" className="text-gray-900">Partenaire</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleResetFilters} size="sm">
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : (
        <>
          <MembersTable
            members={members}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            onMemberDeleted={fetchMembers}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Affichage de {((page - 1) * 20) + 1} à {Math.min(page * 20, total)} sur {total}
              </div>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(page - 1));
                      router.push(`?${params.toString()}`);
                    }}
                  >
                    Précédent
                  </Button>
                )}
                {/* Numéros de page */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className="min-w-[40px]"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          params.set('page', String(pageNum));
                          router.push(`?${params.toString()}`);
                        }}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                {page < totalPages && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(page + 1));
                      router.push(`?${params.toString()}`);
                    }}
                  >
                    Suivant
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

