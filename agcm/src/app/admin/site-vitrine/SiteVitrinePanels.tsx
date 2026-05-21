'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import type { SiteGalleryItem, SiteHighlightIcon, SitePublicPayload } from '@/types/site-public';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PresidentMessagesAdminClient from '@/app/admin/president-messages/PresidentMessagesAdminClient';

export type VitrineSavePatch = (patch: Partial<SitePublicPayload>) => Promise<void>;

export type PanelProps = {
  payload: SitePublicPayload;
  saving: boolean;
  savePatch: VitrineSavePatch;
};

function SaveRow({ saving, onSave }: { saving: boolean; onSave: () => void }) {
  return (
    <div className="flex justify-end pt-4 border-t border-slate-700/50 mt-6">
      <Button type="button" onClick={onSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Enregistrer cette section
      </Button>
    </div>
  );
}

/**
 * Champ « image » pour l'admin du site vitrine :
 *   - URL éditable (pour coller un lien externe si besoin)
 *   - bouton « Téléverser une image » qui upload via /api/admin/upload-image
 *   - aperçu de l'image
 */
function ImageUrlField({
  label = 'Image',
  value,
  onChange,
  previewClassName = 'max-h-44 w-auto rounded border border-slate-700 object-contain',
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  previewClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Le fichier sélectionné n’est pas une image.');
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Échec upload image');
      }
      const url = typeof data.imageUrl === 'string' ? data.imageUrl : '';
      if (!url) throw new Error('Réponse upload invalide');
      onChange(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur upload');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… (ou téléverser ci-contre)"
          className="border-slate-600 bg-slate-950/50"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="shrink-0 border-slate-600"
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="mr-2 h-4 w-4" />
          )}
          {busy ? 'Envoi…' : 'Téléverser une image'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
      </div>
      {value ? (
        <div className="pt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Aperçu" className={previewClassName} />
        </div>
      ) : null}
    </div>
  );
}

export function HeroPanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState(payload.hero);
  useEffect(() => setD(payload.hero), [payload.hero]);

  async function save() {
    await savePatch({ hero: d });
  }

  const setHighlight = (i: number, field: 'title' | 'text', v: string) => {
    const next = [...d.highlights];
    next[i] = { ...next[i], [field]: v };
    setD({ ...d, highlights: next });
  };

  const setHighlightIcon = (i: number, icon: SiteHighlightIcon) => {
    const next = [...d.highlights];
    next[i] = { ...next[i], icon };
    setD({ ...d, highlights: next });
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-sm text-slate-400">Bandeau principal en haut de la page d&apos;accueil.</p>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Badge</Label>
          <Input
            value={d.badge}
            onChange={(e) => setD({ ...d, badge: e.target.value })}
            className="border-slate-600 bg-slate-950/50"
          />
        </div>
        <div className="space-y-2">
          <Label>Titre</Label>
          <Input
            value={d.title}
            onChange={(e) => setD({ ...d, title: e.target.value })}
            className="border-slate-600 bg-slate-950/50"
          />
        </div>
        <div className="space-y-2">
          <Label>Paragraphe</Label>
          <Textarea
            value={d.paragraph}
            onChange={(e) => setD({ ...d, paragraph: e.target.value })}
            rows={4}
            className="border-slate-600 bg-slate-950/50"
          />
        </div>
        <div className="space-y-2">
          <Label>Image de fond (URL)</Label>
          <Input
            value={d.backgroundUrl}
            onChange={(e) => setD({ ...d, backgroundUrl: e.target.value })}
            className="border-slate-600 bg-slate-950/50"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Cartes sous le titre (highlights)</Label>
        {d.highlights.map((h, i) => (
          <div key={i} className="rounded-lg border border-slate-700/60 p-4 space-y-2 bg-slate-900/30">
            <div className="flex gap-2 flex-wrap items-end">
              <div className="space-y-1 flex-1 min-w-[140px]">
                <Label className="text-xs">Titre</Label>
                <Input
                  value={h.title}
                  onChange={(e) => setHighlight(i, 'title', e.target.value)}
                  className="border-slate-600 bg-slate-950/50"
                />
              </div>
              <div className="space-y-1 w-[120px]">
                <Label className="text-xs">Icône</Label>
                <select
                  value={h.icon}
                  onChange={(e) => setHighlightIcon(i, e.target.value as SiteHighlightIcon)}
                  className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-950/50 px-2 text-sm text-slate-100"
                >
                  <option value="heart">heart</option>
                  <option value="book">book</option>
                  <option value="globe">globe</option>
                </select>
              </div>
            </div>
            <Textarea
              value={h.text}
              onChange={(e) => setHighlight(i, 'text', e.target.value)}
              rows={2}
              className="border-slate-600 bg-slate-950/50"
            />
          </div>
        ))}
      </div>

      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function AxesPanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState(payload.axes);
  useEffect(() => setD(payload.axes), [payload.axes]);

  async function save() {
    await savePatch({ axes: d });
  }

  const add = () => setD([...d, { title: '', text: '' }]);
  const remove = (i: number) => setD(d.filter((_, j) => j !== i));

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-sm text-slate-400">Blocs « axes » sur la page d&apos;accueil.</p>
      {d.map((ax, i) => (
        <div key={i} className="rounded-lg border border-slate-700/60 p-4 space-y-2 bg-slate-900/30">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-500">Axe {i + 1}</span>
            <Button type="button" variant="ghost" size="sm" className="text-red-400" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Titre"
            value={ax.title}
            onChange={(e) => {
              const n = [...d];
              n[i] = { ...n[i], title: e.target.value };
              setD(n);
            }}
            className="border-slate-600 bg-slate-950/50"
          />
          <Textarea
            placeholder="Texte"
            value={ax.text}
            onChange={(e) => {
              const n = [...d];
              n[i] = { ...n[i], text: e.target.value };
              setD(n);
            }}
            rows={3}
            className="border-slate-600 bg-slate-950/50"
          />
        </div>
      ))}
      <Button type="button" variant="outline" className="border-slate-600" onClick={add}>
        <Plus className="mr-2 h-4 w-4" />
        Ajouter un axe
      </Button>
      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function HistoryPanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState(payload.history);
  useEffect(() => setD(payload.history), [payload.history]);
  const [labelsRaw, setLabelsRaw] = useState(d.valeurLabels.join('\n'));

  useEffect(() => {
    setLabelsRaw(payload.history.valeurLabels.join('\n'));
  }, [payload.history]);

  async function save() {
    const valeurLabels = labelsRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    await savePatch({ history: { ...d, valeurLabels } });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="space-y-2">
        <Label>Surtitre (tagline)</Label>
        <Input value={d.tagline} onChange={(e) => setD({ ...d, tagline: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Texte principal</Label>
        <Textarea value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} rows={6} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Valeurs (une par ligne)</Label>
        <Textarea value={labelsRaw} onChange={(e) => setLabelsRaw(e.target.value)} rows={5} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Accroche bureau</Label>
        <Textarea value={d.bureauTeaser} onChange={(e) => setD({ ...d, bureauTeaser: e.target.value })} rows={2} className="border-slate-600 bg-slate-950/50" />
      </div>
      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function JeunessePanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState(payload.jeunesse);
  const [itemsRaw, setItemsRaw] = useState(payload.jeunesse.items.join('\n'));
  useEffect(() => {
    setD(payload.jeunesse);
    setItemsRaw(payload.jeunesse.items.join('\n'));
  }, [payload.jeunesse]);

  async function save() {
    const items = itemsRaw.split('\n').map((s) => s.trim()).filter(Boolean);
    await savePatch({ jeunesse: { ...d, items } });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="space-y-2">
        <Label>Surtitre</Label>
        <Input value={d.tagline} onChange={(e) => setD({ ...d, tagline: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Puces (une par ligne)</Label>
        <Textarea value={itemsRaw} onChange={(e) => setItemsRaw(e.target.value)} rows={8} className="border-slate-600 bg-slate-950/50" />
      </div>
      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function GuineePanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState(payload.guineeSection);
  useEffect(() => setD(payload.guineeSection), [payload.guineeSection]);

  async function save() {
    await savePatch({ guineeSection: d });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="space-y-2">
        <Label>Surtitre (eyebrow)</Label>
        <Input value={d.eyebrow} onChange={(e) => setD({ ...d, eyebrow: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Introduction</Label>
        <Textarea value={d.intro} onChange={(e) => setD({ ...d, intro: e.target.value })} rows={4} className="border-slate-600 bg-slate-950/50" />
      </div>
      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function ProjetsLocauxPanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState(payload.projetsLocaux);
  const [bulletsRaw, setBulletsRaw] = useState(payload.projetsLocaux.bullets.join('\n'));
  useEffect(() => {
    setD(payload.projetsLocaux);
    setBulletsRaw(payload.projetsLocaux.bullets.join('\n'));
  }, [payload.projetsLocaux]);

  async function save() {
    const bullets = bulletsRaw.split('\n').map((s) => s.trim()).filter(Boolean);
    await savePatch({ projetsLocaux: { ...d, bullets } });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="space-y-2">
        <Label>Surtitre</Label>
        <Input value={d.eyebrow} onChange={(e) => setD({ ...d, eyebrow: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Lead</Label>
        <Textarea value={d.lead} onChange={(e) => setD({ ...d, lead: e.target.value })} rows={3} className="border-slate-600 bg-slate-950/50" />
      </div>
      <ImageUrlField
        label="Image principale"
        value={d.imageUrl}
        onChange={(url) => setD({ ...d, imageUrl: url })}
      />
      <div className="space-y-2">
        <Label>Puces (une par ligne)</Label>
        <Textarea value={bulletsRaw} onChange={(e) => setBulletsRaw(e.target.value)} rows={5} className="border-slate-600 bg-slate-950/50" />
      </div>
      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function AdhesionPanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState(payload.adhesion);
  const [bulletsRaw, setBulletsRaw] = useState(payload.adhesion.bullets.join('\n'));
  useEffect(() => {
    setD(payload.adhesion);
    setBulletsRaw(payload.adhesion.bullets.join('\n'));
  }, [payload.adhesion]);

  async function save() {
    const bullets = bulletsRaw.split('\n').map((s) => s.trim()).filter(Boolean);
    await savePatch({ adhesion: { ...d, bullets } });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="space-y-2">
        <Label>Introduction</Label>
        <Textarea value={d.intro} onChange={(e) => setD({ ...d, intro: e.target.value })} rows={4} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Avantages (une ligne par puce)</Label>
        <Textarea value={bulletsRaw} onChange={(e) => setBulletsRaw(e.target.value)} rows={5} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Texte cotisation</Label>
        <Input value={d.cotisationHint} onChange={(e) => setD({ ...d, cotisationHint: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function PartenairesListePanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState(payload.partenaires);
  const [itemsRaw, setItemsRaw] = useState(payload.partenaires.items.join('\n'));
  useEffect(() => {
    setD(payload.partenaires);
    setItemsRaw(payload.partenaires.items.join('\n'));
  }, [payload.partenaires]);

  async function save() {
    const items = itemsRaw.split('\n').map((s) => s.trim()).filter(Boolean);
    await savePatch({ partenaires: { ...d, items } });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-sm text-slate-400">Liste textuelle sur l&apos;accueil (pas les cartes détaillées du À propos).</p>
      <div className="space-y-2">
        <Label>Surtitre</Label>
        <Input value={d.eyebrow} onChange={(e) => setD({ ...d, eyebrow: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Items (une catégorie par ligne)</Label>
        <Textarea value={itemsRaw} onChange={(e) => setItemsRaw(e.target.value)} rows={8} className="border-slate-600 bg-slate-950/50" />
      </div>
      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function FaqPanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState(payload.faq);
  useEffect(() => setD(payload.faq), [payload.faq]);

  async function save() {
    await savePatch({ faq: d });
  }

  const updateItem = (i: number, field: 'q' | 'a', v: string) => {
    const items = [...d.items];
    items[i] = { ...items[i], [field]: v };
    setD({ ...d, items });
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="space-y-2">
        <Label>Surtitre</Label>
        <Input value={d.eyebrow} onChange={(e) => setD({ ...d, eyebrow: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Sous-titre</Label>
        <Input value={d.subtitle} onChange={(e) => setD({ ...d, subtitle: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-3">
        <Label>Questions / réponses</Label>
        {d.items.map((it, i) => (
          <div key={i} className="rounded-lg border border-slate-700/60 p-4 space-y-2 bg-slate-900/30">
            <div className="flex justify-between">
              <span className="text-xs text-slate-500">FAQ {i + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() => setD({ ...d, items: d.items.filter((_, j) => j !== i) })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input placeholder="Question" value={it.q} onChange={(e) => updateItem(i, 'q', e.target.value)} className="border-slate-600 bg-slate-950/50" />
            <Textarea placeholder="Réponse" value={it.a} onChange={(e) => updateItem(i, 'a', e.target.value)} rows={3} className="border-slate-600 bg-slate-950/50" />
          </div>
        ))}
        <Button type="button" variant="outline" className="border-slate-600" onClick={() => setD({ ...d, items: [...d.items, { q: '', a: '' }] })}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une FAQ
        </Button>
      </div>
      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function ContactPanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState(payload.contact);
  useEffect(() => setD(payload.contact), [payload.contact]);

  async function save() {
    await savePatch({ contact: d });
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="space-y-2">
        <Label>Surtitre</Label>
        <Input value={d.eyebrow} onChange={(e) => setD({ ...d, eyebrow: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Texte d&apos;introduction</Label>
        <Textarea value={d.lead} onChange={(e) => setD({ ...d, lead: e.target.value })} rows={3} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Téléphone (affiché)</Label>
        <Input value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Ligne WhatsApp</Label>
        <Input value={d.whatsappLine} onChange={(e) => setD({ ...d, whatsappLine: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>Région</Label>
        <Input value={d.regionLine} onChange={(e) => setD({ ...d, regionLine: e.target.value })} className="border-slate-600 bg-slate-950/50" />
      </div>
      <div className="space-y-2">
        <Label>URL iframe carte (Google Maps embed)</Label>
        <Textarea value={d.mapEmbedUrl} onChange={(e) => setD({ ...d, mapEmbedUrl: e.target.value })} rows={3} className="border-slate-600 bg-slate-950/50 font-mono text-xs" />
      </div>
      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function GaleriePanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState<SiteGalleryItem[]>(payload.gallery);
  useEffect(() => setD(payload.gallery), [payload.gallery]);

  async function save() {
    await savePatch({ gallery: d });
  }

  const add = () =>
    setD([
      ...d,
      { id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), url: '', alt: '' },
    ]);

  return (
    <div className="space-y-4 max-w-4xl">
      <p className="text-sm text-slate-400">
        Section « Moments partagés » sur l&apos;accueil (max. 8 images affichées).
      </p>
      {d.map((img, i) => (
        <div key={img.id} className="rounded-lg border border-slate-700/60 p-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] bg-slate-900/30 items-start">
          <div className="space-y-1">
            <Label className="text-xs">URL image</Label>
            <Input
              value={img.url}
              onChange={(e) => {
                const n = [...d];
                n[i] = { ...n[i], url: e.target.value };
                setD(n);
              }}
              className="border-slate-600 bg-slate-950/50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Texte alternatif</Label>
            <Input
              value={img.alt}
              onChange={(e) => {
                const n = [...d];
                n[i] = { ...n[i], alt: e.target.value };
                setD(n);
              }}
              className="border-slate-600 bg-slate-950/50"
            />
          </div>
          <Button type="button" variant="ghost" className="text-red-400 shrink-0" onClick={() => setD(d.filter((_, j) => j !== i))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" className="border-slate-600" onClick={add}>
        <Plus className="mr-2 h-4 w-4" />
        Ajouter une image
      </Button>
      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function AboutPanel({ payload, saving, savePatch }: PanelProps) {
  const [d, setD] = useState(payload.about);
  useEffect(() => setD(payload.about), [payload.about]);

  async function save() {
    await savePatch({ about: d });
  }

  const setPartner = (i: number, field: keyof (typeof d.partners.items)[0], v: string) => {
    const items = [...d.partners.items];
    items[i] = { ...items[i], [field]: v };
    setD({ ...d, partners: { ...d.partners, items } });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="rounded-lg border border-slate-700/60 p-4 space-y-3 bg-slate-900/30">
        <h3 className="font-semibold text-slate-200">Hero page À propos</h3>
        <Input placeholder="URL fond" value={d.hero.backgroundUrl} onChange={(e) => setD({ ...d, hero: { ...d.hero, backgroundUrl: e.target.value } })} className="border-slate-600 bg-slate-950/50" />
        <Input placeholder="Badge" value={d.hero.badge} onChange={(e) => setD({ ...d, hero: { ...d.hero, badge: e.target.value } })} className="border-slate-600 bg-slate-950/50" />
        <Input placeholder="Titre" value={d.hero.title} onChange={(e) => setD({ ...d, hero: { ...d.hero, title: e.target.value } })} className="border-slate-600 bg-slate-950/50" />
        <Textarea placeholder="Sous-titre" value={d.hero.subtitle} onChange={(e) => setD({ ...d, hero: { ...d.hero, subtitle: e.target.value } })} rows={3} className="border-slate-600 bg-slate-950/50" />
      </div>

      <div className="rounded-lg border border-slate-700/60 p-4 space-y-3 bg-slate-900/30">
        <h3 className="font-semibold text-slate-200">Bloc partenaires (cartes)</h3>
        <Input placeholder="Surtitre" value={d.partners.eyebrow} onChange={(e) => setD({ ...d, partners: { ...d.partners, eyebrow: e.target.value } })} className="border-slate-600 bg-slate-950/50" />
        <Input placeholder="Titre" value={d.partners.title} onChange={(e) => setD({ ...d, partners: { ...d.partners, title: e.target.value } })} className="border-slate-600 bg-slate-950/50" />
        <Textarea placeholder="Lead" value={d.partners.lead} onChange={(e) => setD({ ...d, partners: { ...d.partners, lead: e.target.value } })} rows={3} className="border-slate-600 bg-slate-950/50" />

        {d.partners.items.map((p, i) => (
          <div key={i} className="border border-slate-700/40 rounded p-3 space-y-2 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Partenaire {i + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={() =>
                  setD({
                    ...d,
                    partners: { ...d.partners, items: d.partners.items.filter((_, j) => j !== i) },
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input placeholder="Nom" value={p.name} onChange={(e) => setPartner(i, 'name', e.target.value)} className="border-slate-600 bg-slate-950/50" />
            <Textarea placeholder="Description" value={p.description} onChange={(e) => setPartner(i, 'description', e.target.value)} rows={2} className="border-slate-600 bg-slate-950/50" />
            <Input placeholder="Logo URL" value={p.logo} onChange={(e) => setPartner(i, 'logo', e.target.value)} className="border-slate-600 bg-slate-950/50" />
            <Input placeholder="Type" value={p.type} onChange={(e) => setPartner(i, 'type', e.target.value)} className="border-slate-600 bg-slate-950/50" />
            <Input
              placeholder="Lien (optionnel)"
              value={p.link ?? ''}
              onChange={(e) => setPartner(i, 'link', e.target.value)}
              className="border-slate-600 bg-slate-950/50"
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="border-slate-600"
          onClick={() =>
            setD({
              ...d,
              partners: {
                ...d.partners,
                items: [...d.partners.items, { name: '', description: '', logo: '', type: '' }],
              },
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un partenaire
        </Button>
      </div>

      <SaveRow saving={saving} onSave={save} />
    </div>
  );
}

export function MessagesPresidentTab() {
  return (
    <div className="max-w-4xl">
      <p className="text-sm text-slate-400 mb-6">
        Citations affichées dans le bloc « Message du Président » sur l&apos;accueil (données séparées dans{' '}
        <code className="text-violet-400">president_citations</code>).
      </p>
      <PresidentMessagesAdminClient />
    </div>
  );
}
