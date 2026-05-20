// src/app/admin/projets/nouveau/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface MediaItem {
  url: string;
  type: 'IMAGE' | 'DOCUMENT';
}

export default function NouveauProjetPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    titre: '',
    objectif: '',
    description: '',
    statut: 'BROUILLON',
    visibiliteSite: false,
    responsablePosteId: '',
    mandatId: '',
    medias: [] as MediaItem[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const name = target.name;
    const type = target.type;
    const value = target.value;
    const checked = target.type === 'checkbox' ? (target as HTMLInputElement).checked : false;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleMediaAdd = () => {
    setForm((prev) => ({
      ...prev,
      medias: [...prev.medias, { url: '', type: 'IMAGE' }],
    }));
  };

  const handleMediaChange = (index: number, field: keyof MediaItem, value: string) => {
    setForm((prev) => {
      const newMedias = [...prev.medias];
      newMedias[index] = { ...newMedias[index], [field]: value };
      return { ...prev, medias: newMedias };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/projets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la création');
      }
      router.push('/admin/projets');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/admin/projets" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-4">
        <ArrowLeft className="h-4 w-4" /> Retour aux projets
      </Link>
      <h1 className="text-2xl font-bold text-agcm-900 mb-4">Créer un nouveau projet</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Titre *</label>
          <input
            name="titre"
            value={form.titre}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Objectif *</label>
          <textarea
            name="objectif"
            value={form.objectif}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2">
              <option value="BROUILLON">Brouillon</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>
          <div className="flex items-center mt-6">
            <input type="checkbox" name="visibiliteSite" checked={form.visibiliteSite} onChange={handleChange} className="mr-2" />
            <span className="text-sm text-slate-700">Visible sur le site public</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Responsable (ID)</label>
          <input name="responsablePosteId" value={form.responsablePosteId} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Mandat (ID)</label>
          <input name="mandatId" value={form.mandatId} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Médias</h2>
          {form.medias.map((m, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
              <input placeholder="URL" value={m.url} onChange={(e) => handleMediaChange(idx, 'url', e.target.value)} className="col-span-2 border rounded-md p-2" />
              <select value={m.type} onChange={(e) => handleMediaChange(idx, 'type', e.target.value as any)} className="border rounded-md p-2">
                <option value="IMAGE">Image</option>
                <option value="DOCUMENT">Document</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={handleMediaAdd} className="inline-flex items-center gap-1 text-blue-600">
            + Ajouter un média
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Créer
          </button>
          <Link href="/admin/projets" className="text-slate-600 hover:underline">Annuler</Link>
        </div>
      </form>
    </div>
  );
}
