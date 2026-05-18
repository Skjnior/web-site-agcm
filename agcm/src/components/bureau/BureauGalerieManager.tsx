'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type GalerieRow = {
  id: string;
  url: string;
  alt: string;
  visibleSite: boolean;
  ordre: number;
};

export default function BureauGalerieManager() {
  const [images, setImages] = useState<GalerieRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [alt, setAlt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bureau/galerie');
      const data = await res.json();
      if (res.ok) setImages(data.images ?? []);
      else setError(data.error || 'Erreur de chargement');
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const up = await fetch('/api/admin/upload-image', { method: 'POST', body: form });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || 'Upload échoué');

      const create = await fetch('/api/bureau/galerie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: upData.imageUrl,
          alt: alt.trim() || file.name.replace(/\.[^.]+$/, ''),
          visibleSite: false,
        }),
      });
      const created = await create.json();
      if (!create.ok) throw new Error(created.error || 'Création échouée');

      setAlt('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleVisible = async (img: GalerieRow) => {
    const res = await fetch(`/api/bureau/galerie/${img.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibleSite: !img.visibleSite }),
    });
    if (res.ok) await load();
  };

  const updateAlt = async (id: string, newAlt: string) => {
    await fetch(`/api/bureau/galerie/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alt: newAlt }),
    });
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette image de la galerie ?')) return;
    const res = await fetch(`/api/bureau/galerie/${id}`, { method: 'DELETE' });
    if (res.ok) await load();
  };

  const visibleCount = images.filter((i) => i.visibleSite).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Ajouter une photo</h2>
        <p className="text-sm text-slate-400 mb-4">
          Les images masquées ne sont pas visibles sur le site public.
          {visibleCount > 0 ? ` ${visibleCount} affichée(s).` : ' Aucune affichée.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full space-y-2">
            <Label htmlFor="galerie-alt" className="text-slate-300">Légende (optionnel)</Label>
            <Input id="galerie-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Ex. Assemblée générale 2026" className="border-slate-600 bg-slate-950/50" />
          </div>
          <Label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            <Button type="button" disabled={uploading} asChild><span>{uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}Importer</span></Button>
          </Label>
        </div>
        {error ? <p className="text-red-400 text-sm mt-2">{error}</p> : null}
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      ) : images.length === 0 ? (
        <p className="text-slate-400 text-center py-8">Aucune image.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="rounded-xl border border-slate-700/50 bg-slate-900/30 overflow-hidden">
              <div className="relative aspect-video bg-slate-800">
                <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="400px" />
                <Badge className={`absolute top-2 right-2 ${img.visibleSite ? 'bg-emerald-600' : 'bg-slate-600'}`}>{img.visibleSite ? 'Visible' : 'Masquée'}</Badge>
              </div>
              <div className="p-3 space-y-2">
                <Input defaultValue={img.alt} onBlur={(e) => updateAlt(img.id, e.target.value)} className="text-sm border-slate-600 bg-slate-950/50" />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1 border-slate-600" onClick={() => toggleVisible(img)}>
                    {img.visibleSite ? <><EyeOff className="h-4 w-4 mr-1" />Masquer</> : <><Eye className="h-4 w-4 mr-1" />Afficher</>}
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => remove(img.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
