'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export interface GalerieImage {
  id: string;
  url: string;
  alt: string;
}

type GalerieSectionProps = {
  /** @deprecated Utiliser l’API /api/public/galerie (images visibles uniquement). */
  images?: GalerieImage[];
  /** Limite d’affichage sur l’accueil (0 = toutes les visibles). */
  maxDisplay?: number;
};

interface GalerieModalProps {
  images: GalerieImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function GalerieModal({ images, currentIndex, isOpen, onClose, onNext, onPrev }: GalerieModalProps) {
  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Fermer"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Navigation précédent */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="Image précédente"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Navigation suivant */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="Image suivante"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Image en grand */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            fill
            className="object-contain"
            priority
            unoptimized={currentImage.url.startsWith('https://images.unsplash.com')}
          />
        </div>
      </div>

      {/* Indicateur de position */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}

      {/* Navigation clavier */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        div[class*='fixed'] {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function GalerieSection({ images: imagesProp, maxDisplay = 12 }: GalerieSectionProps) {
  const [fetched, setFetched] = useState<GalerieImage[] | null>(null);

  useEffect(() => {
    if (imagesProp?.length) return;
    fetch('/api/public/galerie')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.images)) setFetched(d.images);
        else setFetched([]);
      })
      .catch(() => setFetched([]));
  }, [imagesProp]);

  const allImages = imagesProp?.length ? imagesProp : fetched ?? [];
  const images = maxDisplay > 0 ? allImages.slice(0, maxDisplay) : allImages;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Navigation clavier
  useEffect(() => {
    if (!isModalOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <section id="galerie" className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-red-600 font-semibold text-sm uppercase tracking-wide">
              Galerie
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-agcm-900 mt-2">
              Moments partagés
            </h2>
            <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
              Découvrez les moments forts de nos événements et activités
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:z-10"
                onClick={() => handleImageClick(index)}
              >
                {/* Image */}
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized={image.url.startsWith('https://images.unsplash.com')}
                />

                {/* Overlay au survol */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Gradient en bas pour le texte (optionnel) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      <GalerieModal
        images={images}
        currentIndex={selectedIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </>
  );
}

