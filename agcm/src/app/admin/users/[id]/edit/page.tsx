'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const userUpdateSchema = z.object({
  // Champs Système
  email: z.string().email('Email invalide').optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional().or(z.literal('')),
  roleSysteme: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEMBER']).optional(),
  isActive: z.boolean().optional(),
  
  // Champs Membre
  prenom: z.string().optional(),
  nom: z.string().optional(),
  telephone: z.string().optional().nullable(),
  ville: z.string().optional().nullable(),
  pays: z.string().optional().nullable(),
  statutMembre: z.enum(['ACTIF', 'INACTIF', 'SUSPENDU', 'RADIE']).optional(),
  genre: z.enum(['FEMME', 'HOMME', 'AUTRE', 'NE_PAS_DIRE', 'NOT_DEFINED']).optional().nullable(),
  dateNaissance: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  adresse: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
});

type UserFormData = z.infer<typeof userUpdateSchema>;

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      isActive: true,
      roleSysteme: 'MEMBER',
      genre: 'NOT_DEFINED',
      statutMembre: 'ACTIF',
    }
  });

  const roleSysteme = watch('roleSysteme');
  const statutMembre = watch('statutMembre');

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/super-admin/users/${userId}`);
      if (!response.ok) throw new Error('Utilisateur introuvable');

      const result = await response.json();
      const user = result.user || result;
      
      // Peupler les champs système
      setValue('email', user.email);
      setValue('roleSysteme', user.roleSysteme);
      setValue('isActive', user.isActive);

      // Peupler les champs membre
      if (user.member) {
        setValue('prenom', user.member.prenom || '');
        setValue('nom', user.member.nom || '');
        setValue('telephone', user.member.telephone || '');
        setValue('ville', user.member.ville || '');
        setValue('pays', user.member.pays || '');
        setValue('statutMembre', user.member.statutMembre);
        setValue('genre', user.member.genre || 'NOT_DEFINED');
        setValue('dateNaissance', user.member.dateNaissance ? new Date(user.member.dateNaissance).toISOString().slice(0, 10) : '');
        setValue('profession', user.member.profession || '');
        setValue('adresse', user.member.adresse || '');
        setValue('bio', user.member.bio || '');
        setValue('photoUrl', user.member.photoUrl || '');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoadingUser(false);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    setError('');

    try {
      const payload: any = {
        email: data.email,
        roleSysteme: data.roleSysteme,
        isActive: data.isActive,
      };

      if (data.password && data.password !== '') {
        payload.password = data.password;
      }

      // Toujours inclure les infos membre si au moins nom/prénom sont remplis
      if (data.nom || data.prenom) {
        payload.member = {
          prenom: data.prenom,
          nom: data.nom,
          telephone: data.telephone || null,
          ville: data.ville || null,
          pays: data.pays || null,
          statutMembre: data.statutMembre,
          genre: data.genre === 'NOT_DEFINED' ? null : data.genre,
          dateNaissance: data.dateNaissance || null,
          profession: data.profession || null,
          adresse: data.adresse || null,
          bio: data.bio || null,
          photoUrl: data.photoUrl || null,
        };
      }

      const response = await fetch(`/api/super-admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la modification');
      }

      router.push('/admin/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="admin-page mx-auto max-w-4xl space-y-6">
        <div className="admin-glass rounded-2xl py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-gray-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="admin-glass flex flex-col gap-4 rounded-3xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/admin/users">
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
              Modifier l&apos;utilisateur
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Gestion complète du compte et du profil</p>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Colonne Gauche: Infos Système */}
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compte Système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={cn(
                      'border-slate-600 bg-slate-800/50 text-slate-100',
                      errors.email && 'border-red-500'
                    )}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Laisser vide pour inchangé"
                    {...register('password')}
                    className="border-slate-600 bg-slate-800/50 text-slate-100"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="roleSysteme">Rôle</Label>
                  <Controller
                    name="roleSysteme"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="border-slate-600 bg-slate-800/50 text-slate-100">
                          <SelectValue placeholder="Sélectionner un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Membre</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Compte actif
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Photo de profil</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="photoUrl"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value || ''}
                      onChange={field.onChange}
                      hideUrlOption
                      className="mx-auto"
                    />
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Colonne Droite: Infos Membre */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input id="prenom" {...register('prenom')} className="border-slate-600 bg-slate-800/50 text-slate-100" />
                  </div>
                  <div>
                    <Label htmlFor="nom">Nom</Label>
                    <Input id="nom" {...register('nom')} className="border-slate-600 bg-slate-800/50 text-slate-100" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Controller
                      name="genre"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || 'NOT_DEFINED'} onValueChange={field.onChange}>
                          <SelectTrigger className="border-slate-600 bg-slate-800/50 text-slate-100">
                            <SelectValue placeholder="Non défini" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NOT_DEFINED">Non défini</SelectItem>
                            <SelectItem value="FEMME">Femme</SelectItem>
                            <SelectItem value="HOMME">Homme</SelectItem>
                            <SelectItem value="AUTRE">Autre</SelectItem>
                            <SelectItem value="NE_PAS_DIRE">Préfère ne pas dire</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateNaissance">Date de naissance</Label>
                    <Input id="dateNaissance" type="date" {...register('dateNaissance')} className="border-slate-600 bg-slate-800/50 text-slate-100" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input id="telephone" {...register('telephone')} className="border-slate-600 bg-slate-800/50 text-slate-100" />
                  </div>
                  <div>
                    <Label htmlFor="statutMembre">Statut Membre</Label>
                    <Controller
                      name="statutMembre"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="border-slate-600 bg-slate-800/50 text-slate-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIF">Actif</SelectItem>
                            <SelectItem value="INACTIF">Inactif</SelectItem>
                            <SelectItem value="SUSPENDU">Suspendu</SelectItem>
                            <SelectItem value="RADIE">Radié</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="profession">Profession</Label>
                  <Input id="profession" {...register('profession')} className="border-slate-600 bg-slate-800/50 text-slate-100" />
                </div>

                <div>
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input id="adresse" {...register('adresse')} className="border-slate-600 bg-slate-800/50 text-slate-100" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="ville">Ville</Label>
                    <Input id="ville" {...register('ville')} className="border-slate-600 bg-slate-800/50 text-slate-100" />
                  </div>
                  <div>
                    <Label htmlFor="pays">Pays</Label>
                    <Input id="pays" {...register('pays')} className="border-slate-600 bg-slate-800/50 text-slate-100" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    {...register('bio')}
                    rows={4}
                    className="border-slate-600 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link href="/admin/users">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="px-8">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
