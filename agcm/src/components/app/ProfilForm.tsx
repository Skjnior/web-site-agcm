'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const photoUrlField = z
  .string()
  .optional()
  .refine(
    (val) =>
      !val ||
      val === '' ||
      /^https?:\/\//i.test(val) ||
      (val.startsWith('/') && !val.includes('..')),
    { message: 'URL absolue ou chemin commençant par /' },
  );

const profilSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: photoUrlField,
});

type ProfilFormData = z.infer<typeof profilSchema>;

interface Member {
  id: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  ville: string | null;
  pays: string | null;
  bio: string | null;
  photoUrl: string | null;
  affectations: Array<{
    poste: {
      nom: string;
    };
    mandat: {
      titre: string;
    };
  }>;
}

interface ProfilFormProps {
  member: Member;
  dark?: boolean;
  /** Email du compte (lecture seule) — ex. espace admin */
  userEmail?: string | null;
  /** Upload fichier vers /api/admin/upload-image (ADMIN / SUPER_ADMIN) */
  allowImageUpload?: boolean;
}

export default function ProfilForm({
  member,
  dark = false,
  userEmail,
  allowImageUpload = false,
}: ProfilFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfilFormData>({
    resolver: zodResolver(profilSchema),
    defaultValues: {
      prenom: member.prenom,
      nom: member.nom,
      telephone: member.telephone || '',
      ville: member.ville || '',
      pays: member.pays || '',
      bio: member.bio || '',
      photoUrl: member.photoUrl || '',
    },
  });

  const photoUrlValue = watch('photoUrl');

  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      setError(null);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Échec upload');
      setValue('photoUrl', json.imageUrl, { shouldValidate: true, shouldDirty: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur upload');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ProfilFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/app/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const formClass = dark
    ? 'bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-6'
    : 'bg-white rounded-lg shadow p-6 space-y-6';
  const labelClass = dark ? 'text-slate-300' : 'text-gray-900';
  const inputClass = dark
    ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
    : '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={formClass}>
      {error && (
        <div className={dark ? 'bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl' : 'bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded'}>
          {error}
        </div>
      )}

      {success && (
        <div className={dark ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl' : 'bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded'}>
          Profil mis à jour avec succès !
        </div>
      )}

      {userEmail != null && userEmail !== '' && (
        <section>
          <h2 className={`text-lg font-semibold mb-4 ${dark ? 'text-slate-200' : 'text-gray-900'}`}>Compte</h2>
          <div className={dark ? 'bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3' : 'bg-slate-50 border rounded-lg px-4 py-3'}>
            <p className={`text-xs uppercase tracking-wide mb-1 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>Adresse e-mail</p>
            <p className={dark ? 'text-slate-200 font-medium' : 'text-slate-900 font-medium'}>{userEmail}</p>
            <p className={`text-xs mt-2 ${dark ? 'text-slate-500' : 'text-slate-600'}`}>
              Pour changer l’e-mail de connexion, contactez un super administrateur.
            </p>
          </div>
        </section>
      )}

      {/* Aperçu photo */}
      {(photoUrlValue || member.photoUrl) && (
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-slate-600 shrink-0 bg-slate-800">
            <Image
              src={photoUrlValue || member.photoUrl || ''}
              alt="Aperçu"
              fill
              className="object-cover"
              unoptimized={
                (photoUrlValue || member.photoUrl || '').startsWith('http') ||
                (photoUrlValue || member.photoUrl || '').startsWith('/')
              }
            />
          </div>
          <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            Aperçu de la photo affichée sur le site (bureau, etc.)
          </p>
        </div>
      )}

      {/* Informations personnelles */}
      <section>
        <h2 className={`text-lg font-semibold mb-4 ${dark ? 'text-slate-200' : 'text-gray-900'}`}>Informations personnelles</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prenom" className={labelClass}>Prénom *</Label>
            <Input
              id="prenom"
              {...register('prenom')}
              className={`${errors.prenom ? 'border-red-500' : ''} ${inputClass}`}
            />
            {errors.prenom && (
              <p className="text-red-400 text-sm mt-1">{errors.prenom.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="nom" className={labelClass}>Nom *</Label>
            <Input
              id="nom"
              {...register('nom')}
              className={`${errors.nom ? 'border-red-500' : ''} ${inputClass}`}
            />
            {errors.nom && (
              <p className="text-red-400 text-sm mt-1">{errors.nom.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="telephone" className={labelClass}>Téléphone</Label>
            <Input
              id="telephone"
              {...register('telephone')}
              className={inputClass}
            />
          </div>

          <div>
            <Label htmlFor="ville" className={labelClass}>Ville</Label>
            <Input
              id="ville"
              {...register('ville')}
              className={inputClass}
            />
          </div>

          <div>
            <Label htmlFor="pays" className={labelClass}>Pays</Label>
            <Input
              id="pays"
              {...register('pays')}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2 space-y-3">
            <Label className={labelClass}>Photo de profil</Label>
            {allowImageUpload && (
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handlePhotoFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingPhoto}
                  className={
                    dark
                      ? 'border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700'
                      : ''
                  }
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploadingPhoto ? 'Envoi…' : 'Importer une image'}
                </Button>
                <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                  JPEG, PNG, WebP ou GIF — max 10 Mo
                </span>
              </div>
            )}
            <div>
              <Label htmlFor="photoUrl" className={labelClass}>
                URL de la photo {allowImageUpload && '(ou laisser celle importée ci-dessus)'}
              </Label>
              <Input
                id="photoUrl"
                type="text"
                placeholder="https://… ou /uploads/images/…"
                {...register('photoUrl')}
                className={`${errors.photoUrl ? 'border-red-500' : ''} ${inputClass}`}
              />
            </div>
            {errors.photoUrl && (
              <p className="text-red-400 text-sm mt-1">{errors.photoUrl.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="bio" className={labelClass}>Bio</Label>
          <textarea
            id="bio"
            {...register('bio')}
            rows={4}
            className={`w-full rounded-xl border px-3 py-2 text-sm ${dark ? 'bg-slate-800/50 border-slate-700 text-slate-100' : 'border-input bg-background'}`}
          />
        </div>
      </section>

      {/* Poste actuel */}
      {member.affectations.length > 0 && (
        <section>
          <h2 className={`text-lg font-semibold mb-4 ${dark ? 'text-slate-200' : 'text-gray-900'}`}>Poste actuel</h2>
          <div className={dark ? 'bg-slate-800/50 border border-slate-700 rounded-xl p-4' : 'bg-gray-50 rounded-lg p-4'}>
            <p className={dark ? 'text-slate-200' : 'text-gray-900'}>
              <strong>{member.affectations[0].poste.nom}</strong>
            </p>
            <p className={`text-sm mt-1 ${dark ? 'text-slate-400' : 'text-gray-600'}`}>
              {member.affectations[0].mandat.titre}
            </p>
          </div>
        </section>
      )}

      <div className={`flex items-center justify-end gap-4 pt-4 ${dark ? 'border-t border-slate-700' : 'border-t'}`}>
        <Button
          type="submit"
          disabled={loading}
          className={dark ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer les modifications'
          )}
        </Button>
      </div>
    </form>
  );
}



