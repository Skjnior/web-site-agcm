'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const affectationSchema = z.object({
  mandatId: z.string().min(1, 'Le mandat est requis'),
  posteId: z.string().min(1, 'Le poste est requis'),
  memberId: z.string().min(1, 'Le membre est requis'),
  dateDebut: z.string().min(1, 'La date de début est requise'),
  dateFin: z.string().optional(),
});

type AffectationFormData = z.infer<typeof affectationSchema>;

export default function NouvelleAffectationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string>('');
  const [mandats, setMandats] = useState<any[]>([]);
  const [postes, setPostes] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AffectationFormData>({
    resolver: zodResolver(affectationSchema),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mandatsRes, postesRes, membersRes] = await Promise.all([
        fetch('/api/super-admin/mandats?limit=100'),
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
      setMembers(membersData.data || []);
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
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-gray-900">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guinea-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-gray-900">
      <div className="flex items-center gap-4">
        <Link href="/admin/affectations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle affectation</h1>
          <p className="text-gray-600 mt-1">Affecter un membre à un poste pour un mandat</p>
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
            <Label htmlFor="mandatId">Mandat *</Label>
            <select
              id="mandatId"
              {...register('mandatId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red"
            >
              <option value="">Sélectionner un mandat</option>
              {mandats.map((mandat) => (
                <option key={mandat.id} value={mandat.id}>
                  {mandat.titre} ({mandat.statut})
                </option>
              ))}
            </select>
            {errors.mandatId && (
              <p className="text-red-500 text-sm mt-1">{errors.mandatId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="posteId">Poste *</Label>
            <select
              id="posteId"
              {...register('posteId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red"
            >
              <option value="">Sélectionner un poste</option>
              {postes.map((poste) => (
                <option key={poste.id} value={poste.id}>
                  {poste.nom} {poste.estBureau ? '(Bureau)' : ''}
                </option>
              ))}
            </select>
            {errors.posteId && (
              <p className="text-red-500 text-sm mt-1">{errors.posteId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="memberId">Membre *</Label>
            <select
              id="memberId"
              {...register('memberId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red"
            >
              <option value="">Sélectionner un membre</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.prenom} {member.nom}
                </option>
              ))}
            </select>
            {errors.memberId && (
              <p className="text-red-500 text-sm mt-1">{errors.memberId.message}</p>
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
              <Label htmlFor="dateFin">Date de fin (optionnel)</Label>
              <Input
                id="dateFin"
                type="date"
                {...register('dateFin')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/affectations">
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


