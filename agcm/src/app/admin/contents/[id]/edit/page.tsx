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
        router.push(`/super-admin/contents/${contentId}`);
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
      <div className="max-w-4xl mx-auto space-y-6 text-gray-900">
        <div className="flex items-center gap-4">
          <Link href={`/super-admin/contents/${contentId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier le contenu</h1>
            <p className="text-gray-600 mt-1">Super Admin : Modifiez tous les aspects du contenu</p>
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
                <SelectTrigger id="type" className="text-gray-900">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="ACTIVITE" className="text-gray-900">Activité</SelectItem>
                  <SelectItem value="ACTUALITE" className="text-gray-900">Actualité</SelectItem>
                  <SelectItem value="PARTAGE" className="text-gray-900">Partage</SelectItem>
                  <SelectItem value="ANNONCE" className="text-gray-900">Annonce</SelectItem>
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
                className={`text-gray-900 ${errors.titre ? 'border-red-500' : ''}`}
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
                className="text-gray-900"
                placeholder="Contenu détaillé..."
              />
            </div>

            <div>
              <Label htmlFor="lienExterne">Lien externe</Label>
              <Input
                id="lienExterne"
                type="url"
                {...register('lienExterne')}
                className={`text-gray-900 ${errors.lienExterne ? 'border-red-500' : ''}`}
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
                <SelectTrigger id="visibiliteCible" className="text-gray-900">
                  <SelectValue placeholder="Sélectionner la visibilité" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="PRIVE_BUREAU" className="text-gray-900">Privé Bureau</SelectItem>
                  <SelectItem value="PUBLIC_SITE" className="text-gray-900">Public Site</SelectItem>
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
                <SelectTrigger id="statutWorkflow" className="text-gray-900">
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="BROUILLON" className="text-gray-900">Brouillon</SelectItem>
                  <SelectItem value="SOUMIS" className="text-gray-900">Soumis</SelectItem>
                  <SelectItem value="APPROUVE" className="text-gray-900">Approuvé</SelectItem>
                  <SelectItem value="PUBLIE" className="text-gray-900">Publié</SelectItem>
                  <SelectItem value="REJETE" className="text-gray-900">Rejeté</SelectItem>
                  <SelectItem value="ARCHIVE" className="text-gray-900">Archivé</SelectItem>
                </SelectContent>
              </Select>
              {errors.statutWorkflow && (
                <p className="text-red-500 text-sm mt-1">{errors.statutWorkflow.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <Link href={`/super-admin/contents/${contentId}`}>
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

