'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Loader2,
  Users,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  CalendarRange,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import {
  TableRowActionsMenu,
  type TableRowAction,
} from '@/components/ui/table-row-actions-menu';

const actionsTriggerClass =
  'border-slate-600 bg-slate-950/50 text-slate-100 hover:bg-slate-800 dark:border-slate-600';
export type RegistreRow = {
  rowNum: number;
  memberId: string;
  prenom: string;
  nom: string;
  telephone: string;
  situationText: string;
  absencesText: string;
  registreId: string | null;
  registreUpdatedAt: string | null;
};

export type RegistreHubStats = {
  totalMembres: number;
  lignesPourDate: number;
  sansLignePourDate: number;
  situationRenseignee: number;
  situationVideOuSansLigne: number;
  absencesRenseignees: number;
  snapshotsEnBase: number;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

const REGISTRE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tous les membres' },
  { value: 'sans_ligne', label: 'Sans ligne pour cette date' },
  { value: 'situation_vide', label: 'Situation vide ou sans ligne' },
  { value: 'situation_remplie', label: 'Situation renseignée' },
  { value: 'absences_remplies', label: 'Absences renseignées' },
];

function escapeCsvCell(value: string): string {
  const v = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (/[";[\]\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function formatLongDateFr(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dt);
}

function rowEtat(r: RegistreRow): { label: string; className: string } {
  const sit = r.situationText?.trim() ?? '';
  const abs = r.absencesText?.trim() ?? '';
  if (!r.registreId) {
    return { label: 'Pas de ligne', className: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30' };
  }
  if (!sit) {
    return { label: 'Situation à saisir', className: 'bg-orange-500/15 text-orange-200 ring-1 ring-orange-500/35' };
  }
  if (!abs) {
    return { label: 'Cotis. OK · abs. vide', className: 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/25' };
  }
  return { label: 'Complet', className: 'bg-sky-500/10 text-sky-200 ring-1 ring-sky-500/25' };
}

export default function RegistreCotisationsClient({
  backHref,
  title,
  initialDateReference,
}: {
  backHref: string;
  title: string;
  /** Alignée sur la logique API : dernière date en base ou aujourd’hui */
  initialDateReference: string;
}) {
  const router = useRouter();
  const [dateReference, setDateReference] = useState(initialDateReference);
  const [q, setQ] = useState('');
  const [qDebounced, setQDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [registreFilter, setRegistreFilter] = useState('all');
  const [rows, setRows] = useState<RegistreRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<RegistreHubStats | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [resolvedDateRef, setResolvedDateRef] = useState<string>(initialDateReference);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<RegistreRow | null>(null);
  const [editSituation, setEditSituation] = useState('');
  const [editAbsences, setEditAbsences] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(1);
  }, [qDebounced, dateReference, registreFilter, limit]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        dateReference,
        registreFilter,
      });
      if (qDebounced) params.set('q', qDebounced);
      const res = await fetch(`/api/bureau/registre-cotisations?${params}`, {
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((json as { error?: string }).error || `Erreur ${res.status}`);
      }
      setRows((json.data as RegistreRow[]) ?? []);
      setPagination(json.pagination as PaginationMeta);
      if (Array.isArray(json.availableDates)) {
        setAvailableDates(json.availableDates as string[]);
      }
      if (json.stats) {
        setStats(json.stats as RegistreHubStats);
      }
      if (typeof json.dateReference === 'string') {
        setResolvedDateRef(json.dateReference);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible');
      setRows([]);
      setPagination(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, dateReference, qDebounced, registreFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const openEdit = (row: RegistreRow) => {
    setEditRow(row);
    setEditSituation(row.situationText);
    setEditAbsences(row.absencesText);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bureau/registre-cotisations/${editRow.memberId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateReference,
          situationText: editSituation,
          absencesText: editAbsences === '' ? null : editAbsences,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((json as { error?: string }).error || `Erreur ${res.status}`);
      }
      setEditOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = async () => {
    const allRows: RegistreRow[] = [];
    let p = 1;
    const exportLimit = 500;
    try {
      let totalPages = 1;
      do {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(exportLimit),
          dateReference,
          registreFilter,
        });
        if (qDebounced) params.set('q', qDebounced);
        const res = await fetch(`/api/bureau/registre-cotisations?${params}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error((json as { error?: string }).error || `Erreur ${res.status}`);
        }
        const data = (json.data as RegistreRow[]) ?? [];
        const pag = json.pagination as PaginationMeta;
        totalPages = pag.totalPages;
        allRows.push(...data);
        p += 1;
      } while (p <= totalPages && totalPages <= 40);

      const header = ['situation_au', 'num', 'nom', 'prenom', 'contact', 'situation', 'absences', 'etat'];
      const lines = [
        header.join(';'),
        ...allRows.map((r) => {
          const et = rowEtat(r);
          return [
            dateReference,
            String(r.rowNum),
            escapeCsvCell(r.nom),
            escapeCsvCell(r.prenom),
            escapeCsvCell(r.telephone),
            escapeCsvCell(r.situationText),
            escapeCsvCell(r.absencesText),
            escapeCsvCell(et.label),
          ].join(';');
        }),
      ];
      const blob = new Blob([`\ufeff${lines.join('\n')}`], {
        type: 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registre-agcm-${dateReference}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export impossible');
    }
  };

  const dateOptions = useMemo(() => {
    const set = new Set(availableDates);
    set.add(dateReference);
    return Array.from(set).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  }, [availableDates, dateReference]);

  const progressionSituation =
    stats && stats.totalMembres > 0
      ? Math.round((stats.situationRenseignee / stats.totalMembres) * 100)
      : 0;

  const hubQuickActions: TableRowAction[] = [
    {
      label: 'Ma situation (adhérent)',
      variant: 'view',
      icon: <ExternalLink className="h-4 w-4 shrink-0" />,
      onClick: () => router.push('/dashboard/paiements'),
    },
    {
      label: 'Exporter CSV',
      variant: 'outline',
      icon: <Download className="h-4 w-4 shrink-0" />,
      onClick: () => void exportCsv(),
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 text-slate-100 pb-10">
      {/* Bandeau hub */}
      <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-950/40 p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Link
              href={backHref}
              className="mb-3 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour bureau
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">{title}</h1>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400 md:text-base">
              <strong className="font-medium text-slate-200">Point central</strong> pour le suivi des cotisations et des
              absences aux réunions — équivalent du tableau Excel/PDF de l’association. Une{' '}
              <strong className="font-medium text-slate-200">date de situation</strong> correspond à une clôture (ex. «
              situation au 17 avril 2026 »).
            </p>
          </div>
          <div className="flex flex-shrink-0 justify-end">
            <TableRowActionsMenu
              actions={hubQuickActions}
              triggerLabel="Actions registre"
              align="right"
              triggerClassName={actionsTriggerClass}
              menuClassName="dark:border-slate-700 dark:bg-slate-900"
              menuItemClassName="dark:focus:bg-slate-800"
            />
          </div>
        </div>
        {resolvedDateRef ? (
          <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <CalendarRange className="h-4 w-4 text-blue-400" />
            <span>
              Vue centrée sur le{' '}
              <strong className="text-slate-200">{formatLongDateFr(resolvedDateRef)}</strong>
            </span>
          </p>
        ) : null}
      </div>

      {/* KPI */}
      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <Users className="h-4 w-4 text-slate-400" />
              Membres (base)
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{stats.totalMembres}</p>
            <p className="mt-1 text-xs text-slate-500">Annuaire complet — tous mandats confondus</p>
          </div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <ClipboardList className="h-4 w-4 text-slate-400" />
              Lignes pour cette date
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-100">
              {stats.lignesPourDate}
              <span className="text-base font-normal text-slate-500"> / {stats.totalMembres}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {stats.sansLignePourDate} sans ligne · progression situation ~{progressionSituation}%
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-400/90">
              <CheckCircle2 className="h-4 w-4" />
              Situation renseignée
            </div>
            <p className="mt-2 text-2xl font-semibold text-emerald-100">{stats.situationRenseignee}</p>
            <p className="mt-1 text-xs text-emerald-500/70">
              À compléter : {stats.situationVideOuSansLigne} membre(s)
            </p>
          </div>
          <div className="rounded-xl border border-sky-500/20 bg-sky-950/20 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-sky-400/90">
              <AlertCircle className="h-4 w-4" />
              Absences notées
            </div>
            <p className="mt-2 text-2xl font-semibold text-sky-100">{stats.absencesRenseignees}</p>
            <p className="mt-1 text-xs text-sky-500/70">
              {stats.snapshotsEnBase} cliché(s) listé(s) (aperçu récent)
            </p>
          </div>
        </div>
      ) : null}

      {/* Contrôles */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 md:flex-row md:flex-wrap md:items-end">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Date de situation
          </label>
          <Input
            type="date"
            list="registre-dates-hub"
            value={dateReference}
            onChange={(e) => setDateReference(e.target.value)}
            className="w-44 border-slate-600 bg-slate-950 text-slate-100"
          />
          <datalist id="registre-dates-hub">
            {dateOptions.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Filtre métier
          </label>
          <Select value={registreFilter} onValueChange={setRegistreFilter}>
            <SelectTrigger className="border-slate-600 bg-slate-950 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGISTRE_FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[180px]">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Lignes par page
          </label>
          <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="border-slate-600 bg-slate-950 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[200px] flex-1 md:max-w-md">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Recherche (nom, téléphone, e-mail)
          </label>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrer l’annuaire…"
            className="border-slate-600 bg-slate-950 text-slate-100"
          />
        </div>
        <p className="text-sm text-slate-500 md:ml-auto">
          Résultats :{' '}
          <span className="font-medium text-slate-300">
            {pagination?.total ?? '—'} membre{(pagination?.total ?? 0) !== 1 ? 's' : ''}
          </span>
          {pagination && pagination.totalPages > 1 ? (
            <span className="text-slate-600">
              {' '}
              · page {pagination.page}/{pagination.totalPages}
            </span>
          ) : null}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-slate-700 bg-slate-950/95 text-xs uppercase tracking-wide text-slate-500 backdrop-blur-sm">
                <th className="px-3 py-3 font-medium">#</th>
                <th className="px-3 py-3 font-medium">État</th>
                <th className="px-3 py-3 font-medium">Nom</th>
                <th className="px-3 py-3 font-medium">Prénom</th>
                <th className="px-3 py-3 font-medium">Contact</th>
                <th className="px-3 py-3 font-medium">Situation cotisation</th>
                <th className="px-3 py-3 font-medium">Absences</th>
                <th className="w-24 px-3 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin opacity-60" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    Aucun membre pour ces critères. Changez le filtre métier ou la recherche.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const et = rowEtat(r);
                  return (
                    <tr key={r.memberId} className="border-b border-slate-800/80 hover:bg-slate-800/30">
                      <td className="whitespace-nowrap px-3 py-2 text-slate-500">{r.rowNum}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${et.className}`}
                        >
                          {et.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-200">{r.nom}</td>
                      <td className="px-3 py-2 text-slate-300">{r.prenom}</td>
                      <td className="max-w-[140px] px-3 py-2 text-slate-400 whitespace-pre-wrap break-all">
                        {r.telephone || '—'}
                      </td>
                      <td className="max-w-[260px] px-3 py-2 text-slate-400 whitespace-pre-wrap break-words">
                        {r.situationText || '—'}
                      </td>
                      <td className="max-w-[200px] px-3 py-2 text-slate-400 whitespace-pre-wrap break-words">
                        {r.absencesText || '—'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end">
                          <TableRowActionsMenu
                            alwaysDropdown
                            actions={[
                              {
                                label: 'Modifier',
                                variant: 'edit',
                                icon: <Pencil className="h-4 w-4 shrink-0" />,
                                onClick: () => openEdit(r),
                              },
                            ]}
                            triggerLabel={`Actions — ${r.prenom} ${r.nom}`}
                            align="right"
                            triggerClassName={actionsTriggerClass}
                            menuClassName="dark:border-slate-700 dark:bg-slate-900"
                            menuItemClassName="dark:focus:bg-slate-800"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between gap-4 border-t border-slate-700/50 px-4 py-3">
            <p className="text-xs text-slate-500">
              Page {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!pagination.hasPrev || loading}
                className="border-slate-600 bg-transparent text-slate-200"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!pagination.hasNext || loading}
                className="border-slate-600 bg-transparent text-slate-200"
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {editOpen && editRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-100">
              {editRow.prenom} {editRow.nom}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Situation au {resolvedDateRef} — les modifications mettent à jour le registre central pour tous les comptes
              autorisés.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-400">Situation cotisation</label>
                <textarea
                  value={editSituation}
                  onChange={(e) => setEditSituation(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
                  placeholder="Ex : ok, 10€ (janv mars 26), cotis spéciale…"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-400">Absences</label>
                <textarea
                  value={editAbsences}
                  onChange={(e) => setEditAbsences(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
                  placeholder="Ex : 3 mois, absence plus d'un an…"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-400"
                disabled={saving}
                onClick={() => setEditOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                className="bg-blue-600 text-white hover:bg-blue-500"
                disabled={saving}
                onClick={() => void saveEdit()}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
