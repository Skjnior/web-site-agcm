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
import { Badge } from '@/components/ui/badge';

const mandatSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis'),
  dateDebut: z.string().min(1, 'La date de début est requise'),
  dateFin: z.string().min(1, 'La date de fin est requise'),
  pvDocumentUrl: z.string().optional(),
});

type MandatFormData = z.infer<typeof mandatSchema>;

interface Member {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  fullName: string;
}

interface Poste {
  id: string;
  nom: string;
  description: string | null;
}

interface BureauAffectation {
  memberId: string;
  posteId: string;
}

export default function NouveauMandatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
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
        setMembers(data.members || []);
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
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center gap-4">
        <Link href="/admin/mandats">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau mandat</h1>
          <p className="text-gray-600 mt-1">Créer un nouveau mandat</p>
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
            <Label htmlFor="titre">Titre *</Label>
            <Input
              id="titre"
              {...register('titre')}
              placeholder="Ex: Mandat 2025-2027"
              className={errors.titre ? 'border-red-500' : ''}
            />
            {errors.titre && (
              <p className="text-red-500 text-sm mt-1">{errors.titre.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateDebut">Date de début *</Label>
              <Input
                id="dateDebut"
                type="date"
                {...register('dateDebut')}
                className={errors.dateDebut ? 'border-red-500' : ''}
              />
              {errors.dateDebut && (
                <p className="text-red-500 text-sm mt-1">{errors.dateDebut.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dateFin">Date de fin *</Label>
              <Input
                id="dateFin"
                type="date"
                {...register('dateFin')}
                className={errors.dateFin ? 'border-red-500' : ''}
              />
              {errors.dateFin && (
                <p className="text-red-500 text-sm mt-1">{errors.dateFin.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="pvDocument">Document PV (optionnel)</Label>
            {!uploadedFile ? (
              <div className="mt-2">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guinea-red mb-2"></div>
                        <p className="text-sm text-gray-500">Upload en cours...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500">PDF, Word, Excel, PowerPoint (MAX. 50MB)</p>
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
              <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">Fichier uploadé avec succès</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            )}
            <input type="hidden" {...register('pvDocumentUrl')} />
          </div>
        </div>

        {/* Section Bureau Exécutif */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Bureau Exécutif</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBureauAffectation}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter un membre
            </Button>
          </div>

          {loadingMembers || loadingPostes ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-guinea-red mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Chargement...</p>
            </div>
          ) : bureauAffectations.length === 0 ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                Aucun membre du bureau ajouté. Cliquez sur "Ajouter un membre" pour commencer.
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
                    className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <Label htmlFor={`member-${index}`}>Membre *</Label>
                        <select
                          id={`member-${index}`}
                          value={affectation.memberId}
                          onChange={(e) =>
                            updateBureauAffectation(index, 'memberId', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red mt-1"
                        >
                          <option value="">Sélectionner un membre</option>
                          {getAvailableMembers(index).map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.fullName} ({member.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={`poste-${index}`}>Poste *</Label>
                        <select
                          id={`poste-${index}`}
                          value={affectation.posteId}
                          onChange={(e) =>
                            updateBureauAffectation(index, 'posteId', e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red mt-1"
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
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-400 hover:border-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedMember && selectedPoste && (
                      <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{selectedMember.fullName}</span> sera affecté au poste de{' '}
                          <span className="font-medium">{selectedPoste.nom}</span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/mandats">
            <Button type="button" variant="outline">Annuler</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
}

