'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

type PartnerRow = {
  id: string;
  nom: string;
  logo: string | null;
  description: string | null;
  siteUrl: string | null;
  type: string | null;
  statut: string;
  visibiliteSite: boolean;
};

const emptyForm = {
  nom: '',
  logo: '',
  description: '',
  siteUrl: '',
  type: '',
  visibiliteSite: true,
};

export default function BureauPartenairesManager() {
  const [partenaires, setPartenaires] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bureau/partenaires');
      const data = await res.json();
      if (res.ok) setPartenaires(data.partenaires ?? []);
      else setError(data.error || 'Erreur');
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      setError('Le nom est obligatoire');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      nom: form.nom.trim(),
      logo: form.logo.trim() || null,
      description: form.description.trim() || null,
      siteUrl: form.siteUrl.trim() || null,
      type: form.type.trim() || null,
      visibiliteSite: form.visibiliteSite,
      statut: 'ACTIF' as const,
    };
    try {
      const res = await fetch(
        editingId ? `/api/bureau/partenaires/${editingId}` : '/api/bureau/partenaires',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: PartnerRow) => {
    setEditingId(p.id);
    setForm({
      nom: p.nom,
      logo: p.logo ?? '',
      description: p.description ?? '',
      siteUrl: p.siteUrl ?? '',
      type: p.type ?? '',
      visibiliteSite: p.visibiliteSite,
    });
  };

  const toggleVisible = async (p: PartnerRow) => {
    await fetch(`/api/bureau/partenaires/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibiliteSite: !p.visibiliteSite }),
    });
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer ce partenaire ?')) return;
    await fetch(`/api/bureau/partenaires/${id}`, { method: 'DELETE' });
    if (editingId === id) resetForm();
    await load();
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) setForm((f) => ({ ...f, logo: data.imageUrl }));
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {editingId ? 'Modifier le partenaire' : 'Ajouter un partenaire'}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-slate-300">Nom *</Label>
            <Input
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
              className="border-slate-600 bg-slate-950/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Type</Label>
            <Input
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              placeholder="Institution, Entreprise…"
              className="border-slate-600 bg-slate-950/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Site web</Label>
            <Input
              value={form.siteUrl}
              onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
              placeholder="https://…"
              className="border-slate-600 bg-slate-950/50"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-slate-300">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="border-slate-600 bg-slate-950/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Logo</Label>
            <Input
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="/uploads/images/…"
              className="border-slate-600 bg-slate-950/50"
            />
            <Label className="cursor-pointer text-xs text-red-400">
              <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
              Importer un logo
            </Label>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="vis-partner"
              type="checkbox"
              checked={form.visibiliteSite}
              onChange={(e) => setForm({ ...form, visibiliteSite: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="vis-partner" className="text-slate-300 cursor-pointer">
              Visible sur le site public
            </Label>
          </div>
        </div>
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {editingId ? 'Enregistrer' : 'Ajouter'}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={resetForm} className="border-slate-600">
              Annuler
            </Button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {partenaires.map((p) => (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-slate-700/50 bg-slate-900/30 p-4"
            >
              {p.logo ? (
                <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-white">
                  <Image src={p.logo} alt={p.nom} fill className="object-contain p-1" />
                </div>
              ) : null}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{p.nom}</p>
                {p.type ? <p className="text-xs text-slate-400">{p.type}</p> : null}
                {p.description ? (
                  <p className="text-sm text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={p.visibiliteSite ? 'bg-emerald-600' : 'bg-slate-600'}>
                  {p.visibiliteSite ? 'Site' : 'Masqué'}
                </Badge>
                <Button type="button" size="sm" variant="outline" className="border-slate-600" onClick={() => toggleVisible(p)}>
                  {p.visibiliteSite ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button type="button" size="sm" variant="outline" className="border-slate-600" onClick={() => startEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => remove(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
