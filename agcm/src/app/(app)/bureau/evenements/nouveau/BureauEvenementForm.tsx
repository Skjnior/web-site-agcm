'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import SuccessModal from '@/components/ui/SuccessModal';
import ErrorModal from '@/components/ui/ErrorModal';

export default function BureauEvenementForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    lieu: '',
    afficheSite: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        titre: formData.titre,
        description: formData.description,
        dateDebut: formData.dateDebut || new Date().toISOString(),
        dateFin: formData.dateFin || formData.dateDebut || new Date().toISOString(),
        lieu: formData.lieu || undefined,
        afficheSite: formData.afficheSite,
      };

      const response = await fetch('/api/bureau/evenements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création');
      }

      setSuccessModal({ isOpen: true, message: 'Événement créé avec succès !' });
      setTimeout(() => {
        router.push('/bureau/evenements');
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      setErrorModal({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Erreur lors de la création',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 space-y-6"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="titre" className="text-slate-300">Titre *</Label>
            <Input
              id="titre"
              required
              value={formData.titre}
              onChange={(e) => setFormData((p) => ({ ...p, titre: e.target.value }))}
              className="bg-slate-900/50 border-slate-600 text-slate-100"
              placeholder="Titre de l'événement"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300">Description *</Label>
            <Textarea
              id="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="bg-slate-900/50 border-slate-600 text-slate-100"
              placeholder="Description de l'événement"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateDebut" className="text-slate-300">Date de début *</Label>
              <Input
                id="dateDebut"
                type="datetime-local"
                required
                value={formData.dateDebut}
                onChange={(e) => setFormData((p) => ({ ...p, dateDebut: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-slate-100"
              />
            </div>
            <div>
              <Label htmlFor="dateFin" className="text-slate-300">Date de fin</Label>
              <Input
                id="dateFin"
                type="datetime-local"
                value={formData.dateFin}
                onChange={(e) => setFormData((p) => ({ ...p, dateFin: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-slate-100"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lieu" className="text-slate-300">Lieu</Label>
            <Input
              id="lieu"
              value={formData.lieu}
              onChange={(e) => setFormData((p) => ({ ...p, lieu: e.target.value }))}
              className="bg-slate-900/50 border-slate-600 text-slate-100"
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
            <Label htmlFor="afficheSite" className="text-slate-300 cursor-pointer">
              Afficher sur le site public (après approbation)
            </Label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700/50">
          <Button type="button" variant="outline" onClick={() => router.push('/bureau/evenements')}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Créer
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
