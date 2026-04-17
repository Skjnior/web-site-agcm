'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';

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
  const [members, setMembers] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
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
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modifier l'affectation</h1>
          <p className="text-gray-600 mt-1">Modifier les informations de l'affectation</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="admin-panel-form">
        <div className="space-y-4">
          <div>
            <Label htmlFor="mandatId">Mandat *</Label>
            <select
              id="mandatId"
              {...register('mandatId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red text-gray-900"
            >
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
            <select
              id="posteId"
              {...register('posteId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red text-gray-900"
            >
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
            <Label htmlFor="memberId">Membre *</Label>
            <select
              id="memberId"
              {...register('memberId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red text-gray-900"
            >
              <option value="">Sélectionner un membre</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.prenom} {member.nom} ({member.email})
                </option>
              ))}
            </select>
            {errors.memberId && (
              <p className="text-red-500 text-sm mt-1">{errors.memberId.message}</p>
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
            <select
              id="statut"
              {...register('statut')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red text-gray-900"
            >
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-guinea-red text-gray-900"
              placeholder="Raison de l'inactivation (si applicable)"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}


