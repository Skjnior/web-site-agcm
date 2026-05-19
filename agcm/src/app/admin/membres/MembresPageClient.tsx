'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search as SearchIcon, X, UserPlus, Info } from 'lucide-react';
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
  /** Au moins une affectation « bureau » active sur le mandat en cours */
  isBureauActuel: boolean;
  postesBureau: string | null;
  isAdherentSansCompte?: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
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
  initialBureauOnly?: boolean;
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
  initialBureauOnly,
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
  const [bureauFilter, setBureauFilter] = useState<'all' | 'bureau'>(
    initialBureauOnly ? 'bureau' : 'all'
  );

  useEffect(() => {
    const searchValue = searchParams.get('q') || '';
    const statusValue = searchParams.get('status') || 'all';
    const typeValue = searchParams.get('type') || 'all';
    const pageValue = parseInt(searchParams.get('page') || '1');
    const bureauValue = searchParams.get('bureau') === '1' ? 'bureau' : 'all';

    setSearch(searchValue);
    setStatusFilter(statusValue);
    setTypeFilter(typeValue);
    setPage(pageValue);
    setBureauFilter(bureauValue);
  }, [searchParams]);

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
      if (searchParams.get('bureau') === '1') params.set('bureau', '1');

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
    setBureauFilter('all');
    router.push('/admin/membres');
  };

  const hasActiveFilters =
    searchParams.get('q') ||
    (searchParams.get('status') && searchParams.get('status') !== 'all') ||
    (searchParams.get('type') && searchParams.get('type') !== 'all') ||
    searchParams.get('bureau') === '1';

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-gray-900 dark:text-slate-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Gestion des membres</h1>
          <p className="mt-1 text-gray-600 dark:text-slate-400">
            Gérer les membres et leurs validations
          </p>
        </div>
        {currentUserRole === 'SUPER_ADMIN' && (
          <Link href="/admin/users/nouveau" className="shrink-0">
            <Button variant="add">
              <UserPlus className="mr-2 h-4 w-4" />
              Créer un compte membre
            </Button>
          </Link>
        )}
      </div>

      {currentUserRole === 'ADMIN' && (
        <div
          role="note"
          className="flex gap-3 rounded-xl border border-blue-200/80 bg-blue-50/90 p-4 text-sm text-slate-700 dark:border-blue-900/40 dark:bg-blue-950/35 dark:text-slate-300"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
          <p>
            Il n’y a pas de fiche « membre seul » sans compte : chaque membre est lié à un{' '}
            <strong className="text-slate-900 dark:text-slate-100">utilisateur</strong> (email + mot de passe). La
            création de comptes est réservée aux{' '}
            <strong className="text-slate-900 dark:text-slate-100">super administrateurs</strong> (menu{' '}
            <strong>Utilisateurs</strong> → <strong>Nouvel utilisateur</strong>), qui crée en une fois le compte et la
            fiche membre.
          </p>
        </div>
      )}

      {currentUserRole === 'SUPER_ADMIN' && (
        <div
          role="note"
          className="flex flex-col gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-slate-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-slate-300"
        >
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
            <div className="space-y-2">
              <p>
                <strong className="text-slate-900 dark:text-slate-100">Membre</strong> et{' '}
                <strong className="text-slate-900 dark:text-slate-100">membre du bureau</strong> utilisent la{' '}
                <em>même</em> création de compte (fiche membre + utilisateur). Le bureau n’est pas un « type » de compte :
                c’est une <strong className="text-slate-900 dark:text-slate-100">affectation</strong> à un poste marqué
                « Bureau » sur le <strong className="text-slate-900 dark:text-slate-100">mandat actif</strong>.
              </p>
              <p>
                Après création : menu <strong>Affectations</strong> → <strong>Nouvelle affectation</strong>, choisir le
                mandat, un poste indiqué « (Bureau) », et le membre. Le filtre « Bureau (mandat actif) » ci-dessous liste
                uniquement les personnes qui ont déjà une telle affectation active.
              </p>
              <p>
                <Link
                  href="/admin/affectations/nouveau"
                  className="font-medium text-amber-900 underline decoration-amber-600/50 underline-offset-2 hover:decoration-amber-700 dark:text-amber-200"
                >
                  Ouvrir Nouvelle affectation
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="admin-panel p-4">
          <div className="text-sm text-gray-600 dark:text-slate-400">Total</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.total}</div>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800/50 dark:bg-orange-950/35">
          <div className="text-sm text-orange-700 dark:text-orange-300">Radiés</div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.radies}</div>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/35">
          <div className="text-sm text-green-700 dark:text-emerald-300">Actifs</div>
          <div className="text-2xl font-bold text-green-900 dark:text-emerald-100">{stats.actifs}</div>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-950/35">
          <div className="text-sm text-red-700 dark:text-red-300">Suspendus</div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.suspendus}</div>
        </div>
      </div>

      {/* Filtres de recherche */}
      <div className="admin-panel p-4 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative flex items-center gap-2">
              <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400 dark:text-slate-500" />
              <Input
                placeholder="Rechercher par nom, email, téléphone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-10 border-slate-600 bg-slate-800/50 text-slate-100"
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
            <SelectTrigger className="w-[180px] border-slate-600 bg-slate-800/50 text-slate-100">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="z-[100]" position="popper">
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="EN_ATTENTE">En attente</SelectItem>
              <SelectItem value="ACTIF">Actif</SelectItem>
              <SelectItem value="INACTIF">Inactif</SelectItem>
              <SelectItem value="SUSPENDU">Suspendu</SelectItem>
              <SelectItem value="RADIE">Radié</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={typeFilter || 'all'}
            onValueChange={(value) => {
              setTypeFilter(value);
              handleFilterChange('type', value);
            }}
          >
            <SelectTrigger className="w-[180px] border-slate-600 bg-slate-800/50 text-slate-100">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="z-[100]" position="popper">
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="ETUDIANT">Étudiant</SelectItem>
              <SelectItem value="PROFESSIONNEL">Professionnel</SelectItem>
              <SelectItem value="HONORAIRE">Honoraire</SelectItem>
              <SelectItem value="PARTENAIRE">Partenaire</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={bureauFilter}
            onValueChange={(value: 'all' | 'bureau') => {
              setBureauFilter(value);
              handleFilterChange('bureau', value === 'bureau' ? '1' : 'all');
            }}
          >
            <SelectTrigger className="w-[200px] border-slate-600 bg-slate-800/50 text-slate-100">
              <SelectValue placeholder="Portée liste" />
            </SelectTrigger>
            <SelectContent className="z-[100]" position="popper">
              <SelectItem value="all">Tous les membres</SelectItem>
              <SelectItem value="bureau">Bureau (mandat actif)</SelectItem>
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
        <div className="admin-panel p-12 text-center">
          <p className="text-gray-600 dark:text-slate-400">Chargement...</p>
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
            <div className="admin-panel flex items-center justify-between border-t border-gray-200 px-6 py-4 shadow dark:border-slate-700">
              <div className="text-sm text-gray-700 dark:text-slate-300">
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

