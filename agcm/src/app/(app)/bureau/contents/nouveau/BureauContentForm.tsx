'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { Loader2, Save } from 'lucide-react';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';

const contentCreateSchema = z.object({
  type: z.enum(['ACTIVITE', 'ACTUALITE', 'PARTAGE', 'ANNONCE']),
  titre: z.string().min(1, 'Le titre est requis').max(200),
  contenu: z.string().optional(),
  lienExterne: z.string().url('URL invalide').optional().or(z.literal('')),
  imagePrincipale: z.string().optional().or(z.literal('')),
  visibiliteCible: z.enum(['PRIVE_BUREAU', 'PUBLIC_SITE']),
});

type ContentFormData = z.infer<typeof contentCreateSchema>;

export default function BureauContentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentCreateSchema),
    defaultValues: {
      type: 'ACTIVITE',
      visibiliteCible: 'PUBLIC_SITE',
    },
  });

  const onSubmit = async (data: ContentFormData) => {
    setLoading(true);
    try {
      const body = {
        type: data.type,
        titre: data.titre,
        contenu: data.contenu || '',
        lienExterne: data.lienExterne || '',
        imagePrincipale: data.imagePrincipale || '',
        visibiliteCible: data.visibiliteCible,
        tags: [],
      };

      const response = await fetch('/api/bureau/contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      setSuccessModal({ isOpen: true, message: 'Contenu créé avec succès !' });
      setTimeout(() => {
        router.push('/bureau/contents');
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      setErrorModal({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Erreur lors de la création',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 space-y-6"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="type" className="text-slate-300">Type de contenu</Label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value as ContentFormData['type'])}
            >
              <SelectTrigger id="type" className="bg-slate-900/50 border-slate-600 text-slate-100">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="ACTIVITE" className="text-slate-900">Activité</SelectItem>
                <SelectItem value="ACTUALITE" className="text-slate-900">Actualité</SelectItem>
                <SelectItem value="PARTAGE" className="text-slate-900">Partage</SelectItem>
                <SelectItem value="ANNONCE" className="text-slate-900">Annonce</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <Label htmlFor="titre" className="text-slate-300">Titre *</Label>
            <Input
              id="titre"
              {...register('titre')}
              className={`bg-slate-900/50 border-slate-600 text-slate-100 ${errors.titre ? 'border-red-500' : ''}`}
              placeholder="Titre du contenu"
            />
            {errors.titre && <p className="text-red-400 text-sm mt-1">{errors.titre.message}</p>}
          </div>

          <div>
            <Label htmlFor="contenu" className="text-slate-300">Contenu</Label>
            <Textarea
              id="contenu"
              {...register('contenu')}
              rows={10}
              className="bg-slate-900/50 border-slate-600 text-slate-100"
              placeholder="Contenu détaillé..."
            />
          </div>

          <div>
            <Label htmlFor="lienExterne" className="text-slate-300">Lien externe</Label>
            <Input
              id="lienExterne"
              type="url"
              {...register('lienExterne')}
              className={`bg-slate-900/50 border-slate-600 text-slate-100 ${errors.lienExterne ? 'border-red-500' : ''}`}
              placeholder="https://..."
            />
            {errors.lienExterne && <p className="text-red-400 text-sm mt-1">{errors.lienExterne.message}</p>}
          </div>

          <div>
            <ImageUpload
              value={watch('imagePrincipale') || ''}
              onChange={(url) => setValue('imagePrincipale', url)}
              label="Image principale"
            />
          </div>

          <div>
            <Label htmlFor="visibiliteCible" className="text-slate-300">Visibilité</Label>
            <Select
              value={watch('visibiliteCible')}
              onValueChange={(value) => setValue('visibiliteCible', value as ContentFormData['visibiliteCible'])}
            >
              <SelectTrigger id="visibiliteCible" className="bg-slate-900/50 border-slate-600 text-slate-100">
                <SelectValue placeholder="Sélectionner la visibilité" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="PRIVE_BUREAU" className="text-slate-900">Privé Bureau (visible uniquement dans le salon bureau)</SelectItem>
                <SelectItem value="PUBLIC_SITE" className="text-slate-900">Public Site (nécessite approbation du Président)</SelectItem>
              </SelectContent>
            </Select>
            {errors.visibiliteCible && <p className="text-red-400 text-sm mt-1">{errors.visibiliteCible.message}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/bureau/contents')}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={loading} variant="add">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Créer
              </>
            )}
          </Button>
        </div>
      </form>

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
      />
    </>
  );
}
