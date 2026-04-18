// components/admin/FormationForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUpload } from '@/components/ui/image-upload';

type FormationFormData = {
  titre: string;
  slug: string;
  description: string;
  objectifs: string;
  programme: string;
  dateDebut: string;
  dateFin: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  placesMax: number;
  dateInscriptionDebut: string;
  dateInscriptionFin: string;
  tarifMembre: number;
  tarifNonMembre: number;
  devise: string;
  categorie: string;
  niveau: string;
  dureeJours: number;
  formateurs: string;
  prerequisites?: string;
  certificat: boolean;
  imageUrl?: string;
  status: string;
  published: boolean;
};

type FormationFormProps = {
  formationId?: string;
  initialData?: Partial<FormationFormData>;
};

export default function FormationForm({ formationId, initialData }: FormationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormationFormData>({
    titre: initialData?.titre || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    objectifs: initialData?.objectifs || '',
    programme: initialData?.programme || '',
    dateDebut: initialData?.dateDebut || '',
    dateFin: initialData?.dateFin || '',
    heureDebut: initialData?.heureDebut || '09:00',
    heureFin: initialData?.heureFin || '17:00',
    lieu: initialData?.lieu || '',
    placesMax: initialData?.placesMax || 30,
    dateInscriptionDebut: initialData?.dateInscriptionDebut || '',
    dateInscriptionFin: initialData?.dateInscriptionFin || '',
    tarifMembre: initialData?.tarifMembre || 0,
    tarifNonMembre: initialData?.tarifNonMembre || 0,
    devise: initialData?.devise || 'GNF',
    categorie: initialData?.categorie || '',
    niveau: initialData?.niveau || 'INTERMEDIAIRE',
    dureeJours: initialData?.dureeJours || 1,
    formateurs: initialData?.formateurs || '',
    prerequisites: initialData?.prerequisites || '',
    certificat: initialData?.certificat ?? true,
    imageUrl: initialData?.imageUrl || '',
    status: initialData?.status || 'BROUILLON',
    published: initialData?.published ?? false,
  });

  // Générer le slug automatiquement depuis le titre
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
      const url = formationId
        ? `/api/admin/formations/${formationId}`
        : '/api/admin/formations';
      const method = formationId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/formations');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="admin-panel space-y-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Informations générales</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="titre" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Titre *
            </label>
            <input
              type="text"
              id="titre"
              required
              value={formData.titre}
              onChange={handleTitleChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="slug" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Slug (URL) *
            </label>
            <input
              type="text"
              id="slug"
              required
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Description *
            </label>
            <RichTextEditor
              content={formData.description}
              onChange={(description) => setFormData((prev) => ({ ...prev, description }))}
              placeholder="Décrivez la formation..."
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="objectifs" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Objectifs *
            </label>
            <RichTextEditor
              content={formData.objectifs}
              onChange={(objectifs) => setFormData((prev) => ({ ...prev, objectifs }))}
              placeholder="Listez les objectifs de la formation..."
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="programme" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Programme *
            </label>
            <RichTextEditor
              content={formData.programme}
              onChange={(programme) => setFormData((prev) => ({ ...prev, programme }))}
              placeholder="Détaillez le programme de la formation..."
            />
          </div>
        </div>
      </div>

      <div className="admin-panel space-y-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Dates et horaires</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateDebut" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Date de début *
            </label>
            <input
              type="date"
              id="dateDebut"
              required
              value={formData.dateDebut}
              onChange={(e) => setFormData((prev) => ({ ...prev, dateDebut: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="dateFin" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Date de fin *
            </label>
            <input
              type="date"
              id="dateFin"
              required
              value={formData.dateFin}
              onChange={(e) => setFormData((prev) => ({ ...prev, dateFin: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="heureDebut" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Heure de début *
            </label>
            <input
              type="time"
              id="heureDebut"
              required
              value={formData.heureDebut}
              onChange={(e) => setFormData((prev) => ({ ...prev, heureDebut: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="heureFin" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Heure de fin *
            </label>
            <input
              type="time"
              id="heureFin"
              required
              value={formData.heureFin}
              onChange={(e) => setFormData((prev) => ({ ...prev, heureFin: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="dateInscriptionDebut" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Date début inscriptions *
            </label>
            <input
              type="date"
              id="dateInscriptionDebut"
              required
              value={formData.dateInscriptionDebut}
              onChange={(e) => setFormData((prev) => ({ ...prev, dateInscriptionDebut: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="dateInscriptionFin" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Date fin inscriptions *
            </label>
            <input
              type="date"
              id="dateInscriptionFin"
              required
              value={formData.dateInscriptionFin}
              onChange={(e) => setFormData((prev) => ({ ...prev, dateInscriptionFin: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      <div className="admin-panel space-y-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Lieu et capacité</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lieu" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Lieu *
            </label>
            <input
              type="text"
              id="lieu"
              required
              value={formData.lieu}
              onChange={(e) => setFormData((prev) => ({ ...prev, lieu: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="placesMax" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Places maximum *
            </label>
            <input
              type="number"
              id="placesMax"
              required
              min="1"
              value={formData.placesMax || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 30 : parseInt(e.target.value) || 30;
                setFormData((prev) => ({ ...prev, placesMax: value }));
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      <div className="admin-panel space-y-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Tarifs</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="tarifMembre" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Tarif membre *
            </label>
            <input
              type="number"
              id="tarifMembre"
              required
              min="0"
              step="0.01"
              value={formData.tarifMembre || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                setFormData((prev) => ({ ...prev, tarifMembre: value }));
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="tarifNonMembre" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Tarif non-membre *
            </label>
            <input
              type="number"
              id="tarifNonMembre"
              required
              min="0"
              step="0.01"
              value={formData.tarifNonMembre || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                setFormData((prev) => ({ ...prev, tarifNonMembre: value }));
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="devise" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Devise *
            </label>
            <select
              id="devise"
              required
              value={formData.devise}
              onChange={(e) => setFormData((prev) => ({ ...prev, devise: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            >
              <option value="GNF">GNF</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-panel space-y-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Informations complémentaires</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="categorie" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Catégorie *
            </label>
            <input
              type="text"
              id="categorie"
              required
              value={formData.categorie}
              onChange={(e) => setFormData((prev) => ({ ...prev, categorie: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="niveau" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Niveau *
            </label>
            <select
              id="niveau"
              required
              value={formData.niveau}
              onChange={(e) => setFormData((prev) => ({ ...prev, niveau: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            >
              <option value="DEBUTANT">Débutant</option>
              <option value="INTERMEDIAIRE">Intermédiaire</option>
              <option value="AVANCE">Avancé</option>
            </select>
          </div>
          <div>
            <label htmlFor="dureeJours" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Durée (jours) *
            </label>
            <input
              type="number"
              id="dureeJours"
              required
              min="1"
              value={formData.dureeJours || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 1 : parseInt(e.target.value) || 1;
                setFormData((prev) => ({ ...prev, dureeJours: value }));
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="formateurs" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Formateurs *
            </label>
            <textarea
              id="formateurs"
              required
              rows={3}
              value={formData.formateurs}
              onChange={(e) => setFormData((prev) => ({ ...prev, formateurs: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="prerequisites" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Prérequis
            </label>
            <textarea
              id="prerequisites"
              rows={3}
              value={formData.prerequisites}
              onChange={(e) => setFormData((prev) => ({ ...prev, prerequisites: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            />
          </div>
          <div className="md:col-span-2">
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              label="Image de la formation"
            />
          </div>
        </div>
      </div>

      <div className="admin-panel space-y-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Publication</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="certificat"
              checked={formData.certificat}
              onChange={(e) => setFormData((prev) => ({ ...prev, certificat: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="certificat" className="text-sm text-gray-700 dark:text-slate-300">
              Certificat délivré
            </label>
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
              Statut *
            </label>
            <select
              id="status"
              required
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100"
            >
              <option value="BROUILLON">Brouillon</option>
              <option value="PUBLIEE">Publiée</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="published" className="text-sm text-gray-700 dark:text-slate-300">
              Publié sur le site public
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement...' : formationId ? 'Mettre à jour' : 'Créer'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg bg-gray-200 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

