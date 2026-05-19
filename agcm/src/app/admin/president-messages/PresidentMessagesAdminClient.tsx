'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Citation = {
  id: string;
  nom: string;
  message: string;
  debutMandat: string;
  finMandat: string | null;
  photoUrl: string | null;
};

function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

const emptyForm = {
  nom: '',
  message: '',
  debutMandat: new Date().toISOString().slice(0, 10),
  finMandat: '',
  photoUrl: '',
};

export default function PresidentMessagesAdminClient() {
  const [items, setItems] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/president-citations');
      if (!res.ok) throw new Error('Chargement impossible');
      const data = (await res.json()) as Citation[];
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      window.alert('Impossible de charger les messages du président.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(c: Citation) {
    setEditingId(c.id);
    setForm({
      nom: c.nom,
      message: c.message,
      debutMandat: toDateInputValue(c.debutMandat),
      finMandat: c.finMandat ? toDateInputValue(c.finMandat) : '',
      photoUrl: c.photoUrl ?? '',
    });
    setShowForm(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nom: form.nom.trim(),
        message: form.message.trim(),
        debutMandat: form.debutMandat,
        finMandat: form.finMandat.trim() === '' ? null : form.finMandat,
        photoUrl: form.photoUrl.trim() === '' ? null : form.photoUrl.trim(),
      };

      const url = editingId
        ? `/api/admin/president-citations/${editingId}`
        : '/api/admin/president-citations';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const errBody = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof errBody.error === 'string' ? errBody.error : 'Enregistrement impossible');
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Supprimer ce message ? Il disparaîtra de la page d’accueil.')) return;
    try {
      const res = await fetch(`/api/admin/president-citations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Suppression impossible');
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Erreur');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-100">
            <Quote className="h-7 w-7 text-red-400" aria-hidden />
            Messages du Président
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Citations affichées sur la page d&apos;accueil (carrousel « Message du Président »). Les visiteurs voient
            la liste via l&apos;API publique ; seul un super-admin peut les modifier ici.
          </p>
        </div>
        <Button type="button" onClick={openCreate} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un message
        </Button>
      </div>

      {showForm ? (
        <form
          onSubmit={submit}
          className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-6 space-y-4 max-w-2xl"
        >
          <h2 className="text-lg font-semibold text-slate-200">
            {editingId ? 'Modifier le message' : 'Nouveau message'}
          </h2>

          <div className="space-y-2">
            <Label htmlFor="pm-nom">Nom affiché</Label>
            <Input
              id="pm-nom"
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              required
              className="border-slate-600 bg-slate-950/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm-msg">Citation / message</Label>
            <textarea
              id="pm-msg"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              required
              rows={4}
              className="w-full rounded-md border border-slate-600 bg-slate-950/50 px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pm-debut">Début de mandat</Label>
              <Input
                id="pm-debut"
                type="date"
                value={form.debutMandat}
                onChange={(e) => setForm((f) => ({ ...f, debutMandat: e.target.value }))}
                required
                className="border-slate-600 bg-slate-950/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm-fin">Fin de mandat (optionnel)</Label>
              <Input
                id="pm-fin"
                type="date"
                value={form.finMandat}
                onChange={(e) => setForm((f) => ({ ...f, finMandat: e.target.value }))}
                className="border-slate-600 bg-slate-950/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pm-photo">URL de la photo (optionnel)</Label>
            <Input
              id="pm-photo"
              type="url"
              placeholder="https://…"
              value={form.photoUrl}
              onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
              className="border-slate-600 bg-slate-950/50"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingId ? 'Enregistrer' : 'Créer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-600"
              disabled={saving}
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Annuler
            </Button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-700/60">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-700 bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-400">Nom</th>
              <th className="px-4 py-3 font-medium text-slate-400">Extrait</th>
              <th className="px-4 py-3 font-medium text-slate-400">Mandat</th>
              <th className="px-4 py-3 text-right font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  Aucune citation. Ajoutez-en une ou relancez le seed Prisma.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="bg-slate-900/20 hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-medium text-slate-200">{c.nom}</td>
                  <td className="max-w-md truncate px-4 py-3 text-slate-400">{c.message}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                    {new Date(c.debutMandat).getFullYear()}
                    {c.finMandat ? ` — ${new Date(c.finMandat).getFullYear()}` : ' — …'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => void remove(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
