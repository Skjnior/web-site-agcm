// src/app/admin/projets/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

interface MediaItem {
  url: string;
  type: 'IMAGE' | 'DOCUMENT';
}

interface Projet {
  id: string;
  titre: string;
  objectif: string;
  description: string;
  statut: string;
  visibiliteSite: boolean;
  responsablePosteId: string;
  mandatId: string;
  medias: MediaItem[];
}

export default function EditProjetPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [projet, setProjet] = useState<Projet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjet = async () => {
      try {
        const res = await fetch(`/api/admin/projets?id=${id}`);
        const json = await res.json();
        if (res.ok && json.data && json.data.length > 0) {
          setProjet(json.data[0]);
        } else {
          setError('Projet introuvable.');
        }
      } catch (e) {
        setError('Erreur lors du chargement du projet.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjet();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!projet) return;
    const { name, value, type, checked } = e.target;
    setProjet({
      ...projet,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleMediaChange = (index: number, field: keyof MediaItem, val: string) => {
    if (!projet) return;
    const newMedias = [...projet.medias];
    newMedias[index] = { ...newMedias[index], [field]: val };
    setProjet({ ...projet, medias: newMedias });
  };

  const addMedia = () => {
    if (!projet) return;
    setProjet({ ...projet, medias: [...projet.medias, { url: '', type: 'IMAGE' }] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projet) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/projets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projet),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }
      router.push('/admin/projets');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Chargement du projet…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!projet) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/admin/projets" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-4">
        <ArrowLeft className="h-4 w-4" /> Retour aux projets
      </Link>
      <h1 className="text-2xl font-bold text-agcm-900 mb-4">Modifier le projet « {projet.titre} »</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Titre *</label>
          <input name="titre" value={projet.titre} onChange={handleChange} required className="mt-1 block w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Objectif *</label>
          <textarea name="objectif" value={projet.objectif} onChange={handleChange} required className="mt-1 block w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Description *</label>
          <textarea name="description" value={projet.description} onChange={handleChange} required className="mt-1 block w-full border rounded-md p-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Statut</label>
            <select name="statut" value={projet.statut} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2">
              <option value="BROUILLON">Brouillon</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>
          <div className="flex items-center mt-6">
            <input type="checkbox" name="visibiliteSite" checked={projet.visibiliteSite} onChange={handleChange} className="mr-2" />
            <span className="text-sm text-slate-700">Visible sur le site public</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Responsable (ID)</label>
          <input name="responsablePosteId" value={projet.responsablePosteId} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Mandat (ID)</label>
          <input name="mandatId" value={projet.mandatId} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Médias</h2>
          {projet.medias.map((m, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
              <input placeholder="URL" value={m.url} onChange={(e) => handleMediaChange(idx, 'url', e.target.value)} className="col-span-2 border rounded-md p-2" />
              <select value={m.type} onChange={(e) => handleMediaChange(idx, 'type', e.target.value as any)} className="border rounded-md p-2">
                <option value="IMAGE">Image</option>
                <option value="DOCUMENT">Document</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={addMedia} className="text-blue-600 inline-flex items-center gap-1">
            + Ajouter un média
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer
          </button>
          <Link href="/admin/projets" className="text-slate-600 hover:underline">Annuler</Link>
        </div>
      </form>
    </div>
  );
}
