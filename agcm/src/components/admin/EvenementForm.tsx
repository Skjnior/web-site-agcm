// components/admin/EvenementForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui/image-upload';

type EvenementFormData = {
  titre: string;
  slug: string;
  description: string;
  type: string;
  dateEvenement: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  lienVisio?: string;
  inscriptionRequise: boolean;
  placesMax?: number;
  dateInscriptionFin?: string;
  programme?: string;
  intervenants?: string;
  imageUrl?: string;
  status: string;
  published: boolean;
};

type EvenementFormProps = {
  evenementId?: string;
  initialData?: Partial<EvenementFormData>;
};

export default function EvenementForm({ evenementId, initialData }: EvenementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EvenementFormData>({
    titre: initialData?.titre || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    type: initialData?.type || 'CONFERENCE',
    dateEvenement: initialData?.dateEvenement || '',
    heureDebut: initialData?.heureDebut || '09:00',
    heureFin: initialData?.heureFin || '17:00',
    lieu: initialData?.lieu || '',
    lienVisio: initialData?.lienVisio || '',
    inscriptionRequise: initialData?.inscriptionRequise ?? false,
    placesMax: initialData?.placesMax,
    dateInscriptionFin: initialData?.dateInscriptionFin || '',
    programme: initialData?.programme || '',
    intervenants: initialData?.intervenants || '',
    imageUrl: initialData?.imageUrl || '',
    status: initialData?.status || 'A_VENIR',
    published: initialData?.published ?? false,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      titre: title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = evenementId
        ? `/api/admin/evenements/${evenementId}`
        : '/api/admin/evenements';
      const method = evenementId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/evenements');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="admin-glass rounded-3xl p-8 shadow-sm space-y-8">
        <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-200/50 pb-4 dark:border-slate-700 dark:text-slate-100">Informations générales</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="titre" className="block text-sm font-medium text-slate-700">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titre"
              required
              value={formData.titre}
              onChange={handleTitleChange}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
              placeholder="Ex: Assemblée Générale Ordinaire 2024"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              required
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 font-mono text-sm text-slate-600 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-300"
              placeholder="ex-assemblee-generale"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100 resize-y"
              placeholder="Décrivez l'événement..."
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium text-slate-700">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
            >
              <option value="CONFERENCE">Conférence</option>
              <option value="SEMINAIRE">Séminaire</option>
              <option value="WEBINAIRE">Webinaire</option>
              <option value="ATELIER">Atelier</option>
              <option value="ASSEMBLEE_GENERALE">Assemblée générale</option>
              <option value="NETWORKING">Networking</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-glass rounded-3xl p-8 shadow-sm space-y-8">
        <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-200/50 pb-4 dark:border-slate-700 dark:text-slate-100">Date et lieu</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="dateEvenement" className="block text-sm font-medium text-slate-700">
              Date de l'événement <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dateEvenement"
              required
              value={formData.dateEvenement}
              onChange={(e) => setFormData((prev) => ({ ...prev, dateEvenement: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lieu" className="block text-sm font-medium text-slate-700">
              Lieu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lieu"
              required
              value={formData.lieu}
              onChange={(e) => setFormData((prev) => ({ ...prev, lieu: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
              placeholder="Adresse ou plateforme"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="heureDebut" className="block text-sm font-medium text-slate-700">
              Heure de début <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="heureDebut"
              required
              value={formData.heureDebut}
              onChange={(e) => setFormData((prev) => ({ ...prev, heureDebut: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="heureFin" className="block text-sm font-medium text-slate-700">
              Heure de fin <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="heureFin"
              required
              value={formData.heureFin}
              onChange={(e) => setFormData((prev) => ({ ...prev, heureFin: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="lienVisio" className="block text-sm font-medium text-slate-700">
              Lien visioconférence
            </label>
            <input
              type="url"
              id="lienVisio"
              value={formData.lienVisio}
              onChange={(e) => setFormData((prev) => ({ ...prev, lienVisio: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
              placeholder="Lien Zoom, Teams, Meet..."
            />
          </div>
        </div>
      </div>

      <div className="admin-glass rounded-3xl p-8 shadow-sm space-y-8">
        <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-200/50 pb-4 dark:border-slate-700 dark:text-slate-100">Inscriptions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input
                  type="checkbox"
                  id="inscriptionRequise"
                  checked={formData.inscriptionRequise}
                  onChange={(e) => setFormData((prev) => ({ ...prev, inscriptionRequise: e.target.checked }))}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                <svg className="absolute w-3 h-3 text-white peer-checked:opacity-100 opacity-0 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors">Inscription requise</span>
                <p className="text-xs text-slate-500 mt-0.5">Si coché, les membres devront s'inscrire pour participer à cet événement.</p>
              </div>
            </label>
          </div>
          {formData.inscriptionRequise && (
            <>
              <div className="space-y-2">
                <label htmlFor="placesMax" className="block text-sm font-medium text-slate-700">
                  Places maximum (laisser vide si illimité)
                </label>
                <input
                  type="number"
                  id="placesMax"
                  min="1"
                  value={formData.placesMax || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      placesMax: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
                  placeholder="Ex: 50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dateInscriptionFin" className="block text-sm font-medium text-slate-700">
                  Date de fin des inscriptions
                </label>
                <input
                  type="date"
                  id="dateInscriptionFin"
                  value={formData.dateInscriptionFin || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dateInscriptionFin: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="admin-glass rounded-3xl p-8 shadow-sm space-y-8">
        <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-200/50 pb-4 dark:border-slate-700 dark:text-slate-100">Programme & Média</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="programme" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Programme détaillé
            </label>
            <textarea
              id="programme"
              rows={8}
              value={formData.programme || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, programme: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100 resize-y"
              placeholder="Détaillez le programme de l'événement..."
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="intervenants" className="block text-sm font-medium text-slate-700">
              Intervenants (séparés par des virgules ou retours à la ligne)
            </label>
            <textarea
              id="intervenants"
              rows={3}
              value={formData.intervenants}
              onChange={(e) => setFormData((prev) => ({ ...prev, intervenants: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100 resize-y"
              placeholder="Ex: Dr. Jean Dupont, Pr. Marie Curi"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Affiche / Image de l'événement
            </label>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-600 dark:bg-slate-800/30">
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                label="Cliquez ou glissez une image ici"
                hideUrlOption
              />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-glass rounded-3xl p-8 shadow-sm space-y-8">
        <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-200/50 pb-4 dark:border-slate-700 dark:text-slate-100">Publication</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">
              Statut de progression <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              required
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
            >
              <option value="A_VENIR">À venir</option>
              <option value="EN_COURS">En cours</option>
              <option value="PASSE">Terminé (passé)</option>
            </select>
          </div>
          <div className="md:col-span-2 pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                <svg className="absolute w-3 h-3 text-white peer-checked:opacity-100 opacity-0 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors">Publier sur le site public</span>
                <p className="text-xs text-slate-500 mt-0.5">Si coché, l'événement apparaîtra dans l'agenda public.</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-blue-600 font-medium text-white rounded-xl hover:bg-blue-700 transition-all hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Enregistrement...
            </span>
          ) : evenementId ? 'Mettre à jour l\'événement' : 'Créer l\'événement'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 bg-white px-8 py-3 font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

