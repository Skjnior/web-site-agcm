'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Upload, FileText, Users, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MemberPickField, MemberAvatar, type MemberPickOption } from '@/components/admin/MemberPickField';

const mandatSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis'),
  dateDebut: z.string().min(1, 'La date de début est requise'),
  dateFin: z.string().min(1, 'La date de fin est requise'),
  pvDocumentUrl: z.string().optional(),
});

type MandatFormData = z.infer<typeof mandatSchema>;


interface Poste {
  id: string;
  nom: string;
  description: string | null;
}

interface BureauAffectation {
  memberId: string;
  posteId: string;
}

const selectAdminClass =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-primary/30';

export default function NouveauMandatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null);
  const [members, setMembers] = useState<MemberPickOption[]>([]);
  const [postes, setPostes] = useState<Poste[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingPostes, setLoadingPostes] = useState(true);
  const [bureauAffectations, setBureauAffectations] = useState<BureauAffectation[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MandatFormData>({
    resolver: zodResolver(mandatSchema),
  });

  useEffect(() => {
    fetchMembers();
    fetchPostes();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await fetch('/api/super-admin/members');
      if (response.ok) {
        const data = await response.json();
        setMembers(data.data ?? data.members ?? []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchPostes = async () => {
    try {
      setLoadingPostes(true);
      const response = await fetch('/api/super-admin/postes/list');
      if (response.ok) {
        const data = await response.json();
        setPostes(data.postes || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des postes:', error);
    } finally {
      setLoadingPostes(false);
    }
  };

  const addBureauAffectation = () => {
    setBureauAffectations([...bureauAffectations, { memberId: '', posteId: '' }]);
  };

  const removeBureauAffectation = (index: number) => {
    setBureauAffectations(bureauAffectations.filter((_, i) => i !== index));
  };

  const updateBureauAffectation = (index: number, field: 'memberId' | 'posteId', value: string) => {
    const updated = [...bureauAffectations];
    
    // Si on change le membre, vérifier qu'il n'est pas déjà utilisé dans une autre affectation
    if (field === 'memberId' && value) {
      const duplicateIndex = updated.findIndex(
        (aff, i) => i !== index && aff.memberId === value
      );
      if (duplicateIndex !== -1) {
        alert('Ce membre a déjà un poste dans ce mandat. Un membre ne peut avoir qu\'un seul poste par mandat.');
        return;
      }
    }
    
    updated[index] = { ...updated[index], [field]: value };
    setBureauAffectations(updated);
  };

  // Obtenir les membres disponibles (non déjà affectés)
  const getAvailableMembers = (index: number) => {
    return members.filter(
      (m) =>
        !bureauAffectations.some(
          (aff, i) => i !== index && aff.memberId === m.id
        )
    );
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

  const onSubmit = async (data: MandatFormData) => {
    setLoading(true);
    setError('');

    try {
      // Valider les affectations
      const validAffectations = bureauAffectations.filter(
        (aff) => aff.memberId && aff.posteId
      );

      // Vérifier qu'aucun membre n'a deux postes
      const memberIds = validAffectations.map((aff) => aff.memberId);
      const uniqueMemberIds = new Set(memberIds);
      if (memberIds.length !== uniqueMemberIds.size) {
        setError('Un membre ne peut avoir qu\'un seul poste dans le même mandat. Veuillez corriger les affectations.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/super-admin/mandats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          affectations: validAffectations,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      router.push('/admin/mandats');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page mx-auto max-w-3xl space-y-8 px-4 pb-12 animate-in fade-in duration-500">
      <div className="admin-glass flex flex-col gap-4 rounded-3xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/admin/mandats">
            <Button
              variant="outline"
              size="sm"
              className="w-fit border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
              Nouveau mandat
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Créer un nouveau mandat</p>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40"
        >
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="admin-panel-form space-y-8">
        <section className="space-y-4">
          <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
            Informations générales
          </h2>
          <div>
            <Label htmlFor="titre" className="text-slate-700 dark:text-slate-300">
              Titre *
            </Label>
            <Input
              id="titre"
              {...register('titre')}
              placeholder="Ex: Mandat 2025-2027"
              className={cn(errors.titre && 'border-red-500 dark:border-red-500')}
            />
            {errors.titre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.titre.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dateDebut" className="text-slate-700 dark:text-slate-300">
                Date de début *
              </Label>
              <Input
                id="dateDebut"
                type="date"
                {...register('dateDebut')}
                className={cn(errors.dateDebut && 'border-red-500 dark:border-red-500')}
              />
              {errors.dateDebut && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateDebut.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dateFin" className="text-slate-700 dark:text-slate-300">
                Date de fin *
              </Label>
              <Input
                id="dateFin"
                type="date"
                {...register('dateFin')}
                className={cn(errors.dateFin && 'border-red-500 dark:border-red-500')}
              />
              {errors.dateFin && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateFin.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="pvDocument" className="text-slate-700 dark:text-slate-300">
              Document PV (optionnel)
            </Label>
            {!uploadedFile ? (
              <div className="mt-2">
                <label
                  htmlFor="file-upload"
                  className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/80 transition-colors hover:bg-slate-100/90 dark:border-slate-600 dark:bg-slate-800/40 dark:hover:bg-slate-800/70"
                >
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    {uploading ? (
                      <>
                        <div
                          className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-guinea-red dark:border-slate-600 dark:border-t-guinea-red"
                          aria-hidden
                        />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Upload en cours…</p>
                      </>
                    ) : (
                      <>
                        <Upload className="mb-2 h-8 w-8 text-slate-400 dark:text-slate-500" />
                        <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Cliquez pour uploader</span>{' '}
                          ou glissez-déposez
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          PDF, Word, Excel, PowerPoint (MAX. 50MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                  />
                </label>
              </div>
            ) : (
              <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/35">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Fichier uploadé avec succès</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800/60 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                >
                  <X className="mr-1 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            )}
            <input type="hidden" {...register('pvDocumentUrl')} />
          </div>
        </section>

        <section className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-700">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bureau exécutif</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBureauAffectation}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800/60 dark:text-blue-300 dark:hover:bg-blue-950/40"
            >
              <Plus className="mr-1 h-4 w-4" />
              Ajouter un membre
            </Button>
          </div>

          {loadingMembers || loadingPostes ? (
            <div className="py-8 text-center">
              <div
                className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-guinea-red dark:border-slate-600 dark:border-t-guinea-red"
                aria-hidden
              />
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Chargement…</p>
            </div>
          ) : bureauAffectations.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-center dark:border-slate-600 dark:bg-slate-800/40">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Aucun membre du bureau ajouté. Cliquez sur « Ajouter un membre » pour commencer.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bureauAffectations.map((affectation, index) => {
                const selectedMember = members.find((m) => m.id === affectation.memberId);
                const selectedPoste = postes.find((p) => p.id === affectation.posteId);

                return (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/35"
                  >
                    <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
                      <div className="min-w-0 flex-1">
                        <MemberPickField
                          id={`member-${index}`}
                          label="Membre *"
                          members={getAvailableMembers(index)}
                          value={affectation.memberId}
                          onChange={(id) => updateBureauAffectation(index, 'memberId', id)}
                          disabled={loadingMembers || loadingPostes}
                          placeholder="Choisir un membre"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Label htmlFor={`poste-${index}`} className="text-slate-700 dark:text-slate-300">
                          Poste *
                        </Label>
                        <select
                          id={`poste-${index}`}
                          value={affectation.posteId}
                          onChange={(e) => updateBureauAffectation(index, 'posteId', e.target.value)}
                          className={selectAdminClass}
                        >
                          <option value="">Sélectionner un poste</option>
                          {postes.map((poste) => (
                            <option key={poste.id} value={poste.id}>
                              {poste.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBureauAffectation(index)}
                        className="shrink-0 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800/60 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedMember && selectedPoste && (
                      <div className="mt-3 flex flex-col gap-2 rounded border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <MemberAvatar member={selectedMember} className="h-12 w-12 text-sm" />
                          <div className="min-w-0 text-sm">
                            <p className="font-medium text-slate-900 dark:text-slate-100">{selectedMember.fullName}</p>
                            <p className="truncate text-slate-600 dark:text-slate-400">{selectedMember.email}</p>
                            <p className="text-slate-600 dark:text-slate-400">
                              {selectedMember.telephone?.trim() || 'Téléphone non renseigné'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-right">
                          → poste <span className="font-medium text-slate-900 dark:text-slate-100">{selectedPoste.nom}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
          <Link href="/admin/mandats">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Création…' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
}

