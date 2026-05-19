'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, Search as SearchIcon, X, Filter, Users, Globe, Eye, MapPin, User } from 'lucide-react';
import { DataTable } from '@/components/super-admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const LIMIT_OPTIONS = [
  { value: '20', label: '20 / page' },
  { value: '50', label: '50 / page' },
  { value: '100', label: '100 / page' },
];

const VISITOR_TYPE_OPTIONS = [
  { value: 'all', label: 'Tous (Membres & Visiteurs)' },
  { value: 'members', label: 'Membres uniquement' },
  { value: 'visitors', label: 'Visiteurs anonymes' },
];

interface PageView {
  id: string;
  path: string;
  method: string;
  ipAddress: string | null;
  userAgent: string | null;
  country: string | null;
  countryCode: string | null;
  city: string | null;
  createdAt: string;
  user: {
    email: string;
    member: { prenom: string; nom: string } | null;
  } | null;
}

interface Summary {
  total: number;
  uniqueIPs: number;
  totalVisitors: number;
  totalMembers: number;
  topPages: { path: string; count: number }[];
  topCountries: { country: string; countryCode: string; count: number }[];
}

interface PaginatedResponse {
  data: PageView[];
  summary: Summary;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function SuperAdminPageViewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [visitorTypeFilter, setVisitorTypeFilter] = useState('all');
  const [limitFilter, setLimitFilter] = useState('50');

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const syncFromUrl = useCallback(() => {
    setSearch(searchParams.get('search') || '');
    setVisitorTypeFilter(searchParams.get('visitorType') || 'all');
    setLimitFilter(searchParams.get('limit') || '50');
  }, [searchParams]);

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  useEffect(() => {
    fetchViews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchParams]);

  const fetchViews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const searchValue = searchParams.get('search') || '';
      const visitorTypeValue = searchParams.get('visitorType') || '';
      const pathValue = searchParams.get('path') || '';

      if (searchValue) params.set('search', searchValue);
      if (visitorTypeValue && visitorTypeValue !== 'all') params.set('visitorType', visitorTypeValue);
      if (pathValue) params.set('path', pathValue);

      const response = await fetch(`/api/super-admin/page-views?${params.toString()}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const result: PaginatedResponse = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pushParams = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    pushParams((params) => {
      params.set('page', '1');
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
  };

  const handleSearchImmediate = () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    handleFilterChange('search', search);
  };

  const onSearchInputChange = (value: string) => {
    setSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      pushParams((params) => {
        params.set('page', '1');
        if (value.trim()) params.set('search', value.trim());
        else params.delete('search');
      });
    }, 450);
  };

  const handleResetFilters = () => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    setSearch('');
    setVisitorTypeFilter('all');
    setLimitFilter('50');
    router.push('/admin/logs/visits?page=1&limit=50');
  };

  const handlePageChange = (newPage: number) => {
    pushParams((params) => {
      params.set('page', String(newPage));
    });
  };

  const getBrowser = (ua: string | null) => {
    if (!ua) return 'Inconnu';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('SamsungBrowser')) return 'Samsung';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    if (ua.includes('Edge') || ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Autre';
  };

  const getOS = (ua: string | null) => {
    if (!ua) return 'Inconnu';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Autre';
  };

  const hasActiveFilters =
    !!(searchParams.get('search')?.trim()) ||
    !!(searchParams.get('visitorType') && searchParams.get('visitorType') !== 'all') ||
    !!(searchParams.get('path')?.trim());

  const pagination = data?.pagination;

  const columns = [
    {
      key: 'createdAt',
      label: 'Date & heure',
      className: 'whitespace-nowrap',
      render: (view: PageView) => (
        <div className="text-slate-900 dark:text-slate-100 text-sm">
          {format(new Date(view.createdAt), 'dd/MM/yy HH:mm:ss', { locale: fr })}
        </div>
      ),
    },
    {
      key: 'path',
      label: 'Page visitée',
      render: (view: PageView) => (
        <div className="font-mono text-sm text-blue-600 dark:text-blue-400 break-all max-w-[200px]">
          {view.path}
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Visiteur',
      render: (view: PageView) => (
        <div className="text-sm">
          {view.user ? (
            <div className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {view.user.member ? `${view.user.member.prenom} ${view.user.member.nom}` : view.user.email}
            </div>
          ) : (
            <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Anonyme
            </div>
          )}
          <div className="font-mono text-xs text-slate-400 mt-0.5">{view.ipAddress || 'IP masquée'}</div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Lieu',
      render: (view: PageView) => (
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          {view.countryCode && (
            <img 
              src={`https://flagcdn.com/20x15/${view.countryCode.toLowerCase()}.png`} 
              alt={view.country || ''} 
              className="border border-slate-200 dark:border-slate-700" 
            />
          )}
          <span>{view.city ? `${view.city}, ${view.country}` : (view.country || 'Inconnu')}</span>
        </div>
      ),
    },
    {
      key: 'system',
      label: 'Système',
      render: (view: PageView) => (
        <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-0.5">
          <span>{getOS(view.userAgent)}</span>
          <span>{getBrowser(view.userAgent)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page mx-auto max-w-7xl space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
      <div className="admin-glass flex flex-col gap-4 rounded-3xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-200/80 dark:bg-slate-800/80">
            <Activity className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
              Visites et Trafic
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Suivi détaillé de l&apos;activité des utilisateurs et visiteurs publics
            </p>
          </div>
        </div>
      </div>

      {data?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="admin-panel p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-2">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{data.summary.total}</p>
            <p className="text-xs text-slate-500">Pages vues</p>
          </div>
          <div className="admin-panel p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full mb-2">
              <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-bold">{data.summary.uniqueIPs}</p>
            <p className="text-xs text-slate-500">Visiteurs uniques (IP)</p>
          </div>
          <div className="admin-panel p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full mb-2">
              <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold">{data.summary.totalMembers}</p>
            <p className="text-xs text-slate-500">Vues membres</p>
          </div>
          <div className="admin-panel p-4 flex flex-col justify-center items-center text-center">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/40 rounded-full mb-2">
              <Globe className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-2xl font-bold">{data.summary.totalVisitors}</p>
            <p className="text-xs text-slate-500">Vues anonymes</p>
          </div>
        </div>
      )}

      <div className="admin-panel space-y-6 p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          Filtres et recherche
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Label htmlFor="log-search" className="mb-2 block text-slate-700 dark:text-slate-300">
              Recherche IP ou Agent
            </Label>
            <div className="relative flex items-center gap-2">
              <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                id="log-search"
                placeholder="Nom, email, IP, navigateur..."
                value={search}
                onChange={(e) => onSearchInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchImmediate();
                }}
                className="pl-10 h-10 border-slate-200/60 focus:border-blue-400 rounded-xl"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-2">
            <div>
              <Label className="mb-2 block text-slate-700 dark:text-slate-300">Type de visiteur</Label>
              <Select
                value={visitorTypeFilter || 'all'}
                onValueChange={(value) => {
                  setVisitorTypeFilter(value);
                  handleFilterChange('visitorType', value);
                }}
              >
                <SelectTrigger className="w-full h-10 rounded-xl border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="z-50 rounded-xl border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                  {VISITOR_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-slate-700 dark:text-slate-300">Lignes par page</Label>
              <Select
                value={limitFilter || '50'}
                onValueChange={(value) => {
                  setLimitFilter(value);
                  pushParams((params) => {
                    params.set('page', '1');
                    params.set('limit', value);
                  });
                }}
              >
                <SelectTrigger className="w-full h-10 rounded-xl border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 rounded-xl border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                  {LIMIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {hasActiveFilters ? (
          <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              size="sm"
              className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              <X className="mr-2 h-4 w-4" />
              Réinitialiser tout
            </Button>
          </div>
        ) : null}
      </div>

      <DataTable
        data={data?.data || []}
        columns={columns}
        onRowClick={(view: PageView) => router.push(`/admin/logs/visits/${view.id}`)}
        pagination={
          pagination
            ? {
                ...pagination,
                onPageChange: handlePageChange,
              }
            : undefined
        }
        loading={loading}
        emptyMessage="Aucune visite trouvée pour ces critères."
      />
    </div>
  );
}
