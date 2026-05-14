'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import {
  BureauAttachmentsManager,
  type BureauProjetMediaDraft,
} from '@/components/bureau/BureauAttachmentsManager';

const STATUTS = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINE', label: 'Terminé' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'ANNULE', label: 'Annulé' },
] as const;

type StatutValue = (typeof STATUTS)[number]['value'];

export type BureauProjetFormProps = {
  mode?: 'create' | 'edit';
  projetId?: string;
  initialValues?: {
    titre: string;
    objectif: string;
    description: string;
    actions: string | null;
    statut: string;
    visibiliteSite: boolean;
  };
  initialMedias?: BureauProjetMediaDraft[];
};

export default function BureauProjetForm(props: BureauProjetFormProps = {}) {
  const { mode = 'create', projetId, initialValues, initialMedias } = props;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const [medias, setMedias] = useState<BureauProjetMediaDraft[]>(() =>
    (initialMedias ?? []).map((m, i) => ({
      url: m.url,
      type: m.type,
      ordre: m.ordre ?? i,
    }))
  );

  const [formData, setFormData] = useState(() => ({
    titre: initialValues?.titre ?? '',
    objectif: initialValues?.objectif ?? '',
    description: initialValues?.description ?? '',
    actions: initialValues?.actions ?? '',
    statut: (initialValues?.statut as StatutValue) || 'BROUILLON',
    visibiliteSite: initialValues?.visibiliteSite ?? false,
  }));

  useEffect(() => {
    if (mode !== 'edit' || !initialValues) return;
    setFormData({
      titre: initialValues.titre,
      objectif: initialValues.objectif,
      description: initialValues.description,
      actions: initialValues.actions ?? '',
      statut: (initialValues.statut as StatutValue) || 'BROUILLON',
      visibiliteSite: initialValues.visibiliteSite,
    });
    setMedias(
      (initialMedias ?? []).map((m, i) => ({
        url: m.url,
        type: m.type,
        ordre: m.ordre ?? i,
      }))
    );
  }, [mode, initialValues, initialMedias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        titre: formData.titre,
        objectif: formData.objectif,
        description: formData.description,
        actions: formData.actions.trim() || undefined,
        statut: formData.statut,
        visibiliteSite: formData.visibiliteSite,
        medias: medias.map((m, i) => ({
          url: m.url,
          type: m.type,
          ordre: m.ordre ?? i,
        })),
      };

      const url =
        mode === 'edit' && projetId ? `/api/bureau/projets/${projetId}` : '/api/bureau/projets';
      const method = mode === 'edit' ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            (mode === 'edit' ? 'Erreur lors de la modification' : 'Erreur lors de la création')
        );
      }

      setSuccessModal({
        isOpen: true,
        message: mode === 'edit' ? 'Projet modifié avec succès.' : 'Projet créé avec succès.',
      });
      setTimeout(
        () => {
          router.push('/bureau/projets');
          router.refresh();
        },
        mode === 'edit' ? 900 : 1200
      );
    } catch (err: unknown) {
      setErrorModal({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Erreur',
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelHref = '/bureau/projets';

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-700/50 bg-slate-800/50 p-6"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="titre" className="text-slate-300">
              Titre *
            </Label>
            <Input
              id="titre"
              required
              value={formData.titre}
              onChange={(e) => setFormData((p) => ({ ...p, titre: e.target.value }))}
              className="border-slate-600 bg-slate-900/50 text-slate-100"
              placeholder="Intitulé du projet"
            />
          </div>

          <div>
            <Label htmlFor="objectif" className="text-slate-300">
              Objectif *
            </Label>
            <Textarea
              id="objectif"
              required
              rows={3}
              value={formData.objectif}
              onChange={(e) => setFormData((p) => ({ ...p, objectif: e.target.value }))}
              className="border-slate-600 bg-slate-900/50 text-slate-100"
              placeholder="Objectifs mesurables ou direction du projet"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300">
              Description *
            </Label>
            <Textarea
              id="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="border-slate-600 bg-slate-900/50 text-slate-100"
              placeholder="Contexte, public visé, jalons…"
            />
          </div>

          <div>
            <Label htmlFor="actions" className="text-slate-300">
              Actions prévues (optionnel)
            </Label>
            <Textarea
              id="actions"
              rows={4}
              value={formData.actions}
              onChange={(e) => setFormData((p) => ({ ...p, actions: e.target.value }))}
              className="border-slate-600 bg-slate-900/50 text-slate-100"
              placeholder="Liste d’actions ou planning indicatif"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="text-slate-300">Statut</Label>
              <Select
                value={formData.statut}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, statut: v as StatutValue }))
                }
              >
                <SelectTrigger className="border-slate-600 bg-slate-900/50 text-slate-100 [&>span]:text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] border-slate-600 bg-slate-900 text-slate-100">
                  {STATUTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end pb-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.visibiliteSite}
                  onChange={(e) => setFormData((p) => ({ ...p, visibiliteSite: e.target.checked }))}
                  className="rounded border-slate-600 bg-slate-900"
                />
                Visible sur le site (après publication métier)
              </label>
            </div>
          </div>

          <BureauAttachmentsManager variant="projet" items={medias} onChange={setMedias} />
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-slate-700/50 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push(cancelHref)}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[140px]">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'edit' ? 'Enregistrement…' : 'Création…'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {mode === 'edit' ? 'Enregistrer' : 'Créer'}
              </>
            )}
          </Button>
        </div>
      </form>

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
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
