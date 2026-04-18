'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';

const memberUpdateSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  genre: z.union([z.literal(''), z.enum(['FEMME', 'HOMME', 'AUTRE', 'NE_PAS_DIRE'])]).optional(),
  dateNaissance: z.string().optional(),
  profession: z.string().nullable().optional(),
  adresse: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
  ville: z.string().nullable().optional(),
  pays: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  statutMembre: z.enum(['ACTIF', 'SUSPENDU', 'RADIE']),
});

type MemberFormData = z.infer<typeof memberUpdateSchema>;

interface EditMemberClientProps {
  member: {
    id: string;
    prenom: string;
    nom: string;
    genre: string | null;
    dateNaissance: Date | string | null;
    profession: string | null;
    adresse: string | null;
    telephone: string | null;
    ville: string | null;
    pays: string | null;
    bio: string | null;
    photoUrl: string | null;
    statutMembre: string;
    user: {
      id: string;
      email: string;
      roleSysteme: string;
    };
  };
  currentUserRole: string;
}

export default function EditMemberClient({ member: initialMember, currentUserRole }: EditMemberClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberUpdateSchema),
    defaultValues: {
      prenom: initialMember.prenom,
      nom: initialMember.nom,
      genre: (initialMember.genre as '' | 'FEMME' | 'HOMME' | 'AUTRE' | 'NE_PAS_DIRE') || '',
      dateNaissance: initialMember.dateNaissance
        ? new Date(initialMember.dateNaissance).toISOString().slice(0, 10)
        : '',
      profession: initialMember.profession || '',
      adresse: initialMember.adresse || '',
      telephone: initialMember.telephone || '',
      ville: initialMember.ville || '',
      pays: initialMember.pays || '',
      bio: initialMember.bio || '',
      photoUrl: initialMember.photoUrl || '',
      statutMembre: initialMember.statutMembre as 'ACTIF' | 'SUSPENDU' | 'RADIE',
    },
  });

  const statutMembre = watch('statutMembre');

  const onSubmit = async (data: MemberFormData) => {
    setLoading(true);
    try {
      // Convertir les chaînes vides en null
      const updateData = {
        ...data,
        genre:
          data.genre === 'FEMME' ||
          data.genre === 'HOMME' ||
          data.genre === 'AUTRE' ||
          data.genre === 'NE_PAS_DIRE'
            ? data.genre
            : null,
        dateNaissance: data.dateNaissance?.trim() ? data.dateNaissance : null,
        profession: data.profession?.trim() || null,
        adresse: data.adresse?.trim() || null,
        telephone: data.telephone || null,
        ville: data.ville || null,
        pays: data.pays || null,
        bio: data.bio || null,
        photoUrl: data.photoUrl?.trim() || null,
      };

      const response = await fetch(`/api/admin/membres/${initialMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification');
      }

      setSuccessModal({ isOpen: true, message: 'Membre modifié avec succès' });
      setTimeout(() => {
        router.push(`/admin/membres/${initialMember.id}`);
      }, 1500);
    } catch (error: any) {
      setErrorModal({ isOpen: true, message: error.message || 'Erreur lors de la modification' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6 text-gray-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/admin/membres/${initialMember.id}`}>
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Modifier le membre</h1>
            <p className="mt-1 text-gray-600 dark:text-slate-400">
              {initialMember.prenom} {initialMember.nom}
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input
                    id="prenom"
                    {...register('prenom')}
                  />
                  {errors.prenom && (
                    <p className="text-sm text-red-600 mt-1">{errors.prenom.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    {...register('nom')}
                  />
                  {errors.nom && (
                    <p className="text-sm text-red-600 mt-1">{errors.nom.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <select
                    id="genre"
                    {...register('genre')}
                    className="mt-1.5 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">Non renseigné</option>
                    <option value="FEMME">Femme</option>
                    <option value="HOMME">Homme</option>
                    <option value="AUTRE">Autre</option>
                    <option value="NE_PAS_DIRE">Préfère ne pas dire</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="dateNaissance">Date de naissance</Label>
                  <Input id="dateNaissance" type="date" {...register('dateNaissance')} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="profession">Profession / occupation</Label>
                  <Input id="profession" {...register('profession')} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input id="adresse" {...register('adresse')} />
                </div>
                <div className="col-span-2">
                  <Controller
                    name="photoUrl"
                    control={control}
                    render={({ field }) => (
                      <ImageUpload
                        label="Photo de profil"
                        value={field.value || ''}
                        onChange={field.onChange}
                        hideUrlOption
                        previewClassName="h-40 w-40 max-h-40 object-cover"
                        className="max-w-md"
                      />
                    )}
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Import depuis votre ordinateur (images uniquement).
                  </p>
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    {...register('telephone')}
                  />
                  {errors.telephone && (
                    <p className="text-sm text-red-600 mt-1">{errors.telephone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="ville">Ville</Label>
                  <Input
                    id="ville"
                    {...register('ville')}
                  />
                  {errors.ville && (
                    <p className="text-sm text-red-600 mt-1">{errors.ville.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="pays">Pays</Label>
                  <Input
                    id="pays"
                    {...register('pays')}
                  />
                  {errors.pays && (
                    <p className="text-sm text-red-600 mt-1">{errors.pays.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="statutMembre">Statut *</Label>
                  <Select
                    value={statutMembre}
                    onValueChange={(value) => setValue('statutMembre', value as 'ACTIF' | 'SUSPENDU' | 'RADIE')}
                  >
                    <SelectTrigger className="border-slate-200 bg-white text-gray-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-50 border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100">
                      <SelectItem value="ACTIF">Actif</SelectItem>
                      <SelectItem value="SUSPENDU">Suspendu</SelectItem>
                      <SelectItem value="RADIE">Radié</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.statutMembre && (
                    <p className="text-sm text-red-600 mt-1">{errors.statutMembre.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  rows={4}
                  className="border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
                />
                {errors.bio && (
                  <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations compte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Compte utilisateur</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Email</Label>
                <Input
                  value={initialMember.user.email}
                  disabled
                  className="bg-gray-50 text-slate-900 dark:bg-slate-800/60 dark:text-slate-300"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  L'email ne peut pas être modifié depuis cette page
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Link href={`/admin/membres/${initialMember.id}`}>
              <Button variant="outline" type="button">
                Annuler
              </Button>
            </Link>
            <Button variant="edit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => {
          setSuccessModal({ isOpen: false, message: '' });
          router.push(`/admin/membres/${initialMember.id}`);
        }}
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


