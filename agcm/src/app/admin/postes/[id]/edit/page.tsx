'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const posteUpdateSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').optional(),
  description: z.string().optional(),
  estBureau: z.boolean().optional(),
  estActif: z.boolean().optional(),
});

type PosteFormData = z.infer<typeof posteUpdateSchema>;

export default function EditPostePage() {
  const router = useRouter();
  const params = useParams();
  const posteId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingPoste, setLoadingPoste] = useState(true);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PosteFormData>({
    resolver: zodResolver(posteUpdateSchema),
    defaultValues: {
      nom: '',
      description: '',
      estBureau: false,
      estActif: true,
    },
  });

  useEffect(() => {
    fetchPoste();
  }, [posteId]);

  const fetchPoste = async () => {
    try {
      const response = await fetch(`/api/super-admin/postes/${posteId}`);
      if (!response.ok) throw new Error('Poste introuvable');

      const result = await response.json();
      const poste = result?.poste;
      if (!poste || typeof poste !== 'object') {
        throw new Error(result?.error || 'Poste introuvable');
      }

      reset({
        nom: poste.nom ?? '',
        description: poste.description ?? '',
        estBureau: poste.estBureau,
        estActif: poste.estActif,
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoadingPoste(false);
    }
  };

  const onSubmit = async (data: PosteFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/super-admin/postes/${posteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la modification');
      }

      router.push('/admin/postes');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  if (loadingPoste) {
    return (
      <div className="admin-page space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
        <div className="admin-glass rounded-2xl p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page mx-auto max-w-3xl space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
      <div className="admin-glass flex flex-col gap-4 rounded-2xl p-6 shadow-sm sm:flex-row sm:items-center sm:gap-6">
        <Link href="/admin/postes">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
            Modifier le poste
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Modifier les informations du poste</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200/80 bg-red-50/90 p-4 dark:border-red-900/50 dark:bg-red-950/40">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="admin-panel-form">
        <div className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              {...register('nom')}
              className={errors.nom ? 'border-red-500' : ''}
            />
            {errors.nom && (
              <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="estBureau"
              {...register('estBureau')}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-900"
            />
            <Label htmlFor="estBureau" className="cursor-pointer text-slate-800 dark:text-slate-200">
              Poste du bureau
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="estActif"
              {...register('estActif')}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-900"
            />
            <Label htmlFor="estActif" className="cursor-pointer text-slate-800 dark:text-slate-200">
              Poste actif
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <Link href="/admin/postes">
            <Button type="button" variant="outline" className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800">
              Annuler
            </Button>
          </Link>
          <Button type="submit" variant="edit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}

