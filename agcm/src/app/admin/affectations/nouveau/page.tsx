'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MemberPickField, type MemberPickOption } from '@/components/admin/MemberPickField';

const affectationSchema = z.object({
  mandatId: z.string().min(1, 'Le mandat est requis'),
  posteId: z.string().min(1, 'Le poste est requis'),
  memberId: z.string().min(1, 'Le membre est requis'),
  dateDebut: z.string().min(1, 'La date de début est requise'),
  dateFin: z.string().optional(),
});

type AffectationFormData = z.infer<typeof affectationSchema>;

function formatMandatFin(iso: string | undefined) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

/** Styles alignés sur les selects de l’admin (Nouvel utilisateur, etc.) */
const selectAdminClass =
  'mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-primary/30';

export default function NouvelleAffectationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberIdFromQuery = searchParams.get('memberId');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string>('');
  const [mandats, setMandats] = useState<
    { id: string; titre: string; statut: string; dateFin?: string; dateDebut?: string }[]
  >([]);
  const [postes, setPostes] = useState<{ id: string; nom: string; estBureau?: boolean }[]>([]);
  const [members, setMembers] = useState<MemberPickOption[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<AffectationFormData>({
    resolver: zodResolver(affectationSchema),
    defaultValues: {
      dateDebut: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (loadingData || !mandats.length) return;
    const actif = mandats.find((m) => m.statut === 'ACTIF');
    if (actif) setValue('mandatId', actif.id);
  }, [loadingData, mandats, setValue]);

  useEffect(() => {
    if (loadingData || !memberIdFromQuery || !members.length) return;
    if (members.some((m) => m.id === memberIdFromQuery)) {
      setValue('memberId', memberIdFromQuery);
    }
  }, [loadingData, memberIdFromQuery, members, setValue]);

  const fetchData = async () => {
    try {
      const [mandatsRes, postesRes, membersRes] = await Promise.all([
        /** Mandats actifs dont la période n’est pas terminée (pas d’EXPIRE / ARCHIVE / date passée) */
        fetch('/api/super-admin/mandats?limit=100&pourAffectation=1'),
        fetch('/api/super-admin/postes?limit=100'),
        fetch('/api/super-admin/members?limit=100'),
      ]);

      const [mandatsData, postesData, membersData] = await Promise.all([
        mandatsRes.json(),
        postesRes.json(),
        membersRes.json(),
      ]);

      setMandats(mandatsData.data || []);
      setPostes(postesData.data || []);
      setMembers(membersData.data ?? membersData.members ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: AffectationFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/super-admin/affectations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      router.push('/admin/affectations');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="admin-page mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4 animate-in fade-in duration-500">
        <div className="text-center">
          <div
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-guinea-red dark:border-slate-600 dark:border-t-guinea-red"
            aria-hidden
          />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page mx-auto max-w-3xl space-y-8 px-4 pb-12 animate-in fade-in duration-500">
      <div className="admin-glass flex flex-col gap-4 rounded-3xl p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/admin/affectations">
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
              Nouvelle affectation
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Affecter un membre à un poste pour un mandat
            </p>
          </div>
        </div>
      </div>

      {memberIdFromQuery && (
        <p
          role="status"
          className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-slate-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-slate-300"
        >
          Membre présélectionné depuis l’URL : affectez-le à un poste{' '}
          <strong className="text-slate-900 dark:text-slate-100">(Bureau)</strong> si vous placez la personne au bureau
          exécutif.
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40"
        >
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {mandats.length === 0 && !error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-slate-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-slate-300"
        >
          <p>
            Aucun <strong className="text-slate-900 dark:text-slate-100">mandat actif</strong> avec une période encore
            ouverte : on ne peut pas créer d’affectation sur un mandat expiré ou archivé. Créez un mandat ou vérifiez les
            dates dans{' '}
            <Link
              href="/admin/mandats"
              className="font-medium text-amber-900 underline decoration-amber-600/50 underline-offset-2 hover:decoration-amber-700 dark:text-amber-200"
            >
              Mandats
            </Link>
            .
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="admin-panel-form space-y-8">
        <section className="space-y-4">
          <h2 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
            Affectation
          </h2>

          <div>
            <Label htmlFor="mandatId" className="text-slate-700 dark:text-slate-300">
              Mandat *
            </Label>
            <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
              Uniquement les mandats <strong className="font-medium text-slate-700 dark:text-slate-300">actifs</strong>{' '}
              dont la date de fin n’est pas passée.
            </p>
            <select
              id="mandatId"
              {...register('mandatId')}
              className={selectAdminClass}
              disabled={mandats.length === 0}
            >
              <option value="">
                {mandats.length === 0 ? 'Aucun mandat disponible' : 'Sélectionner un mandat'}
              </option>
              {mandats.map((mandat) => (
                <option key={mandat.id} value={mandat.id}>
                  {mandat.titre}
                  {mandat.dateFin ? ` · fin ${formatMandatFin(mandat.dateFin)}` : ''}
                </option>
              ))}
            </select>
            {errors.mandatId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mandatId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="posteId" className="text-slate-700 dark:text-slate-300">
              Poste *
            </Label>
            <select id="posteId" {...register('posteId')} className={selectAdminClass}>
              <option value="">Sélectionner un poste</option>
              {postes.map((poste) => (
                <option key={poste.id} value={poste.id}>
                  {poste.nom} {poste.estBureau ? '(Bureau)' : ''}
                </option>
              ))}
            </select>
            {errors.posteId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.posteId.message}</p>
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
                Date de fin (optionnel)
              </Label>
              <Input id="dateFin" type="date" {...register('dateFin')} />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
          <Link href="/admin/affectations">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading || mandats.length === 0}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Création…' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
