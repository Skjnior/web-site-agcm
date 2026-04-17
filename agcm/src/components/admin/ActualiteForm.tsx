// components/admin/ActualiteForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUpload } from '@/components/ui/image-upload';

export type ActualiteFormData = {
  titre: string;
  slug?: string; // Used as ID or internal identifier
  resume: string; // Kept for UI compatibility but mapped to empty or ignored
  content: string; // Mapped to 'contenu'
  categorie: string; // Mapped to 'type'
  tags?: string;
  imageUrl?: string; // Mapped to 'imagePrincipale'
  auteur: string;
  published: boolean; // Mapped to 'statutWorkflow'
  datePublication?: string; // Mapped to 'approvedAt'
};

type ActualiteFormProps = {
  actualiteId?: string;
  initialData?: Partial<ActualiteFormData>;
};

export default function ActualiteForm({ actualiteId, initialData }: ActualiteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ActualiteFormData>({
    titre: initialData?.titre || '',
    slug: initialData?.slug || '',
    resume: initialData?.resume || '',
    content: initialData?.content || '',
    categorie: initialData?.categorie || 'AUTRE',
    tags: initialData?.tags || '',
    imageUrl: initialData?.imageUrl || '',
    auteur: initialData?.auteur || '',
    published: initialData?.published ?? false,
    datePublication: initialData?.datePublication || '',
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
      const url = actualiteId
        ? `/api/admin/actualites/${actualiteId}`
        : '/api/admin/actualites';
      const method = actualiteId ? 'PUT' : 'POST';

      // Log pour déboguer
      console.log('Submitting actualite form data:', {
        titre: formData.titre,
        imageUrl: formData.imageUrl,
        slug: formData.slug,
      });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contenu: formData.content,
          type: formData.categorie,
          imagePrincipale: formData.imageUrl,
          // Extra mappings for the backend to be safe
        }),
      });

      if (res.ok) {
        router.push('/admin/actualites');
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
        <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-200/50 pb-4">Informations générales</h2>
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
          <div className="space-y-2">
            <label htmlFor="categorie" className="block text-sm font-medium text-slate-700">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              id="categorie"
              required
              value={formData.categorie}
              onChange={(e) => setFormData((prev) => ({ ...prev, categorie: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
            >
              <option value="ACTUALITE">Actualité standard</option>
              <option value="EVENEMENT">Événement</option>
              <option value="FORMATION">Formation</option>
              <option value="REGLEMENTATION">Réglementation</option>
              <option value="VIE_ASSOCIATIVE">Vie associative</option>
              <option value="PARTENARIAT">Partenariat</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="auteur" className="block text-sm font-medium text-slate-700">
              Auteur <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="auteur"
              required
              value={formData.auteur}
              onChange={(e) => setFormData((prev) => ({ ...prev, auteur: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
              placeholder="Nom de l'auteur ou du pôle"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="resume" className="block text-sm font-medium text-slate-700">
              Résumé <span className="text-red-500">*</span>
            </label>
            <textarea
              id="resume"
              required
              rows={3}
              value={formData.resume}
              onChange={(e) => setFormData((prev) => ({ ...prev, resume: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100 resize-none"
              placeholder="Un bref résumé qui apparaîtra dans les listes d'actualités..."
            />
          </div>
          <div className="md:col-span-2 space-y-2 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-800/50">
              <label htmlFor="content" className="block text-sm font-medium text-slate-700">
                Contenu détaillé <span className="text-red-500">*</span>
              </label>
            </div>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
              placeholder="Rédigez le contenu complet de l'actualité ici..."
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Image principale
            </label>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4 dark:border-slate-600 dark:bg-slate-800/30">
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
                label="Cliquez ou glissez une image ici"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700">
              Mots-clés (tags)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
              placeholder="agcm, réunion, 2024"
            />
            <p className="text-xs text-slate-500">Séparez les mots-clés par des virgules</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="datePublication" className="block text-sm font-medium text-slate-700">
              Date de publication prévue
            </label>
            <input
              type="date"
              id="datePublication"
              value={formData.datePublication}
              onChange={(e) => setFormData((prev) => ({ ...prev, datePublication: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-100"
            />
          </div>

          <div className="md:col-span-2 pt-4 border-t border-slate-200/50">
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
                <span className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors">Publier immédiatement</span>
                <p className="text-xs text-slate-500 mt-0.5">Si coché, l'actualité sera visible sur le site public dès l'enregistrement.</p>
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
          ) : actualiteId ? 'Mettre à jour l\'actualité' : 'Créer l\'actualité'}
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

