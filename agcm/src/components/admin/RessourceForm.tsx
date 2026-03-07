// components/admin/RessourceForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui/image-upload';

type RessourceFormData = {
  titre: string;
  description: string;
  type: string;
  categorie: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  externalUrl?: string;
  imageUrl?: string;
  memberOnly: boolean;
  premiumOnly: boolean;
  auteur?: string;
  datePublication?: string;
  tags?: string;
  published: boolean;
};

type RessourceFormProps = {
  ressourceId?: string;
  initialData?: Partial<RessourceFormData>;
};

export default function RessourceForm({ ressourceId, initialData }: RessourceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<RessourceFormData>({
    titre: initialData?.titre || '',
    description: initialData?.description || '',
    type: initialData?.type || 'DOCUMENT',
    categorie: initialData?.categorie || 'AUTRE',
    fileUrl: initialData?.fileUrl || '',
    fileName: initialData?.fileName || '',
    fileSize: initialData?.fileSize,
    mimeType: initialData?.mimeType,
    externalUrl: initialData?.externalUrl || '',
    imageUrl: initialData?.imageUrl || '',
    memberOnly: initialData?.memberOnly ?? true,
    premiumOnly: initialData?.premiumOnly ?? false,
    auteur: initialData?.auteur || '',
    datePublication: initialData?.datePublication || '',
    tags: initialData?.tags || '',
    published: initialData?.published ?? true,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
        }));
        setUploadProgress(100);
        alert('Fichier uploadé avec succès !');
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      alert('Erreur lors de l\'upload du fichier');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation : si fileName est présent (fichier uploadé), fileUrl doit aussi être présent
    if (formData.fileName && !formData.fileUrl) {
      alert('Erreur: Le fichier uploadé n\'a pas d\'URL. Veuillez réessayer l\'upload.');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = ressourceId
        ? `/api/admin/ressources/${ressourceId}`
        : '/api/admin/ressources';
      const method = ressourceId ? 'PUT' : 'POST';

      // Log pour déboguer
      console.log('Submitting form data:', {
        fileUrl: formData.fileUrl,
        fileName: formData.fileName,
        fileSize: formData.fileSize,
        mimeType: formData.mimeType,
      });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/ressources');
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
      <div className="bg-white border rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Informations générales</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              id="titre"
              required
              value={formData.titre}
              onChange={(e) => setFormData((prev) => ({ ...prev, titre: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
              label="Image de la ressource (flyer, couverture, etc.)"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DOCUMENT">Document</option>
              <option value="VIDEO">Vidéo</option>
              <option value="LIEN">Lien</option>
              <option value="AUDIO">Audio</option>
            </select>
          </div>
          <div>
            <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie *
            </label>
            <select
              id="categorie"
              required
              value={formData.categorie}
              onChange={(e) => setFormData((prev) => ({ ...prev, categorie: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="NORMES_STANDARDS">Normes & Standards</option>
              <option value="GUIDES_METHODOLOGIES">Guides & Méthodologies</option>
              <option value="PUBLICATIONS_AGA">Publications AGCM</option>
              <option value="ETUDES_CAS">Études de cas</option>
              <option value="RAPPORTS_ANNUELS">Rapports annuels</option>
              <option value="REGLEMENTATION">Réglementation</option>
              <option value="OUTILS">Outils</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              Fichier à uploader (depuis votre ordinateur) <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
            {isUploading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload en cours...</p>
              </div>
            )}
            {formData.fileUrl && formData.fileUrl.startsWith('/uploads/') && !isUploading && (
              <div className="mt-2 text-sm text-green-600">
                ✓ Fichier uploadé : {formData.fileName || 'Fichier'}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      fileUrl: '',
                      fileName: '',
                      fileSize: undefined,
                      mimeType: undefined,
                    }));
                  }}
                  className="ml-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL du fichier externe (Drive, Dropbox, etc.) <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="url"
              id="fileUrl"
              value={formData.fileUrl && !formData.fileUrl.startsWith('/uploads/') ? formData.fileUrl : ''}
              onChange={(e) => {
                // Si on entre une URL externe, on supprime le fichier uploadé
                if (e.target.value && !e.target.value.startsWith('/uploads/')) {
                  setFormData((prev) => ({
                    ...prev,
                    fileUrl: e.target.value,
                    fileName: '',
                    fileSize: undefined,
                    mimeType: undefined,
                  }));
                } else if (!e.target.value) {
                  setFormData((prev) => ({
                    ...prev,
                    fileUrl: '',
                  }));
                }
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://drive.google.com/..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Vous pouvez uploader un fichier depuis votre ordinateur OU utiliser une URL externe. Les deux sont optionnels.
            </p>
          </div>
          <div>
            <label htmlFor="externalUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL externe
            </label>
            <input
              type="url"
              id="externalUrl"
              value={formData.externalUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, externalUrl: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="auteur" className="block text-sm font-medium text-gray-700 mb-1">
              Auteur
            </label>
            <input
              type="text"
              id="auteur"
              value={formData.auteur}
              onChange={(e) => setFormData((prev) => ({ ...prev, auteur: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="datePublication" className="block text-sm font-medium text-gray-700 mb-1">
              Date de publication
            </label>
            <input
              type="date"
              id="datePublication"
              value={formData.datePublication}
              onChange={(e) => setFormData((prev) => ({ ...prev, datePublication: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Accès</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="memberOnly"
              checked={formData.memberOnly}
              onChange={(e) => setFormData((prev) => ({ ...prev, memberOnly: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="memberOnly" className="text-sm text-gray-700">
              Réservé aux membres uniquement
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="premiumOnly"
              checked={formData.premiumOnly}
              onChange={(e) => setFormData((prev) => ({ ...prev, premiumOnly: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="premiumOnly" className="text-sm text-gray-700">
              Réservé aux membres premium uniquement
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="published" className="text-sm text-gray-700">
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
          {isSubmitting ? 'Enregistrement...' : ressourceId ? 'Mettre à jour' : 'Créer'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

