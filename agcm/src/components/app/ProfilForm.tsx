'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';

/** Photo : uniquement via import (valeur = URL absolue ou /uploads/…) */
const photoUrlField = z
  .string()
  .optional()
  .refine(
    (val) =>
      !val ||
      val === '' ||
      /^https?:\/\//i.test(val) ||
      (val.startsWith('/') && !val.includes('..')),
    { message: 'Image invalide' },
  );

const profilSchemaBase = z.object({
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: photoUrlField,
});

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Saisissez votre mot de passe actuel'),
    newPassword: z.string().min(8, 'Au moins 8 caractères'),
    confirmNewPassword: z.string().min(1, 'Confirmez le nouveau mot de passe'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmNewPassword'],
  });

type ProfilFormData = z.infer<typeof profilSchemaBase> & { email?: string };

interface Member {
  id: string;
  userId?: string | null;
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
  /** Si défini, force l’apparence (ex. espace membre toujours sombre). Sinon suit le thème (Clair / Sombre / Système). */
  dark?: boolean;
  /** Email du compte affiché / éditable selon `allowEmailEdit` */
  userEmail?: string | null;
  /** Bureau, admin, super-admin : compte lié → modification de l’e-mail de connexion autorisée */
  allowEmailEdit?: boolean;
  /** Upload fichier vers /api/admin/upload-image (admin et membres du bureau) */
  allowImageUpload?: boolean;
}

export default function ProfilForm({
  member,
  dark,
  userEmail,
  allowEmailEdit = false,
  allowImageUpload = true,
}: ProfilFormProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark =
    dark ?? (mounted ? resolvedTheme === 'dark' : false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: 'Impossible d’enregistrer',
    message: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdFieldErrors, setPwdFieldErrors] = useState<Record<string, string>>({});

  const profilSchema = useMemo(
    () =>
      allowEmailEdit
        ? profilSchemaBase.extend({
            email: z.string().email('Adresse e-mail invalide'),
          })
        : profilSchemaBase,
    [allowEmailEdit],
  );

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
      ...(allowEmailEdit ? { email: (userEmail || '').trim() } : {}),
    },
  });

  const photoUrlValue = watch('photoUrl');

  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      setErrorModal((m) => ({ ...m, isOpen: false }));
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Échec upload');
      setValue('photoUrl', json.imageUrl, { shouldValidate: true, shouldDirty: true });
      setSuccessModal({
        isOpen: true,
        title: 'Photo ajoutée',
        message:
          'L’image a bien été envoyée. N’oubliez pas de cliquer sur « Enregistrer les modifications » en bas du formulaire pour sauvegarder votre profil.',
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : '';
      setErrorModal({
        isOpen: true,
        title: 'Envoi de la photo impossible',
        message:
          detail && detail.length > 0
            ? `${detail}\n\nSi le problème continue, vérifiez le format (JPEG, PNG, WebP ou GIF) et la taille (maximum 10 Mo).`
            : 'Vérifiez que le fichier est bien une image (JPEG, PNG, WebP ou GIF), qu’il ne dépasse pas 10 Mo, puis réessayez.',
      });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submitPasswordChange = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorModal((m) => ({ ...m, isOpen: false }));
    setSuccessModal((m) => ({ ...m, isOpen: false }));
    setPwdFieldErrors({});

    const parsed = passwordChangeSchema.safeParse({
      currentPassword: pwdCurrent,
      newPassword: pwdNew,
      confirmNewPassword: pwdConfirm,
    });

    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0];
        if (typeof k === 'string' && !fe[k]) fe[k] = issue.message;
      }
      setPwdFieldErrors(fe);
      return;
    }

    try {
      setPwdLoading(true);
      const res = await fetch('/api/app/changer-mot-de-passe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof json.error === 'string' ? json.error : 'Échec du changement de mot de passe');
      }
      setSuccessModal({
        isOpen: true,
        title: 'Mot de passe modifié',
        message:
          'Votre mot de passe a bien été mis à jour. Utilisez-le dès votre prochaine connexion à l’espace membre ou à l’administration.',
      });
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur inattendue s’est produite.';
      setErrorModal({
        isOpen: true,
        title: 'Changement de mot de passe refusé',
        message:
          /incorrect|réinitial|connexion|autoris|compte n’/i.test(msg) || msg.length < 120
            ? msg
            : `${msg}\n\nEn cas de doute, utilisez « Mot de passe oublié » sur la page de connexion ou contactez un administrateur.`,
      });
    } finally {
      setPwdLoading(false);
    }
  };

  const onSubmit = async (data: ProfilFormData) => {
    try {
      setLoading(true);
      setErrorModal((m) => ({ ...m, isOpen: false }));

      const response = await fetch('/api/app/profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const serverMsg = typeof result.error === 'string' ? result.error : null;
        throw new Error(
          serverMsg ||
            (response.status === 401 || response.status === 403
              ? 'Vous n’êtes plus autorisé à modifier ce profil. Déconnectez-vous puis reconnectez-vous.'
              : 'Le serveur n’a pas pu enregistrer vos informations.'),
        );
      }

      const emailChanged = result.emailChanged === true;

      setSuccessModal({
        isOpen: true,
        title: 'Profil enregistré',
        message: emailChanged
          ? 'Vos informations ont bien été mises à jour. Votre adresse e-mail de connexion a été modifiée : utilisez la nouvelle adresse lors de vos prochaines connexions (votre session actuelle reste valide). Les informations affichées sur le site (bureau, etc.) sont à jour.'
          : 'Vos modifications ont bien été prises en compte. Les informations affichées sur le site (page bureau, annuaire, etc.) reflètent désormais votre profil.',
      });
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur inattendue s’est produite.';
      const network =
        msg === 'Failed to fetch' ||
        msg.includes('NetworkError') ||
        msg.includes('network');
      setErrorModal({
        isOpen: true,
        title: 'Enregistrement impossible',
        message: network
          ? 'Connexion au serveur impossible. Vérifiez votre réseau internet, puis réessayez. Si le problème continue, contactez l’administration.'
          : `${msg}\n\nSi le problème persiste, vous pouvez réessayer plus tard ou demander de l’aide à un administrateur.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const formClass = isDark
    ? 'bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-6'
    : 'bg-white rounded-lg shadow p-6 space-y-6 dark:bg-slate-900 dark:shadow-none';
  const labelClass = isDark ? 'text-slate-300' : 'text-gray-900 dark:text-slate-200';
  const inputClass = isDark
    ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
    : 'dark:bg-slate-800/50 dark:border-slate-600 dark:text-slate-100';

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className={formClass}>
      {allowEmailEdit && (
        <section>
          <h2 className={`mb-4 text-lg font-semibold ${isDark ? 'text-slate-200' : 'text-gray-900 dark:text-slate-100'}`}>Compte</h2>
          <div className={isDark ? 'rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-4 space-y-3' : 'rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 space-y-3 dark:border-slate-700 dark:bg-slate-800/40'}>
            <div>
              <Label htmlFor="email" className={labelClass}>
                Adresse e-mail (connexion) *
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={`mt-1 ${errors.email ? 'border-red-500' : ''} ${inputClass}`}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
              Cette adresse sert à vous connecter à l’espace membre et à l’administration. Elle doit être unique. Après un changement, utilisez la nouvelle adresse aux prochaines connexions.
            </p>
          </div>
        </section>
      )}

      {!allowEmailEdit && userEmail != null && userEmail !== '' && (
        <section>
          <h2 className={`mb-4 text-lg font-semibold ${isDark ? 'text-slate-200' : 'text-gray-900 dark:text-slate-100'}`}>Compte</h2>
          <div className={isDark ? 'rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3' : 'rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/40'}>
            <p className={`mb-1 text-xs uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Adresse e-mail</p>
            <p className={isDark ? 'font-medium text-slate-200' : 'font-medium text-slate-900 dark:text-slate-100'}>{userEmail}</p>
            <p className={`mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
              La modification de l’e-mail de connexion est réservée aux comptes liés à un utilisateur. Contactez un administrateur en cas de besoin.
            </p>
          </div>
        </section>
      )}

      {/* Mot de passe */}
      <section>
        <h2 className={`mb-4 text-lg font-semibold ${isDark ? 'text-slate-200' : 'text-gray-900 dark:text-slate-100'}`}>
          Mot de passe
        </h2>
        <div
          className={isDark ? 'rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 space-y-4' : 'rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4 dark:border-slate-700 dark:bg-slate-800/40'}
        >
          <div>
            <Label htmlFor="currentPassword" className={labelClass}>
              Mot de passe actuel
            </Label>
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              value={pwdCurrent}
              onChange={(e) => setPwdCurrent(e.target.value)}
              className={`${inputClass} mt-1`}
            />
            {pwdFieldErrors.currentPassword && (
              <p className="text-red-400 text-sm mt-1">{pwdFieldErrors.currentPassword}</p>
            )}
          </div>
          <div>
            <Label htmlFor="newPassword" className={labelClass}>
              Nouveau mot de passe
            </Label>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              value={pwdNew}
              onChange={(e) => setPwdNew(e.target.value)}
              className={`${inputClass} mt-1`}
            />
            {pwdFieldErrors.newPassword && (
              <p className="text-red-400 text-sm mt-1">{pwdFieldErrors.newPassword}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmNewPassword" className={labelClass}>
              Confirmer le nouveau mot de passe
            </Label>
            <PasswordInput
              id="confirmNewPassword"
              autoComplete="new-password"
              value={pwdConfirm}
              onChange={(e) => setPwdConfirm(e.target.value)}
              className={`${inputClass} mt-1`}
            />
            {pwdFieldErrors.confirmNewPassword && (
              <p className="text-red-400 text-sm mt-1">{pwdFieldErrors.confirmNewPassword}</p>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={pwdLoading}
            className={isDark ? 'border-slate-600' : ''}
            onClick={() => void submitPasswordChange()}
          >
            {pwdLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement…
              </>
            ) : (
              'Mettre à jour le mot de passe'
            )}
          </Button>
        </div>
      </section>

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
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>
            Aperçu de la photo affichée sur le site (bureau, etc.)
          </p>
        </div>
      )}

      {/* Informations personnelles */}
      <section>
        <h2 className={`mb-4 text-lg font-semibold ${isDark ? 'text-slate-200' : 'text-gray-900 dark:text-slate-100'}`}>Informations personnelles</h2>
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
                    isDark
                      ? 'border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700'
                      : 'dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-200'
                  }
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {uploadingPhoto ? 'Envoi…' : 'Choisir un fichier image'}
                </Button>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  JPEG, PNG, WebP ou GIF — max 10 Mo (fichier sur le serveur, pas de lien à coller)
                </span>
              </div>
            )}
            {!allowImageUpload && (
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                L’import de photo n’est pas disponible depuis cet espace.
              </p>
            )}
            <input type="hidden" {...register('photoUrl')} />
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
            className={`w-full rounded-xl border px-3 py-2 text-sm ${isDark ? 'border-slate-700 bg-slate-800/50 text-slate-100' : 'border-input bg-background dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100'}`}
          />
        </div>
      </section>

      {/* Poste actuel */}
      {member.affectations.length > 0 && (
        <section>
          <h2 className={`mb-4 text-lg font-semibold ${isDark ? 'text-slate-200' : 'text-gray-900 dark:text-slate-100'}`}>Poste actuel</h2>
          <div className={isDark ? 'rounded-xl border border-slate-700 bg-slate-800/50 p-4' : 'rounded-lg bg-gray-50 p-4 dark:bg-slate-800/50 dark:text-slate-100'}>
            <p className={isDark ? 'text-slate-200' : 'text-gray-900 dark:text-slate-100'}>
              <strong>{member.affectations[0].poste.nom}</strong>
            </p>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600 dark:text-slate-400'}`}>
              {member.affectations[0].mandat.titre}
            </p>
          </div>
        </section>
      )}

      <div className={`flex items-center justify-end gap-4 pt-4 ${isDark ? 'border-t border-slate-700' : 'border-t border-slate-200 dark:border-slate-700'}`}>
        <Button
          type="submit"
          disabled={loading}
          className={isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700'}
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

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((s) => ({ ...s, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal((e) => ({ ...e, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
      />
    </>
  );
}



