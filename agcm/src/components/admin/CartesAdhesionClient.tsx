'use client';

import { useCallback, useEffect, useState } from 'react';
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
import {
  CreditCard,
  Download,
  LayoutGrid,
  Loader2,
  Palette,
  Printer,
  RefreshCw,
  RectangleHorizontal,
  RectangleVertical,
  Sparkles,
  Users,
} from 'lucide-react';
import MembreCarteAdhesion from '@/components/admin/MembreCarteAdhesion';
import type {
  CarteAdhesionMemberDto,
  CartesAdhesionApiResponse,
} from '@/lib/cartes-adhesion-types';
import type { CarteAdhesionOrientation } from '@/lib/cartes-adhesion-orientation';
import { CARTES_ADHESION_MOTIFS, type CarteAdhesionMotifId } from '@/lib/cartes-adhesion-motifs';
import {
  DEFAULT_REFERENCE_VARIANTS,
  REFERENCE_ACCENT_IDS,
  REFERENCE_ACCENT_LABEL,
  REFERENCE_HEADER_LABEL,
  REFERENCE_HEADER_SHAPE_IDS,
  REFERENCE_PHOTO_FRAME_IDS,
  REFERENCE_PHOTO_LABEL,
  REFERENCE_WATERMARK_IDS,
  REFERENCE_WATERMARK_LABEL,
  type CarteReferenceVariants,
} from '@/lib/cartes-adhesion-reference-variants';
import { CARTES_ADHESION_THEMES, type CarteAdhesionThemeId } from '@/lib/cartes-adhesion-themes';
import { cn } from '@/lib/utils';

function csvEscape(cell: string) {
  if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

const FETCH_PAGE_SIZE = 100;
const MAX_SERIE_MEMBERS = 500;

async function fetchAllMembersMatching(filters: {
  statut: string;
  bureauOnly: boolean;
  q: string;
}): Promise<{ members: CarteAdhesionMemberDto[]; mandatTitre: string | null; error?: string }> {
  const all: CarteAdhesionMemberDto[] = [];
  let mandatTitre: string | null = null;
  let page = 1;
  let totalPages = 1;

  do {
    const params = new URLSearchParams();
    if (filters.statut !== 'all') params.set('status', filters.statut);
    if (filters.bureauOnly) params.set('bureau', '1');
    if (filters.q) params.set('q', filters.q);
    params.set('page', String(page));
    params.set('limit', String(FETCH_PAGE_SIZE));

    const res = await fetch(`/api/admin/membres/cartes-adhesion?${params}`);
    if (!res.ok) {
      return { members: [], mandatTitre: null, error: 'Chargement incomplet' };
    }
    const json = (await res.json()) as CartesAdhesionApiResponse;
    mandatTitre = json.mandatTitre;
    all.push(...json.members);
    totalPages = json.pagination.totalPages;
    page += 1;
    if (all.length >= MAX_SERIE_MEMBERS) break;
  } while (page <= totalPages);

  return { members: all.slice(0, MAX_SERIE_MEMBERS), mandatTitre };
}

export default function CartesAdhesionClient() {
  const [data, setData] = useState<CartesAdhesionApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [statut, setStatut] = useState('ACTIF');
  const [bureauOnly, setBureauOnly] = useState(false);
  const [q, setQ] = useState('');
  const [qDebounced, setQDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(60);
  const [themeId, setThemeId] = useState<CarteAdhesionThemeId>('officielle_orange');
  const [motifId, setMotifId] = useState<CarteAdhesionMotifId>('uni');
  const [orientation, setOrientation] = useState<CarteAdhesionOrientation>('horizontal');

  const [studioTab, setStudioTab] = useState<'membres' | 'apparence'>('membres');

  const [referenceVariants, setReferenceVariants] = useState<CarteReferenceVariants>(() => ({
    ...DEFAULT_REFERENCE_VARIANTS,
  }));

  const [previewMemberId, setPreviewMemberId] = useState<string | null>(null);

  const [sheetMembers, setSheetMembers] = useState<CarteAdhesionMemberDto[]>([]);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetErr, setSheetErr] = useState<string | null>(null);
  const [sheetMandatTitre, setSheetMandatTitre] = useState<string | null>(null);

  /** idle | après clic imprimer */
  const [printPhase, setPrintPhase] = useState<'idle' | 'exemplaire' | 'serie'>('idle');

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 380);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      if (statut !== 'all') params.set('status', statut);
      if (bureauOnly) params.set('bureau', '1');
      if (qDebounced) params.set('q', qDebounced);
      params.set('page', String(page));
      params.set('limit', String(limit));
      const res = await fetch(`/api/admin/membres/cartes-adhesion?${params}`);
      if (!res.ok) throw new Error('Erreur chargement');
      setData((await res.json()) as CartesAdhesionApiResponse);
    } catch {
      setErr('Impossible de charger les cartes.');
    } finally {
      setLoading(false);
    }
  }, [statut, bureauOnly, qDebounced, page, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statut, bureauOnly, qDebounced, limit]);

  useEffect(() => {
    if (!data?.members.length) {
      setPreviewMemberId(null);
      return;
    }
    const exists = previewMemberId && data.members.some((m) => m.id === previewMemberId);
    if (!exists) {
      setPreviewMemberId(data.members[0].id);
    }
  }, [data, previewMemberId]);

  useEffect(() => {
    if (printPhase === 'idle') return;

    const timer = window.setTimeout(() => {
      window.print();
    }, 10);

    const onAfterPrint = () => {
      setPrintPhase('idle');
    };
    window.addEventListener('afterprint', onAfterPrint);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, [printPhase]);

  const previewMember =
    data?.members.find((m) => m.id === previewMemberId) ?? data?.members[0] ?? null;

  const prepareSerie = async () => {
    setSheetLoading(true);
    setSheetErr(null);
    try {
      const { members, mandatTitre, error } = await fetchAllMembersMatching({
        statut,
        bureauOnly,
        q: qDebounced,
      });
      if (error) setSheetErr(error);
      setSheetMembers(members);
      setSheetMandatTitre(mandatTitre);
      if (members.length === 0) {
        setSheetErr('Aucun membre pour ces filtres.');
      }
    } catch {
      setSheetErr('Échec de la préparation de la série.');
      setSheetMembers([]);
    } finally {
      setSheetLoading(false);
    }
  };

  const exportCsv = () => {
    const rows = sheetMembers.length ? sheetMembers : data?.members ?? [];
    if (!rows.length) return;
    const header = [
      'nom',
      'prenom',
      'email',
      'telephone',
      'ville',
      'pays',
      'statut',
      'date_adhesion',
      'postes_bureau',
      'sans_compte_site',
    ];
    const lines = rows.map((m) =>
      [
        m.nom,
        m.prenom,
        m.email,
        m.telephone ?? '',
        m.ville ?? '',
        m.pays ?? '',
        m.statutMembre,
        m.dateAdhesion,
        m.postesBureau ?? '',
        m.isAdherentSansCompte ? 'oui' : 'non',
      ]
        .map((c) => csvEscape(String(c)))
        .join(','),
    );
    const blob = new Blob([`\ufeff${header.join(',')}\n${lines.join('\n')}`], {
      type: 'text/csv;charset=utf-8',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const suffix = sheetMembers.length ? 'serie' : `page-${page}`;
    a.download = `agcm-cartes-adherents-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const pg = data?.pagination;
  const serieReady = sheetMembers.length > 0;

  const gridColsSerie =
    orientation === 'horizontal'
      ? 'print:grid-cols-2 xl:grid-cols-2 lg:grid-cols-1 md:grid-cols-1'
      : 'print:grid-cols-3 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2';

  return (
    <div id="cartes-adhesion-root" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="cartes-adhesion-studio print:hidden">
        <nav className="mb-4 text-sm text-slate-500">
          <Link href="/admin" className="hover:text-blue-400">
            Administration
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-slate-300">Cartes d&apos;adhérent</span>
        </nav>

        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/35 via-slate-900/60 to-slate-950/80 p-8 shadow-xl backdrop-blur-md">
          <div className="pointer-events-none absolute -right-16 -top-16 opacity-[0.06]">
            <CreditCard className="h-56 w-56 text-emerald-400" aria-hidden />
          </div>
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Studio carte
              </div>
              <h1 className="bg-gradient-to-r from-slate-50 via-emerald-100/90 to-slate-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
                Cartes d&apos;adhérent
              </h1>
              <p className="text-sm leading-relaxed text-slate-300 md:text-base">
                En <strong className="text-slate-100">portrait</strong>, le rendu suit la{' '}
                <strong className="text-slate-100">carte plastique AGCM</strong> (recto + verso) : triangle de couleur,
                photo, logo, code membre, QR et texte au dos. En paysage, format institutionnel une face. Les onglets
                ci-dessous combinent couleurs, motifs et formes pour multiplier les styles.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col">
              <Button
                variant="outline"
                className="border-slate-600 bg-slate-900/50 text-slate-100 hover:bg-slate-800"
                onClick={() => void load()}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser liste
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 bg-slate-900/50 text-slate-100 hover:bg-slate-800"
                onClick={() => setPrintPhase('exemplaire')}
                disabled={!previewMember}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimer exemplaire
              </Button>
              <Button
                variant="secondary"
                className="border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                onClick={exportCsv}
                disabled={!serieReady && !(data?.members.length)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200 print:hidden">
          {err}
        </div>
      )}

      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/30 p-4 backdrop-blur-sm print:border-slate-300 print:bg-white">
        {/* Contrôles studio */}
        <div className="cartes-adhesion-studio mb-6 space-y-6 print:hidden">
          <div
            className="flex flex-wrap gap-2 rounded-2xl border border-slate-700/80 bg-slate-950/40 p-1.5"
            role="tablist"
            aria-label="Sections du studio cartes"
          >
            <button
              type="button"
              role="tab"
              aria-selected={studioTab === 'membres'}
              onClick={() => setStudioTab('membres')}
              className={cn(
                'inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all sm:flex-none sm:justify-start sm:px-5',
                studioTab === 'membres'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200',
              )}
            >
              <Users className="h-4 w-4 shrink-0" aria-hidden />
              Membres &amp; série
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={studioTab === 'apparence'}
              onClick={() => setStudioTab('apparence')}
              className={cn(
                'inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all sm:flex-none sm:justify-start sm:px-5',
                studioTab === 'apparence'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200',
              )}
            >
              <Palette className="h-4 w-4 shrink-0" aria-hidden />
              Motifs &amp; style
            </button>
          </div>

          {studioTab === 'apparence' ? (
            <div className="space-y-8 border-t border-slate-800 pt-6">
              <div className="space-y-3">
                <span className="text-xs font-medium text-slate-500">Orientation</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setOrientation('horizontal')}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                      orientation === 'horizontal'
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                        : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:bg-slate-800',
                    )}
                  >
                    <RectangleHorizontal className="h-5 w-5" aria-hidden />
                    Paysage
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('vertical')}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                      orientation === 'vertical'
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                        : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:bg-slate-800',
                    )}
                  >
                    <RectangleVertical className="h-5 w-5" aria-hidden />
                    Portrait
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Portrait : modèle carte plastique officielle (recto + verso), comme la carte physique AGCM — triangle
                  vert, photo ronde, logo, QR et mentions au dos. Combinez les options ci-dessous avec la couleur du thème
                  et le motif du fond pour multiplier les styles.
                </p>
              </div>

              {orientation === 'vertical' ? (
                <div className="rounded-2xl border border-sky-500/25 bg-sky-950/25 p-4">
                  <p className="text-xs font-semibold text-sky-200">Formes du modèle carte plastique</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Chaque option est indépendante : vous obtenez des milliers de combinaisons avec les couleurs et les
                    motifs de fond.
                  </p>
                  <div className="mt-4 grid gap-5 lg:grid-cols-2">
                    <div className="space-y-2">
                      <span className="text-[11px] font-medium text-slate-500">Bandeau supérieur</span>
                      <div className="flex flex-wrap gap-2">
                        {REFERENCE_HEADER_SHAPE_IDS.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setReferenceVariants((v) => ({ ...v, headerShape: id }))}
                            className={cn(
                              'rounded-lg border px-2.5 py-2 text-left text-[11px] transition-all',
                              referenceVariants.headerShape === id
                                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                                : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-500',
                            )}
                          >
                            {REFERENCE_HEADER_LABEL[id]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[11px] font-medium text-slate-500">Accent à droite</span>
                      <div className="flex flex-wrap gap-2">
                        {REFERENCE_ACCENT_IDS.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setReferenceVariants((v) => ({ ...v, accent: id }))}
                            className={cn(
                              'rounded-lg border px-2.5 py-2 text-left text-[11px] transition-all',
                              referenceVariants.accent === id
                                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                                : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-500',
                            )}
                          >
                            {REFERENCE_ACCENT_LABEL[id]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[11px] font-medium text-slate-500">Cadre photo (recto)</span>
                      <div className="flex flex-wrap gap-2">
                        {REFERENCE_PHOTO_FRAME_IDS.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setReferenceVariants((v) => ({ ...v, photoFrame: id }))}
                            className={cn(
                              'rounded-lg border px-2.5 py-2 text-left text-[11px] transition-all',
                              referenceVariants.photoFrame === id
                                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                                : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-500',
                            )}
                          >
                            {REFERENCE_PHOTO_LABEL[id]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[11px] font-medium text-slate-500">Filigrane (verso)</span>
                      <div className="flex flex-wrap gap-2">
                        {REFERENCE_WATERMARK_IDS.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setReferenceVariants((v) => ({ ...v, versoWatermark: id }))}
                            className={cn(
                              'rounded-lg border px-2.5 py-2 text-left text-[11px] transition-all',
                              referenceVariants.versoWatermark === id
                                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                                : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-500',
                            )}
                          >
                            {REFERENCE_WATERMARK_LABEL[id]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                <span className="text-xs font-medium text-slate-500">Style couleur (bandeaux)</span>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {CARTES_ADHESION_THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setThemeId(th.id)}
                      className={cn(
                        'overflow-hidden rounded-xl border text-left transition-all',
                        themeId === th.id
                          ? 'border-emerald-400 ring-2 ring-emerald-500/40'
                          : 'border-slate-700 hover:border-slate-500',
                      )}
                    >
                      <div className={cn('h-10 w-full', th.bannerStrip)} />
                      <div className="bg-slate-950/80 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-100">{th.label}</p>
                        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{th.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-medium text-slate-500">Motif du fond (zone centrale)</span>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {CARTES_ADHESION_MOTIFS.map((mf) => (
                    <button
                      key={mf.id}
                      type="button"
                      onClick={() => setMotifId(mf.id)}
                      className={cn(
                        'rounded-xl border text-left transition-all',
                        motifId === mf.id
                          ? 'border-emerald-400 ring-2 ring-emerald-500/40'
                          : 'border-slate-700 hover:border-slate-500',
                      )}
                    >
                      <div className={cn('h-16 rounded-t-xl border-b border-slate-700/80', mf.bodyClass)} />
                      <div className="bg-slate-950/80 px-3 py-2">
                        <p className="text-xs font-semibold text-slate-100">{mf.label}</p>
                        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{mf.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 border-t border-slate-800 pt-5 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2 xl:col-span-2">
                  <span className="text-xs font-medium text-slate-500">Membre pour l&apos;exemplaire</span>
                  <Select
                    value={previewMemberId ?? ''}
                    onValueChange={setPreviewMemberId}
                    disabled={!data?.members.length}
                  >
                    <SelectTrigger className="border-slate-700 bg-slate-900/80">
                      <SelectValue placeholder="Choisir sur la page courante…" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[280px]">
                      {data?.members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.prenom} {m.nom}
                          {m.postesBureau
                            ? ` · ${m.postesBureau.length > 44 ? `${m.postesBureau.slice(0, 44)}…` : m.postesBureau}`
                            : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-slate-500">
                    Liste = page courante ({data?.members.length ?? 0} lignes). Les filtres ci-dessous servent
                    aussi à la série complète. Réglages visuels : onglet{' '}
                    <button
                      type="button"
                      className="text-emerald-400 underline-offset-2 hover:underline"
                      onClick={() => setStudioTab('apparence')}
                    >
                      Motifs &amp; style
                    </button>
                    .
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-500">Statut</span>
                  <Select value={statut} onValueChange={setStatut}>
                    <SelectTrigger className="border-slate-700 bg-slate-900/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="ACTIF">Actifs</SelectItem>
                      <SelectItem value="SUSPENDU">Suspendus</SelectItem>
                      <SelectItem value="RADIE">Radiés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-500">Recherche</span>
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Nom, e-mail…"
                    className="border-slate-700 bg-slate-900/80"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-4 border-t border-slate-800 pt-5">
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-500">Taille page liste</span>
                  <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                    <SelectTrigger className="w-[120px] border-slate-700 bg-slate-900/80">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                      <SelectItem value="120">120</SelectItem>
                      <SelectItem value="300">300</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={bureauOnly}
                    onChange={(e) => setBureauOnly(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-900"
                  />
                  Bureau exécutif uniquement
                </label>
                {pg && pg.totalPages > 1 ? (
                  <div className="flex items-center gap-2 pb-2 text-sm text-slate-400">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pg.page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="border-slate-600"
                    >
                      Page préc.
                    </Button>
                    <span>
                      {pg.page} / {pg.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pg.page >= pg.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="border-slate-600"
                    >
                      Page suiv.
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
                      <LayoutGrid className="h-4 w-4" aria-hidden />
                      Génération pour impression
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Charge jusqu&apos;à {MAX_SERIE_MEMBERS} membres avec les filtres actuels (statut, recherche,
                      bureau). Réutilise orientation, couleurs et motif de l&apos;onglet Motifs &amp; style.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      className="bg-emerald-600 text-white hover:bg-emerald-500"
                      onClick={() => void prepareSerie()}
                      disabled={sheetLoading}
                    >
                      {sheetLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LayoutGrid className="mr-2 h-4 w-4" />
                      )}
                      Préparer la série
                    </Button>
                    <Button
                      variant="secondary"
                      className="border border-slate-600 bg-slate-800 text-slate-100 disabled:opacity-40"
                      disabled={!serieReady}
                      onClick={() => setPrintPhase('serie')}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimer la série
                    </Button>
                  </div>
                </div>
                {sheetErr ? (
                  <p className="mt-3 text-xs text-amber-300">{sheetErr}</p>
                ) : serieReady ? (
                  <p className="mt-3 text-xs text-emerald-300/90">
                    {sheetMembers.length} carte(s) prêtes — même rendu que l&apos;exemplaire (
                    {orientation === 'horizontal' ? 'paysage une face' : 'portrait recto + verso'}
                    {', '}
                    {CARTES_ADHESION_THEMES.find((t) => t.id === themeId)?.label ?? ''}
                    {', '}
                    {CARTES_ADHESION_MOTIFS.find((m) => m.id === motifId)?.label ?? ''}
                    ).
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>

        {loading && !data ? (
          <p className="py-16 text-center text-slate-500 print:hidden">Chargement…</p>
        ) : data && data.members.length === 0 ? (
          <p className="py-16 text-center text-slate-500 print:hidden">
            Aucun membre pour ces filtres — impossible d&apos;afficher un exemplaire.
          </p>
        ) : previewMember ? (
          <>
            <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-slate-500 print:hidden">
              Exemplaire — {orientation === 'vertical' ? 'recto puis verso (comme carte physique)' : 'une face'}
            </p>
            <div
              className={cn(
                'cartes-adhesion-exemplaire flex flex-col items-center justify-center py-4',
                printPhase === 'serie' && 'print:hidden',
              )}
            >
              <MembreCarteAdhesion
                member={previewMember}
                themeId={themeId}
                motifId={motifId}
                mandatTitre={data!.mandatTitre}
                orientation={orientation}
                referenceVariants={orientation === 'vertical' ? referenceVariants : undefined}
              />
            </div>
          </>
        ) : null}

        {/* Série : visible à l'écran après préparation ; imprimable uniquement en phase série */}
        {serieReady ? (
          <>
            <div
              className={cn(
                'cartes-adhesion-serie mt-10 border-t border-slate-800 pt-8 print:mt-0 print:border-0 print:pt-0',
                printPhase === 'exemplaire' && 'print:hidden',
                printPhase !== 'serie' && 'print:hidden',
              )}
            >
              <div className="mb-4 hidden print:mb-4 print:block">
                <h1 className="text-2xl font-bold text-slate-900">AGCM — Série de cartes d&apos;adhérent</h1>
                <p className="text-sm text-slate-600">
                  {sheetMembers.length} membre(s) · {orientation === 'horizontal' ? 'Paysage (une face)' : 'Portrait recto + verso'}
                </p>
              </div>
              <div className="mb-4 print:hidden">
                <h2 className="text-lg font-semibold text-slate-200">
                  Série générée ({sheetMembers.length})
                </h2>
                {sheetMandatTitre ? (
                  <p className="text-xs text-slate-500">Mandat : {sheetMandatTitre}</p>
                ) : null}
              </div>
              <div
                className={cn(
                  'grid justify-items-center gap-10',
                  gridColsSerie,
                )}
              >
                {sheetMembers.map((m) => (
                  <MembreCarteAdhesion
                    key={m.id}
                    member={m}
                    themeId={themeId}
                    motifId={motifId}
                    mandatTitre={sheetMandatTitre ?? data?.mandatTitre ?? null}
                    orientation={orientation}
                    referenceVariants={orientation === 'vertical' ? referenceVariants : undefined}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <p className="cartes-adhesion-studio text-center text-[11px] text-slate-600 print:hidden">
        Les postes correspondent aux affectations actives sur le mandat en cours.
      </p>
    </div>
  );
}
