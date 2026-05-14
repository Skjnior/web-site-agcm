'use client';

import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SitePublicPayload } from '@/types/site-public';
import { LayoutTemplate, Loader2 } from 'lucide-react';
import {
  AboutPanel,
  AdhesionPanel,
  AxesPanel,
  ContactPanel,
  FaqPanel,
  GaleriePanel,
  GuineePanel,
  HeroPanel,
  HistoryPanel,
  JeunessePanel,
  MessagesPresidentTab,
  PartenairesListePanel,
  ProjetsLocauxPanel,
  type PanelProps,
  type VitrineSavePatch,
} from './SiteVitrinePanels';
import { cn } from '@/lib/utils';

type PayloadTab = {
  id: string;
  label: string;
  kind: 'payload';
  Panel: ComponentType<PanelProps>;
};

type PresidentTab = { id: string; label: string; kind: 'president' };

type TabEntry = PayloadTab | PresidentTab;

const TAB_ENTRIES: TabEntry[] = [
  { id: 'hero', label: 'Hero accueil', kind: 'payload', Panel: HeroPanel },
  { id: 'axes', label: 'Axes d’action', kind: 'payload', Panel: AxesPanel },
  { id: 'history', label: 'Histoire & valeurs', kind: 'payload', Panel: HistoryPanel },
  { id: 'jeunesse', label: 'Jeunesse', kind: 'payload', Panel: JeunessePanel },
  { id: 'guinee', label: 'Bloc Guinée', kind: 'payload', Panel: GuineePanel },
  { id: 'projets-locaux', label: 'Projets locaux', kind: 'payload', Panel: ProjetsLocauxPanel },
  { id: 'adhesion', label: 'Adhésion', kind: 'payload', Panel: AdhesionPanel },
  { id: 'partenaires-liste', label: 'Liste partenaires', kind: 'payload', Panel: PartenairesListePanel },
  { id: 'faq', label: 'FAQ', kind: 'payload', Panel: FaqPanel },
  { id: 'contact', label: 'Contact', kind: 'payload', Panel: ContactPanel },
  { id: 'galerie', label: 'Galerie (Moments partagés)', kind: 'payload', Panel: GaleriePanel },
  { id: 'a-propos', label: 'Page À propos', kind: 'payload', Panel: AboutPanel },
  { id: 'messages-president', label: 'Messages du Président', kind: 'president' },
];

export default function SiteVitrineAdminClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<SitePublicPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeTab = useMemo(() => {
    const q = searchParams.get('tab');
    if (q && TAB_ENTRIES.some((t) => t.id === q)) return q;
    return TAB_ENTRIES[0].id;
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/site-public-page');
        if (!res.ok) throw new Error('load');
        const data = (await res.json()) as SitePublicPayload;
        if (!cancelled) setPayload(data);
      } catch {
        if (!cancelled) window.alert('Impossible de charger le contenu du site.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const savePatch: VitrineSavePatch = useCallback(async (patch) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-public-page', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const err = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof err.error === 'string' ? err.error : 'Enregistrement impossible');
      }
      setPayload(err as SitePublicPayload);
      window.alert('Section enregistrée.');
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }, []);

  function selectTab(id: string) {
    router.replace(`/admin/site-vitrine?tab=${encodeURIComponent(id)}`, { scroll: false });
  }

  if (loading || !payload) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
      </div>
    );
  }

  const entry = TAB_ENTRIES.find((t) => t.id === activeTab) ?? TAB_ENTRIES[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-slate-100">
          <LayoutTemplate className="h-8 w-8 text-blue-400 shrink-0" aria-hidden />
          Site vitrine
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Modifiez chaque bloc du site public à part. Les changements sont enregistrés dans la base (
          <code className="text-violet-400">site_public_page</code>), sauf l&apos;onglet Messages du Président qui
          utilise une table dédiée.
        </p>
      </div>

      <div className="sticky top-0 z-10 -mx-1 bg-slate-950/90 px-1 py-2 backdrop-blur-md border-b border-slate-800/80">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {TAB_ENTRIES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTab(t.id)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-900/30 p-5 md:p-8">
        {entry.kind === 'president' ? (
          <MessagesPresidentTab />
        ) : (
          <entry.Panel payload={payload} saving={saving} savePatch={savePatch} />
        )}
      </div>
    </div>
  );
}
