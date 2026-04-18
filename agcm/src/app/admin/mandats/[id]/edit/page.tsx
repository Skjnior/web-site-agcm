'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Upload, FileText, X } from 'lucide-react';
import Link from 'next/link';

const mandatUpdateSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  statut: z.enum(['ACTIF', 'EXPIRE', 'ARCHIVE']).optional(),
  pvDocumentUrl: z.string().optional().or(z.literal('')),
});

type MandatFormData = z.infer<typeof mandatUpdateSchema>;

export default function EditMandatPage() {
  const router = useRouter();
  const params = useParams();
  const mandatId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingMandat, setLoadingMandat] = useState(true);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MandatFormData>({
    resolver: zodResolver(mandatUpdateSchema),
  });

  useEffect(() => {
    fetchMandat();
  }, [mandatId]);

  const fetchMandat = async () => {
    try {
      const response = await fetch(`/api/super-admin/mandats/${mandatId}`);
      if (!response.ok) throw new Error('Mandat introuvable');

      const result = await response.json();
      const mandat = result.mandat || result;
      
      // Vérifier si le mandat est passé (date de fin < aujourd'hui)
      const isMandatPasse = new Date(mandat.dateFin) < new Date();
      if (isMandatPasse) {
        setError('Ce mandat est terminé et ne peut plus être modifié. Seuls les mandats présents ou futurs peuvent être modifiés.');
        setLoadingMandat(false);
        return;
      }
      
      setValue('titre', mandat.titre);
      setValue('dateDebut', new Date(mandat.dateDebut).toISOString().split('T')[0]);
      setValue('dateFin', new Date(mandat.dateFin).toISOString().split('T')[0]);
      setValue('statut', mandat.statut);
      setValue('pvDocumentUrl', mandat.pvDocumentUrl || '');
      if (mandat.pvDocumentUrl) {
        // Extraire le nom du fichier de l'URL
        const fileName = mandat.pvDocumentUrl.split('/').pop() || 'Document PV';
        setUploadedFile({ url: mandat.pvDocumentUrl, name: fileName });
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoadingMandat(false);
    }
  };

  const onSubmit = async (data: MandatFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/super-admin/mandats/${mandatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la modification');
      }

      router.push('/admin/mandats');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedFile({ url: data.fileUrl, name: data.fileName });
        setValue('pvDocumentUrl', data.fileUrl);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'upload du fichier');
      }
    } catch (error) {
      alert('Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setValue('pvDocumentUrl', '');
  };

  if (loadingMandat) {
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
        <Link href="/admin/mandats">
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
            Modifier le mandat
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Modifier les informations du mandat</p>
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
            <Label htmlFor="titre">Titre</Label>
            <Input
              id="titre"
              {...register('titre')}
              className={errors.titre ? 'border-red-500' : ''}
            />
            {errors.titre && (
              <p className="text-red-500 text-sm mt-1">{errors.titre.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateDebut">Date de début</Label>
              <Input
                id="dateDebut"
                type="date"
                {...register('dateDebut')}
              />
            </div>

            <div>
              <Label htmlFor="dateFin">Date de fin</Label>
              <Input
                id="dateFin"
                type="date"
                {...register('dateFin')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="statut">Statut</Label>
            <select
              id="statut"
              {...register('statut')}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="ACTIF">Actif</option>
              <option value="EXPIRE">Expiré</option>
              <option value="ARCHIVE">Archivé</option>
            </select>
          </div>

          <div>
            <Label htmlFor="pvDocument">Document PV (optionnel)</Label>
            {!uploadedFile ? (
              <div className="mt-2">
                <label
                  htmlFor="file-upload-edit"
                  className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/80 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                >
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    {uploading ? (
                      <>
                        <div className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Upload en cours...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="mb-2 h-8 w-8 text-slate-400 dark:text-slate-500" />
                        <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">PDF, Word, Excel, PowerPoint (MAX. 50MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    id="file-upload-edit"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  />
                </label>
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-200/80 bg-emerald-50/90 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Fichier uploadé avec succès</p>
                  </div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleRemoveFile} className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40">
                  <X className="mr-1 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            )}
            <input type="hidden" {...register('pvDocumentUrl')} />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <Link href="/admin/mandats">
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

