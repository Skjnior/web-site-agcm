'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Info, Save } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/ui/image-upload';

const userSchema = z
  .object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    roleSysteme: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEMBER']),
    prenom: z.string().min(1, 'Le prénom est requis'),
    nom: z.string().min(1, 'Le nom est requis'),
    genre: z.union([z.literal(''), z.enum(['FEMME', 'HOMME', 'AUTRE', 'NE_PAS_DIRE'])]).optional(),
    dateNaissance: z.string().optional(),
    profession: z.string().optional(),
    adresse: z.string().optional(),
    telephone: z.string().optional(),
    ville: z.string().optional(),
    pays: z.string().optional(),
    bio: z.string().optional(),
    photoUrl: z.string().optional(),
  })
  .refine(
    (d) =>
      !d.photoUrl?.trim() ||
      /^https?:\/\/.+/i.test(d.photoUrl.trim()) ||
      /^\/uploads\//.test(d.photoUrl.trim()),
    {
      message: 'Image : URL https valide ou fichier uploadé sur le serveur',
      path: ['photoUrl'],
    }
  );

type UserFormData = z.infer<typeof userSchema>;

export default function NouvelUtilisateurPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      genre: '',
      roleSysteme: 'MEMBER',
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    setError('');

    const payload: Record<string, unknown> = {
      email: data.email.trim(),
      password: data.password,
      roleSysteme: data.roleSysteme,
      prenom: data.prenom.trim(),
      nom: data.nom.trim(),
      telephone: data.telephone?.trim() || undefined,
      ville: data.ville?.trim() || undefined,
      pays: data.pays?.trim() || undefined,
      bio: data.bio?.trim() || undefined,
      profession: data.profession?.trim() || undefined,
      adresse: data.adresse?.trim() || undefined,
      photoUrl: data.photoUrl?.trim() || undefined,
    };

    if (
      data.genre === 'FEMME' ||
      data.genre === 'HOMME' ||
      data.genre === 'AUTRE' ||
      data.genre === 'NE_PAS_DIRE'
    ) {
      payload.genre = data.genre;
    }
    if (data.dateNaissance?.trim()) {
      payload.dateNaissance = data.dateNaissance.trim();
    }

    try {
      const response = await fetch('/api/super-admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      router.push('/admin/users');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page mx-auto max-w-4xl space-y-8 animate-in fade-in duration-500">
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
              Nouvel utilisateur
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Compte de connexion + fiche membre (identité, coordonnées, photo)
            </p>
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

      <div
        role="note"
        className="flex gap-3 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-slate-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-slate-300"
      >
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
        <div className="space-y-2">
          <p>
            Tout nouvel adhérent avec rôle <strong className="text-slate-900 dark:text-slate-100">Membre</strong> suit
            le même formulaire. Pour en faire un <strong className="text-slate-900 dark:text-slate-100">membre du bureau</strong>
            , après enregistrement ouvrez <strong>Affectations</strong> → <strong>Nouvelle affectation</strong> et choisissez
            un poste marqué <strong>(Bureau)</strong> sur le mandat actif. Vous pouvez aussi passer l’URL{' '}
            <code className="rounded bg-amber-100/80 px-1 font-mono text-xs dark:bg-slate-800">
              /admin/affectations/nouveau?memberId=…
            </code>{' '}
            pour préremplir la fiche.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="admin-panel-form space-y-8">
        <section className="space-y-4">
          <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
            Compte
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@agcm.gn"
                {...register('email')}
                className={cn(errors.email && 'border-red-500 dark:border-red-500')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                Mot de passe *
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={cn(errors.password && 'border-red-500 dark:border-red-500')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="roleSysteme" className="text-slate-700 dark:text-slate-300">
                Rôle système *
              </Label>
              <select
                id="roleSysteme"
                {...register('roleSysteme')}
                className="mt-1.5 w-full max-w-md rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-primary/30"
              >
                <option value="MEMBER">Membre</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
            Identité
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="prenom" className="text-slate-700 dark:text-slate-300">
                Prénom *
              </Label>
              <Input
                id="prenom"
                {...register('prenom')}
                className={cn(errors.prenom && 'border-red-500 dark:border-red-500')}
              />
              {errors.prenom && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prenom.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="nom" className="text-slate-700 dark:text-slate-300">
                Nom *
              </Label>
              <Input
                id="nom"
                {...register('nom')}
                className={cn(errors.nom && 'border-red-500 dark:border-red-500')}
              />
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nom.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="genre" className="text-slate-700 dark:text-slate-300">
                Genre
              </Label>
              <select
                id="genre"
                {...register('genre')}
                className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-primary/30"
              >
                <option value="">Non renseigné</option>
                <option value="FEMME">Femme</option>
                <option value="HOMME">Homme</option>
                <option value="AUTRE">Autre</option>
                <option value="NE_PAS_DIRE">Préfère ne pas dire</option>
              </select>
            </div>

            <div>
              <Label htmlFor="dateNaissance" className="text-slate-700 dark:text-slate-300">
                Date de naissance
              </Label>
              <Input id="dateNaissance" type="date" {...register('dateNaissance')} />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="profession" className="text-slate-700 dark:text-slate-300">
                Profession / occupation
              </Label>
              <Input id="profession" placeholder="Ex. : étudiant, médecin…" {...register('profession')} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
            Coordonnées
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="telephone" className="text-slate-700 dark:text-slate-300">
                Téléphone
              </Label>
              <Input id="telephone" type="tel" {...register('telephone')} />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="adresse" className="text-slate-700 dark:text-slate-300">
                Adresse
              </Label>
              <Input id="adresse" placeholder="Rue, quartier…" {...register('adresse')} />
            </div>

            <div>
              <Label htmlFor="ville" className="text-slate-700 dark:text-slate-300">
                Ville
              </Label>
              <Input id="ville" {...register('ville')} />
            </div>

            <div>
              <Label htmlFor="pays" className="text-slate-700 dark:text-slate-300">
                Pays
              </Label>
              <Input id="pays" placeholder="Guinée" {...register('pays')} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
            Photo & présentation
          </h2>
          <div className="space-y-4">
            <div>
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
                Choisissez une image sur votre ordinateur (JPEG, PNG, WebP, GIF). Elle est enregistrée sur le serveur de
                l’association. Vous pourrez la modifier dans la fiche membre.
              </p>
              {errors.photoUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.photoUrl.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300">
                Biographie / présentation
              </Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Quelques lignes sur le membre, ses engagements…"
                {...register('bio')}
                className="border-slate-300 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
          <Link href="/admin/users">
            <Button type="button" variant="outline" className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Création...' : 'Créer le compte'}
          </Button>
        </div>
      </form>
    </div>
  );
}
