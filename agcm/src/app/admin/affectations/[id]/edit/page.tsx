'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { MemberPickField, type MemberPickOption } from '@/components/admin/MemberPickField';

const affectationUpdateSchema = z.object({
  mandatId: z.string().min(1, 'Le mandat est requis'),
  posteId: z.string().min(1, 'Le poste est requis'),
  memberId: z.string().min(1, 'Le membre est requis'),
  dateDebut: z.string().min(1, 'La date de début est requise'),
  dateFin: z.string().optional().nullable(),
  statut: z.enum(['ACTIF', 'INACTIF']).optional(),
  raisonInactivation: z.string().optional().nullable(),
});

type AffectationFormData = z.infer<typeof affectationUpdateSchema>;

export default function EditAffectationPage() {
  const router = useRouter();
  const params = useParams();
  const affectationId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string>('');
  const [mandats, setMandats] = useState<any[]>([]);
  const [postes, setPostes] = useState<any[]>([]);
  const [members, setMembers] = useState<MemberPickOption[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<AffectationFormData>({
    resolver: zodResolver(affectationUpdateSchema),
  });

  useEffect(() => {
    fetchData();
  }, [affectationId]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [affectationRes, mandatsRes, postesRes, membersRes] = await Promise.all([
        fetch(`/api/super-admin/affectations/${affectationId}`),
        fetch('/api/super-admin/mandats?limit=100'),
        fetch('/api/super-admin/postes?limit=100'),
        fetch('/api/super-admin/members?limit=100'),
      ]);

      if (!affectationRes.ok) {
        throw new Error('Affectation introuvable');
      }

      const [affectationData, mandatsData, postesData, membersData] = await Promise.all([
        affectationRes.json(),
        mandatsRes.json(),
        postesRes.json(),
        membersRes.json(),
      ]);

      const affectation = affectationData.affectation;

      // Pré-remplir le formulaire
      setValue('mandatId', affectation.mandatId);
      setValue('posteId', affectation.posteId);
      setValue('memberId', affectation.memberId);
      setValue('dateDebut', new Date(affectation.dateDebut).toISOString().split('T')[0]);
      setValue('dateFin', affectation.dateFin ? new Date(affectation.dateFin).toISOString().split('T')[0] : '');
      setValue('statut', affectation.statut);
      setValue('raisonInactivation', affectation.raisonInactivation || '');

      setMandats(mandatsData.data || []);
      setPostes(postesData.data || []);

      let memberList: MemberPickOption[] = membersData.data ?? membersData.members ?? [];
      const mid = affectation.memberId as string;
      if (mid && !memberList.some((m) => m.id === mid) && affectation.member) {
        const mm = affectation.member as {
          id: string;
          prenom: string;
          nom: string;
          telephone: string | null;
          photoUrl: string | null;
          user: { email: string };
        };
        memberList = [
          {
            id: mm.id,
            prenom: mm.prenom,
            nom: mm.nom,
            email: mm.user.email,
            telephone: mm.telephone,
            photoUrl: mm.photoUrl,
            fullName: `${mm.prenom} ${mm.nom}`,
          },
          ...memberList,
        ];
      }
      setMembers(memberList);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: AffectationFormData) => {
    setLoading(true);
    setError('');

    try {
      const updateData: any = {
        mandatId: data.mandatId,
        posteId: data.posteId,
        memberId: data.memberId,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin || null,
      };

      if (data.statut) {
        updateData.statut = data.statut;
      }

      if (data.raisonInactivation) {
        updateData.raisonInactivation = data.raisonInactivation;
      }

      const response = await fetch(`/api/super-admin/affectations/${affectationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la modification');
      }

      router.push(`/admin/affectations/${affectationId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="admin-page space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
        <div className="admin-glass rounded-2xl p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const selectClass =
    'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';

  return (
    <div className="admin-page mx-auto max-w-3xl space-y-8 px-4 pb-12 text-slate-900 animate-in fade-in duration-500 dark:text-slate-100">
      <div className="admin-glass flex flex-col gap-4 rounded-2xl p-6 shadow-sm sm:flex-row sm:items-center sm:gap-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold text-transparent dark:from-slate-100 dark:to-slate-400">
            Modifier l'affectation
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Modifier les informations de l'affectation</p>
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
            <Label htmlFor="mandatId">Mandat *</Label>
            <select id="mandatId" {...register('mandatId')} className={selectClass}>
              <option value="">Sélectionner un mandat</option>
              {mandats.map((mandat) => (
                <option key={mandat.id} value={mandat.id}>
                  {mandat.titre} ({new Date(mandat.dateDebut).getFullYear()} - {new Date(mandat.dateFin).getFullYear()})
                </option>
              ))}
            </select>
            {errors.mandatId && (
              <p className="text-red-500 text-sm mt-1">{errors.mandatId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="posteId">Poste *</Label>
            <select id="posteId" {...register('posteId')} className={selectClass}>
              <option value="">Sélectionner un poste</option>
              {postes.map((poste) => (
                <option key={poste.id} value={poste.id}>
                  {poste.nom}
                </option>
              ))}
            </select>
            {errors.posteId && (
              <p className="text-red-500 text-sm mt-1">{errors.posteId.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="memberId"
              control={control}
              render={({ field }) => (
                <MemberPickField
                  id="memberId"
                  label="Membre *"
                  members={members}
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.memberId}
                  disabled={loadingData}
                  placeholder="Choisir un membre (photo, email, téléphone)"
                />
              )}
            />
            {errors.memberId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.memberId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <select id="statut" {...register('statut')} className={selectClass}>
              <option value="ACTIF">ACTIF</option>
              <option value="INACTIF">INACTIF</option>
            </select>
          </div>

          <div>
            <Label htmlFor="raisonInactivation">Raison d'inactivation</Label>
            <textarea
              id="raisonInactivation"
              {...register('raisonInactivation')}
              rows={3}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="Raison de l'inactivation (si applicable)"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Annuler
          </Button>
          <Button type="submit" variant="edit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}


