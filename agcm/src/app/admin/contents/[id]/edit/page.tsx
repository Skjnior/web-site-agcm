'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';

const contentUpdateSchema = z.object({
  type: z.enum(['ACTIVITE', 'ACTUALITE', 'PARTAGE', 'ANNONCE']).optional(),
  titre: z.string().min(1, 'Le titre est requis').max(200).optional(),
  contenu: z.string().optional(),
  lienExterne: z.string().url('URL invalide').optional().or(z.literal('')),
  imagePrincipale: z.string().optional().or(z.literal('')), // Accepte URLs et chemins locaux
  visibiliteCible: z.enum(['PRIVE_BUREAU', 'PUBLIC_SITE']).optional(),
  statutWorkflow: z.enum(['BROUILLON', 'SOUMIS', 'APPROUVE', 'PUBLIE', 'REJETE', 'ARCHIVE']).optional(),
  tags: z.array(z.string()).optional(),
});

type ContentFormData = z.infer<typeof contentUpdateSchema>;

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentUpdateSchema),
  });

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/super-admin/contents/${contentId}`);
      if (!response.ok) throw new Error('Contenu introuvable');

      const result = await response.json();
      const content = result.content || result;
      
      setValue('type', content.type);
      setValue('titre', content.titre);
      setValue('contenu', content.contenu || '');
      setValue('lienExterne', content.lienExterne || '');
      setValue('imagePrincipale', content.imagePrincipale || '');
      setValue('visibiliteCible', content.visibiliteCible);
      setValue('statutWorkflow', content.statutWorkflow);
      setValue('tags', content.tags || []);
    } catch (err: any) {
      setErrorModal({ isOpen: true, message: err.message || 'Erreur lors du chargement' });
    } finally {
      setLoadingContent(false);
    }
  };

  const onSubmit = async (data: ContentFormData) => {
    setLoading(true);
    try {
      // Nettoyer les champs vides
      const cleanedData: any = {};
      Object.keys(data).forEach(key => {
        const value = data[key as keyof ContentFormData];
        if (value !== undefined && value !== null && value !== '') {
          cleanedData[key] = value;
        }
      });

      const response = await fetch(`/api/super-admin/contents/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la modification');
      }

      setSuccessModal({ isOpen: true, message: 'Contenu modifié avec succès !' });
      setTimeout(() => {
        router.push(`/admin/contents/${contentId}`);
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setErrorModal({ isOpen: true, message: err.message || 'Erreur lors de la modification' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6 text-slate-100">
        <div className="flex items-center gap-4">
          <Link href={`/admin/contents/${contentId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Modifier le contenu</h1>
            <p className="mt-1 text-slate-400">Super Admin : Modifiez tous les aspects du contenu</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="admin-panel-form">
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Type de contenu</Label>
              <Select
                value={watch('type')}
                onValueChange={(value) => setValue('type', value as any)}
              >
                <SelectTrigger id="type" className="border-slate-600 bg-slate-800/50 text-slate-100">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent className="z-50 border-slate-700 bg-slate-900 text-slate-100">
                  <SelectItem value="ACTIVITE">Activité</SelectItem>
                  <SelectItem value="ACTUALITE">Actualité</SelectItem>
                  <SelectItem value="PARTAGE">Partage</SelectItem>
                  <SelectItem value="ANNONCE">Annonce</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="titre">Titre</Label>
              <Input
                id="titre"
                {...register('titre')}
                className={`border-slate-600 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 ${errors.titre ? 'border-red-500' : ''}`}
                placeholder="Titre du contenu"
              />
              {errors.titre && (
                <p className="text-red-500 text-sm mt-1">{errors.titre.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="contenu">Contenu</Label>
              <Textarea
                id="contenu"
                {...register('contenu')}
                rows={10}
                className="border-slate-600 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                placeholder="Contenu détaillé..."
              />
            </div>

            <div>
              <Label htmlFor="lienExterne">Lien externe</Label>
              <Input
                id="lienExterne"
                type="url"
                {...register('lienExterne')}
                className={`border-slate-600 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 ${errors.lienExterne ? 'border-red-500' : ''}`}
                placeholder="https://..."
              />
              {errors.lienExterne && (
                <p className="text-red-500 text-sm mt-1">{errors.lienExterne.message}</p>
              )}
            </div>

            <div>
              <ImageUpload
                value={watch('imagePrincipale') || ''}
                onChange={(url) => setValue('imagePrincipale', url)}
                label="Image principale"
                hideUrlOption
              />
              {errors.imagePrincipale && (
                <p className="text-red-500 text-sm mt-1">{errors.imagePrincipale.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="visibiliteCible">Visibilité</Label>
              <Select
                value={watch('visibiliteCible')}
                onValueChange={(value) => setValue('visibiliteCible', value as any)}
              >
                <SelectTrigger id="visibiliteCible" className="border-slate-600 bg-slate-800/50 text-slate-100">
                  <SelectValue placeholder="Sélectionner la visibilité" />
                </SelectTrigger>
                <SelectContent className="z-50 border-slate-700 bg-slate-900 text-slate-100">
                  <SelectItem value="PRIVE_BUREAU">Privé Bureau</SelectItem>
                  <SelectItem value="PUBLIC_SITE">Public Site</SelectItem>
                </SelectContent>
              </Select>
              {errors.visibiliteCible && (
                <p className="text-red-500 text-sm mt-1">{errors.visibiliteCible.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="statutWorkflow">Statut workflow</Label>
              <Select
                value={watch('statutWorkflow')}
                onValueChange={(value) => setValue('statutWorkflow', value as any)}
              >
                <SelectTrigger id="statutWorkflow" className="border-slate-600 bg-slate-800/50 text-slate-100">
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent className="z-50 border-slate-700 bg-slate-900 text-slate-100">
                  <SelectItem value="BROUILLON">Brouillon</SelectItem>
                  <SelectItem value="SOUMIS">Soumis</SelectItem>
                  <SelectItem value="APPROUVE">Approuvé</SelectItem>
                  <SelectItem value="PUBLIE">Publié</SelectItem>
                  <SelectItem value="REJETE">Rejeté</SelectItem>
                  <SelectItem value="ARCHIVE">Archivé</SelectItem>
                </SelectContent>
              </Select>
              {errors.statutWorkflow && (
                <p className="text-red-500 text-sm mt-1">{errors.statutWorkflow.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-slate-700 pt-4">
            <Link href={`/admin/contents/${contentId}`}>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={loading} variant="edit">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

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

