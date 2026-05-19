'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';
import {
  BureauAttachmentsManager,
  type BureauEventMediaDraft,
} from '@/components/bureau/BureauAttachmentsManager';

export type BureauEvenementFormProps = {
  mode?: 'create' | 'edit';
  eventId?: string;
  initialValues?: {
    titre: string;
    description: string;
    dateDebut: string;
    dateFin: string;
    lieu: string;
    afficheSite: boolean;
  };
  initialMedias?: BureauEventMediaDraft[];
};

export default function BureauEvenementForm(props: BureauEvenementFormProps = {}) {
  const { mode = 'create', eventId, initialValues, initialMedias } = props;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [medias, setMedias] = useState<BureauEventMediaDraft[]>(() =>
    (initialMedias ?? []).map((m, i) => ({
      url: m.url,
      isPrincipale: Boolean(m.isPrincipale),
      ordre: m.ordre ?? i,
    }))
  );
  const [formData, setFormData] = useState({
    titre: initialValues?.titre ?? '',
    description: initialValues?.description ?? '',
    dateDebut: initialValues?.dateDebut ?? '',
    dateFin: initialValues?.dateFin ?? '',
    lieu: initialValues?.lieu ?? '',
    afficheSite: initialValues?.afficheSite ?? false,
  });

  useEffect(() => {
    if (mode !== 'edit' || !initialValues) return;
    setFormData({
      titre: initialValues.titre,
      description: initialValues.description,
      dateDebut: initialValues.dateDebut,
      dateFin: initialValues.dateFin,
      lieu: initialValues.lieu,
      afficheSite: initialValues.afficheSite,
    });
    setMedias(
      (initialMedias ?? []).map((m, i) => ({
        url: m.url,
        isPrincipale: Boolean(m.isPrincipale),
        ordre: m.ordre ?? i,
      }))
    );
  }, [mode, initialValues, initialMedias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response: Response;
      if (mode === 'edit' && eventId) {
        const body = {
          titre: formData.titre,
          description: formData.description,
          dateDebut: formData.dateDebut,
          dateFin: formData.dateFin.trim() === '' ? null : formData.dateFin,
          lieu: formData.lieu.trim() || undefined,
          afficheSite: formData.afficheSite,
          medias: medias.map((m, i) => ({
            url: m.url,
            isPrincipale: m.isPrincipale,
            ordre: m.ordre ?? i,
          })),
        };
        response = await fetch(`/api/bureau/evenements/${eventId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        const dateDebut = formData.dateDebut || new Date().toISOString();
        const body = {
          titre: formData.titre,
          description: formData.description,
          dateDebut,
          dateFin: formData.dateFin.trim() ? formData.dateFin : undefined,
          lieu: formData.lieu.trim() || undefined,
          afficheSite: formData.afficheSite,
          medias: medias.map((m, i) => ({
            url: m.url,
            isPrincipale: m.isPrincipale,
            ordre: m.ordre ?? i,
          })),
        };
        response = await fetch('/api/bureau/evenements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            (mode === 'edit' ? 'Erreur lors de la modification' : 'Erreur lors de la création')
        );
      }

      setSuccessModal({
        isOpen: true,
        message: mode === 'edit' ? 'Événement modifié avec succès.' : 'Événement créé avec succès.',
      });
      setTimeout(() => {
        router.push('/bureau/evenements');
        router.refresh();
      }, mode === 'edit' ? 900 : 1500);
    } catch (err: unknown) {
      setErrorModal({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Erreur',
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelHref = '/bureau/evenements';

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
              placeholder="Titre de l'événement"
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
              placeholder="Description de l'événement"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dateDebut" className="text-slate-300">
                Date de début *
              </Label>
              <Input
                id="dateDebut"
                type="datetime-local"
                required
                value={formData.dateDebut}
                onChange={(e) => setFormData((p) => ({ ...p, dateDebut: e.target.value }))}
                className="border-slate-600 bg-slate-900/50 text-slate-100"
              />
            </div>
            <div>
              <Label htmlFor="dateFin" className="text-slate-300">
                Date de fin
              </Label>
              <Input
                id="dateFin"
                type="datetime-local"
                value={formData.dateFin}
                onChange={(e) => setFormData((p) => ({ ...p, dateFin: e.target.value }))}
                className="border-slate-600 bg-slate-900/50 text-slate-100"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lieu" className="text-slate-300">
              Lieu
            </Label>
            <Input
              id="lieu"
              value={formData.lieu}
              onChange={(e) => setFormData((p) => ({ ...p, lieu: e.target.value }))}
              className="border-slate-600 bg-slate-900/50 text-slate-100"
              placeholder="Lieu de l'événement"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="afficheSite"
              checked={formData.afficheSite}
              onChange={(e) => setFormData((p) => ({ ...p, afficheSite: e.target.checked }))}
              className="rounded border-slate-600 bg-slate-900/50 text-blue-500"
            />
            <Label htmlFor="afficheSite" className="cursor-pointer text-slate-300">
              Afficher sur le site public (après validation métier)
            </Label>
          </div>

          <BureauAttachmentsManager variant="event" items={medias} onChange={setMedias} />
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-slate-700/50 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push(cancelHref)}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
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
