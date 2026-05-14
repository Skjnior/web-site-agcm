'use client';

import { useState, useEffect } from 'react';
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
import {
  BureauAttachmentsManager,
  normalizeContentAttachments,
  type BureauContentAttachmentDraft,
} from '@/components/bureau/BureauAttachmentsManager';

const updateSchema = z.object({
  type: z.enum(['ACTIVITE', 'ACTUALITE', 'PARTAGE', 'ANNONCE']).optional(),
  titre: z.string().min(1, 'Le titre est requis').max(200).optional(),
  contenu: z.string().optional(),
  lienExterne: z.string().url('URL invalide').optional().or(z.literal('')),
  imagePrincipale: z.string().optional().or(z.literal('')),
  visibiliteCible: z.enum(['PRIVE_BUREAU', 'PUBLIC_SITE']).optional(),
});

type ContentFormData = z.infer<typeof updateSchema>;

interface BureauContentEditFormProps {
  contentId: string;
  initialContent: {
    type: string;
    titre: string;
    contenu: string | null;
    lienExterne: string | null;
    imagePrincipale: string | null;
    visibiliteCible: string;
    attachments?: unknown;
  };
}

export default function BureauContentEditForm({ contentId, initialContent }: BureauContentEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<BureauContentAttachmentDraft[]>(() =>
    normalizeContentAttachments(initialContent.attachments)
  );
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ContentFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      type: initialContent.type as ContentFormData['type'],
      titre: initialContent.titre,
      contenu: initialContent.contenu || '',
      lienExterne: initialContent.lienExterne || '',
      imagePrincipale: initialContent.imagePrincipale || '',
      visibiliteCible: initialContent.visibiliteCible as ContentFormData['visibiliteCible'],
    },
  });

  useEffect(() => {
    reset({
      type: initialContent.type as ContentFormData['type'],
      titre: initialContent.titre,
      contenu: initialContent.contenu || '',
      lienExterne: initialContent.lienExterne || '',
      imagePrincipale: initialContent.imagePrincipale || '',
      visibiliteCible: initialContent.visibiliteCible as ContentFormData['visibiliteCible'],
    });
    setAttachments(normalizeContentAttachments(initialContent.attachments));
  }, [initialContent, reset]);

  const onSubmit = async (data: ContentFormData) => {
    setLoading(true);
    try {
      const body: Record<string, unknown> = {};
      if (data.type) body.type = data.type;
      if (data.titre) body.titre = data.titre;
      if (data.contenu !== undefined) body.contenu = data.contenu;
      if (data.lienExterne !== undefined) body.lienExterne = data.lienExterne || null;
      if (data.imagePrincipale !== undefined) body.imagePrincipale = data.imagePrincipale || null;
      if (data.visibiliteCible) body.visibiliteCible = data.visibiliteCible;
      body.attachments = attachments;

      const response = await fetch(`/api/bureau/contents/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la modification');
      }

      setSuccessModal({ isOpen: true, message: 'Contenu modifié avec succès !' });
      setTimeout(() => {
        router.push(`/bureau/contents/${contentId}`);
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      setErrorModal({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Erreur lors de la modification',
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
              <SelectTrigger id="type" className="bg-slate-900/50 border-slate-600 text-slate-100 [&>span]:text-slate-100">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent className="z-[100] border-slate-600 bg-slate-900 text-slate-100">
                <SelectItem value="ACTIVITE">Activité</SelectItem>
                <SelectItem value="ACTUALITE">Actualité</SelectItem>
                <SelectItem value="PARTAGE">Partage</SelectItem>
                <SelectItem value="ANNONCE">Annonce</SelectItem>
              </SelectContent>
            </Select>
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
              hideUrlOption
            />
          </div>

          <BureauAttachmentsManager variant="content" items={attachments} onChange={setAttachments} />

          <div>
            <Label htmlFor="visibiliteCible" className="text-slate-300">Visibilité</Label>
            <Select
              value={watch('visibiliteCible')}
              onValueChange={(value) => setValue('visibiliteCible', value as ContentFormData['visibiliteCible'])}
            >
              <SelectTrigger id="visibiliteCible" className="bg-slate-900/50 border-slate-600 text-slate-100 [&>span]:text-slate-100">
                <SelectValue placeholder="Sélectionner la visibilité" />
              </SelectTrigger>
              <SelectContent className="z-[100] border-slate-600 bg-slate-900 text-slate-100">
                <SelectItem value="PRIVE_BUREAU">Privé bureau</SelectItem>
                <SelectItem value="PUBLIC_SITE">Public (site vitrine)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700/50">
          <Button type="button" variant="outline" onClick={() => router.push(`/bureau/contents/${contentId}`)}>
            Annuler
          </Button>
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
