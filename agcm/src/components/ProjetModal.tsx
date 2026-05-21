'use client';

import { useEffect, useState } from 'react';
import { X, User, Target, ZoomIn } from 'lucide-react';
import { SmartImage } from '@/components/ui/smart-image';
import { PLACEHOLDER_CARD_IMAGE } from '@/lib/placeholder-images';

interface Projet {
  id: string;
  titre: string;
  slug: string;
  description: string;
  objectif: string;
  image: string | null;
  images?: string[];
  responsablePoste: {
    nom: string;
  } | null;
}

interface ProjetModalProps {
  projet: Projet | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjetModal({ projet, isOpen, onClose }: ProjetModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
    setLightboxOpen(false);
  }, [projet?.id, isOpen]);

  if (!isOpen || !projet) return null;

  const gallery =
    projet.images && projet.images.length > 0
      ? projet.images
      : projet.image
        ? [projet.image]
        : [];

  const heroSrc = gallery[activeImageIndex] ?? projet.image;
  const canOpenLightbox = Boolean(heroSrc);

  const openLightbox = () => {
    if (canOpenLightbox) setLightboxOpen(true);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            {heroSrc ? (
              <button
                type="button"
                className="relative block w-full h-64 bg-slate-200 cursor-zoom-in group/hero"
                onClick={openLightbox}
                aria-label="Agrandir l'image du projet"
              >
                <SmartImage
                  src={heroSrc}
                  alt={projet.titre}
                  fill
                  className="object-cover rounded-t-2xl"
                  sizes="(max-width: 768px) 100vw, 768px"
                  fallbackSrc={PLACEHOLDER_CARD_IMAGE}
                />
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover/hero:opacity-100">
                  <ZoomIn className="h-3.5 w-3.5" />
                  Agrandir
                </span>
              </button>
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center rounded-t-2xl">
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-500/30 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-red-600 text-4xl font-bold">
                      {projet.titre[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {gallery.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                {gallery.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === activeImageIndex
                        ? 'border-red-500'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <SmartImage
                      src={url}
                      alt={`${projet.titre} — visuel ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            ) : null}

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
          </div>

          <div className="p-6">
            <h2 className="text-3xl font-bold text-agcm-900 mb-4">{projet.titre}</h2>

            <div className="space-y-3 mb-6">
              {projet.responsablePoste && (
                <div className="flex items-center gap-3 text-slate-700">
                  <User className="w-5 h-5 text-red-500" />
                  <div>
                    <span className="font-semibold">Responsable :</span>{' '}
                    <span>{projet.responsablePoste.nom}</span>
                  </div>
                </div>
              )}
            </div>

            {projet.objectif && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-agcm-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" />
                  Objectif
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {projet.objectif}
                </p>
              </div>
            )}

            {projet.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-agcm-900 mb-3">Description</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {projet.description}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && heroSrc ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image agrandie"
        >
          <button
            type="button"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
            aria-label="Fermer l'aperçu"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- plein écran, toutes sources */}
          <img
            src={heroSrc}
            alt={projet.titre}
            className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
