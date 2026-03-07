'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const profilSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url('URL invalide').optional().or(z.literal('')),
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
}

export default function ProfilForm({ member, dark = false }: ProfilFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
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

          <div>
            <Label htmlFor="photoUrl" className={labelClass}>URL Photo</Label>
            <Input
              id="photoUrl"
              type="url"
              {...register('photoUrl')}
              className={`${errors.photoUrl ? 'border-red-500' : ''} ${inputClass}`}
            />
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



