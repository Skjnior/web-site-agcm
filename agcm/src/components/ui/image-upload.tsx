'use client';

import { useState, useEffect } from 'react';

type ImageUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
};

export function ImageUpload({ value, onChange, label = "Image", className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Mettre à jour la preview quand la valeur change
  useEffect(() => {
    if (value && value !== preview) {
      setPreview(value);
    } else if (!value) {
      setPreview(null);
    }
  }, [value, preview]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      alert('Le fichier doit être une image');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setPreview(data.imageUrl);
          onChange(data.imageUrl);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'upload de l\'image');
      }
    } catch (error) {
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);
    if (url) {
      setPreview(url);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    setShowUrlInput(false);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {preview ? (
        <div className="space-y-2">
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full h-48 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
              title="Supprimer l'image"
            >
              ✕
            </button>
          </div>
          {showUrlInput && (
            <div className="space-y-1">
              <input
                type="url"
                value={value || ''}
                onChange={handleUrlChange}
                placeholder="URL de l'image (optionnel)"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Masquer le champ URL
              </button>
            </div>
          )}
          {!showUrlInput && (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Modifier l'URL (optionnel)
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploading ? (
                <div className="text-gray-500">Upload en cours...</div>
              ) : (
                <>
                  <svg
                    className="w-8 h-8 mb-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </label>
          {showUrlInput ? (
            <div className="space-y-1">
              <input
                type="url"
                value={value || ''}
                onChange={handleUrlChange}
                placeholder="Ou entrez une URL d'image (optionnel)"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(false);
                  if (!value) {
                    onChange('');
                  }
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Masquer le champ URL
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Ou utiliser une URL d'image (optionnel)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

