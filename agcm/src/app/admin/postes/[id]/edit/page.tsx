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
    setValue,
  } = useForm<PosteFormData>({
    resolver: zodResolver(posteUpdateSchema),
  });

  useEffect(() => {
    fetchPoste();
  }, [posteId]);

  const fetchPoste = async () => {
    try {
      const response = await fetch(`/api/super-admin/postes/${posteId}`);
      if (!response.ok) throw new Error('Poste introuvable');

      const result = await response.json();
      const poste = result.poste || result;
      setValue('nom', poste.nom);
      setValue('description', poste.description || '');
      setValue('estBureau', poste.estBureau);
      setValue('estActif', poste.estActif);
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
      <div className="max-w-3xl mx-auto space-y-6 text-gray-900">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guinea-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center gap-4">
        <Link href="/admin/postes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modifier le poste</h1>
          <p className="text-gray-600 mt-1">Modifier les informations du poste</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="estBureau"
              {...register('estBureau')}
              className="w-4 h-4 text-guinea-red border-gray-300 rounded focus:ring-guinea-red"
            />
            <Label htmlFor="estBureau" className="cursor-pointer">
              Poste du bureau
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="estActif"
              {...register('estActif')}
              className="w-4 h-4 text-guinea-red border-gray-300 rounded focus:ring-guinea-red"
            />
            <Label htmlFor="estActif" className="cursor-pointer">
              Poste actif
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/postes">
            <Button type="button" variant="outline">Annuler</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}

