'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TableRowActionsMenu,
  type TableRowAction,
} from '@/components/ui/table-row-actions-menu';
import { FileText, ImageIcon, Loader2, Trash2 } from 'lucide-react';

export type BureauEventMediaDraft = {
  url: string;
  isPrincipale: boolean;
  ordre?: number;
};

export type BureauProjetMediaDraft = {
  url: string;
  type: 'IMAGE' | 'DOCUMENT';
  ordre?: number;
};

export type BureauContentAttachmentDraft = {
  url: string;
  kind: 'IMAGE' | 'DOCUMENT';
  label?: string;
};

function looksLikePdf(url: string): boolean {
  const u = url.toLowerCase().split('?')[0] ?? '';
  return u.endsWith('.pdf');
}

type Props =
  | {
      variant: 'event';
      label?: string;
      items: BureauEventMediaDraft[];
      onChange: (items: BureauEventMediaDraft[]) => void;
      max?: number;
    }
  | {
      variant: 'projet';
      label?: string;
      items: BureauProjetMediaDraft[];
      onChange: (items: BureauProjetMediaDraft[]) => void;
      max?: number;
    }
  | {
      variant: 'content';
      label?: string;
      items: BureauContentAttachmentDraft[];
      onChange: (items: BureauContentAttachmentDraft[]) => void;
      max?: number;
    };

export function BureauAttachmentsManager(props: Props) {
  const variant = props.variant;
  const label =
    props.label ??
    (variant === 'event'
      ? 'Photos et documents'
      : variant === 'projet'
        ? 'Images et documents du projet'
        : 'Pièces jointes (images, PDF…)');
  const items = props.items;
  const max = props.max ?? (variant === 'content' ? 20 : 30);

  const imgRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'image' | 'document' | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof data.error === 'string' ? data.error : 'Échec upload image');
    }
    const url = data.imageUrl as string | undefined;
    if (!url) throw new Error('Réponse upload invalide');
    return url;
  };

  const uploadDocument = async (file: File): Promise<{ url: string; name: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/bureau/upload-document', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof data.error === 'string' ? data.error : 'Échec upload document');
    }
    const url = data.fileUrl as string | undefined;
    if (!url) throw new Error('Réponse upload invalide');
    const name = typeof data.fileName === 'string' ? data.fileName : file.name;
    return { url, name };
  };

  const appendItems = async (file: File, asDocument: boolean) => {
    if (items.length >= max) {
      alert(`Maximum ${max} éléments`);
      return;
    }
    setBusy(asDocument ? 'document' : 'image');
    try {
      let url: string;
      let suggestedLabel: string | undefined;

      if (asDocument) {
        const r = await uploadDocument(file);
        url = r.url;
        suggestedLabel = r.name;
      } else {
        if (!file.type.startsWith('image/')) {
          alert('Ce fichier n’est pas une image.');
          return;
        }
        url = await uploadImage(file);
      }

      if (variant === 'event') {
        const next = [...props.items];
        const principale =
          next.length === 0 && !asDocument && !looksLikePdf(url)
            ? true
            : false;
        next.push({
          url,
          isPrincipale: principale,
          ordre: next.length,
        });
        props.onChange(next);
        return;
      }

      if (variant === 'projet') {
        const next = [...props.items];
        next.push({
          url,
          type: asDocument ? 'DOCUMENT' : 'IMAGE',
          ordre: next.length,
        });
        props.onChange(next);
        return;
      }

      const next = [...props.items];
      next.push({
        url,
        kind: asDocument ? 'DOCUMENT' : 'IMAGE',
        label: suggestedLabel,
      });
      props.onChange(next);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur upload');
    } finally {
      setBusy(null);
      if (imgRef.current) imgRef.current.value = '';
      if (docRef.current) docRef.current.value = '';
    }
  };

  const removeAt = (index: number) => {
    if (variant === 'event') {
      props.onChange(props.items.filter((_, i) => i !== index));
      return;
    }
    if (variant === 'projet') {
      props.onChange(props.items.filter((_, i) => i !== index));
      return;
    }
    props.onChange(props.items.filter((_, i) => i !== index));
  };

  const setEventPrincipale = (index: number) => {
    if (variant !== 'event') return;
    props.onChange(
      props.items.map((row, i) => ({
        ...row,
        isPrincipale: i === index && !looksLikePdf(row.url),
        ordre: i,
      }))
    );
  };

  const updateContentLabel = (index: number, labelVal: string) => {
    if (variant !== 'content') return;
    const rows = [...props.items];
    rows[index] = { ...rows[index], label: labelVal || undefined };
    props.onChange(rows);
  };

  const atMax = items.length >= max;
  const uploadBusy = busy !== null;

  const addAttachmentActions: TableRowAction[] = [
    {
      label: busy === 'image' ? 'Ajouter une image…' : 'Ajouter une image',
      icon:
        busy === 'image' ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4 shrink-0" />
        ),
      onClick: () => imgRef.current?.click(),
      disabled: uploadBusy || atMax,
      variant: 'add',
    },
    {
      label: busy === 'document' ? 'Ajouter un document…' : 'Ajouter un document (PDF…)',
      icon:
        busy === 'document' ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <FileText className="h-4 w-4 shrink-0" />
        ),
      onClick: () => docRef.current?.click(),
      disabled: uploadBusy || atMax,
      variant: 'add',
    },
  ];

  return (
    <div className="space-y-3 rounded-lg border border-slate-700/60 bg-slate-900/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-slate-300">{label}</Label>
        <span className="text-xs text-slate-500">
          {items.length}/{max}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TableRowActionsMenu
          actions={addAttachmentActions}
          triggerLabel="Ajouter une pièce jointe"
          align="left"
          triggerClassName="border-slate-600 bg-slate-900/50 text-slate-200 hover:bg-slate-800 dark:border-slate-600"
          menuClassName="dark:border-slate-700 dark:bg-slate-900"
          menuItemClassName="dark:focus:bg-slate-800"
        />
        {atMax && (
          <span className="text-xs text-amber-500/90">Limite atteinte ({max})</span>
        )}
      </div>

      <input
        ref={imgRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void appendItems(f, false);
        }}
      />
      <input
        ref={docRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void appendItems(f, true);
        }}
      />

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune pièce jointe pour l’instant.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((row, index) => {
            const url = row.url;
            const isImg =
              variant !== 'event'
                ? variant === 'projet'
                  ? (row as BureauProjetMediaDraft).type === 'IMAGE'
                  : (row as BureauContentAttachmentDraft).kind === 'IMAGE'
                : !looksLikePdf(url);

            return (
              <li
                key={`${url}-${index}`}
                className="flex flex-col gap-2 rounded-md border border-slate-700/50 bg-slate-950/40 p-3 sm:flex-row sm:items-start"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  {isImg ? (
                    <img
                      src={url}
                      alt=""
                      className="max-h-32 max-w-full rounded border border-slate-700 object-contain"
                    />
                  ) : (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm text-blue-400 underline"
                    >
                      {url}
                    </a>
                  )}

                  {variant === 'content' && (
                    <Input
                      placeholder="Libellé (optionnel)"
                      value={(row as BureauContentAttachmentDraft).label ?? ''}
                      onChange={(e) => updateContentLabel(index, e.target.value)}
                      className="border-slate-600 bg-slate-900/50 text-slate-100"
                    />
                  )}

                  {variant === 'event' && isImg && (
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                      <input
                        type="radio"
                        name="event-media-principale"
                        checked={(row as BureauEventMediaDraft).isPrincipale}
                        onChange={() => setEventPrincipale(index)}
                        className="border-slate-600"
                      />
                      Image principale (aperçu liste / carte)
                    </label>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-red-400 hover:bg-red-950/40 hover:text-red-300"
                  title="Retirer"
                  onClick={() => removeAt(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function normalizeContentAttachments(raw: unknown): BureauContentAttachmentDraft[] {
  if (!Array.isArray(raw)) return [];
  const out: BureauContentAttachmentDraft[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const o = entry as Record<string, unknown>;
    const url = typeof o.url === 'string' ? o.url : '';
    if (!url) continue;
    const kind = o.kind === 'DOCUMENT' ? 'DOCUMENT' : 'IMAGE';
    const label = typeof o.label === 'string' ? o.label : undefined;
    out.push({ url, kind, label });
  }
  return out;
}
