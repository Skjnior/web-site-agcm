// src/app/admin/projets/nouveau/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
  // New state for image upload preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  // Handle image file selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    } else {
      setImagePreview(null);
    }
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

    const res = await fetch('/api/admin/projets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
      if (!res.ok) {
        const err = await res.json();
        console.error('Server error creating project:', err);
        const message = err.error || err.message || 'Erreur lors de la création';
        if (err.details) {
          setError(message + ': ' + JSON.stringify(err.details));
        } else {
          setError(message);
        }
        return;
      }
      router.push('/admin/projets');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/admin/projets" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour aux projets
      </Link>
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Créer un nouveau projet</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Ajouter un nouveau projet dans le système</p>
      </div>
      {error && (
        <div className="rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="admin-glass rounded-3xl p-8 shadow-sm space-y-6">
        <h2 className="border-b border-slate-200/50 pb-4 text-xl font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">Informations générales</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Titre *</label>
          <input
            name="titre"
            value={form.titre}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Objectif *</label>
          <textarea
            name="objectif"
            value={form.objectif}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100">
              <option value="BROUILLON">Brouillon</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>
          <div className="flex items-center mt-8">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input
                  type="checkbox"
                  name="visibiliteSite"
                  checked={form.visibiliteSite}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                <svg className="absolute w-3 h-3 text-white peer-checked:opacity-100 opacity-0 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Visible sur le site public</span>
            </label>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Responsable (ID)</label>
            <input name="responsablePosteId" value={form.responsablePosteId} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mandat (ID)</label>
            <input name="mandatId" value={form.mandatId} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100" />
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Médias</h2>
          <div className="space-y-3 mb-4">
            {form.medias.map((m, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-3">
                <input placeholder="URL du média" value={m.url} onChange={(e) => handleMediaChange(idx, 'url', e.target.value)} className="col-span-2 w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100" />
                <select value={m.type} onChange={(e) => handleMediaChange(idx, 'type', e.target.value as any)} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100">
              </select>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleMediaAdd} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            <Plus className="w-4 h-4" /> Ajouter un média
          </button>
          {/* Image Upload */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Image du projet</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {imagePreview && (
              <div className="mt-4 flex items-center gap-4">
                <Image src={imagePreview} alt="Preview" width={200} height={120} className="object-cover rounded-lg" />
                <a href={imagePreview} download className="text-blue-600 hover:underline">Télécharger l'image</a>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 pt-4">
          <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 font-medium text-white rounded-xl hover:bg-blue-700 transition-all hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} Créer le projet
          </button>
          <Link href="/admin/projets" className="rounded-xl border border-slate-200 bg-white px-8 py-3 font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Annuler</Link>
        </div>
      </form>
    </div>
  );
}
