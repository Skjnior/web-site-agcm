'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Target,
  Briefcase,
} from 'lucide-react';
import Image from 'next/image';
import ProjetModal from './ProjetModal';
import { useBreakpoint } from '@/hooks/useMediaQuery';

interface Projet {
  id: string;
  titre: string;
  slug: string;
  description: string;
  objectif: string;
  image: string | null;
  statut: string;
  responsablePoste: { nom: string } | null;
}

const STATUT_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  EN_COURS: { label: 'En cours', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  BROUILLON: { label: 'Planifié', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  TERMINE: { label: 'Terminé', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  SUSPENDU: { label: 'Suspendu', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  ANNULE: { label: 'Annulé', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
};

// Palette gradient par index pour les fallback sans image
const GRADIENTS = [
  'from-red-500 to-red-700',
  'from-emerald-500 to-emerald-700',
  'from-blue-500 to-blue-700',
  'from-amber-500 to-amber-700',
  'from-purple-500 to-purple-700',
  'from-teal-500 to-teal-700',
];

export default function ProjetsGuineeSection() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { cardsVisible } = useBreakpoint();
  const CARDS_VISIBLE = Math.max(1, cardsVisible);

  useEffect(() => {
    const fetchProjets = async () => {
      try {
        const response = await fetch('/api/public/projets?visible=true&limit=9');
        if (response.ok) {
          const data = await response.json();
          const mapped = (data.data || []).map((p: any) => ({
            id: p.id,
            titre: p.titre,
            slug: p.slug,
            description: p.description || p.objectif || '',
            objectif: p.objectif || '',
            image: p.medias?.[0]?.url || null,
            statut: p.statut || 'EN_COURS',
            responsablePoste: p.responsablePoste,
          }));
          setProjets(mapped);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjets();
  }, []);

  const canGoNext = projets.length > CARDS_VISIBLE;
  const maxIndex = Math.max(0, projets.length - CARDS_VISIBLE);

  const goNext = useCallback(() => {
    if (isAnimating || !canGoNext) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating, canGoNext, maxIndex]);

  const goPrev = useCallback(() => {
    if (isAnimating || !canGoNext) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating, canGoNext, maxIndex]);

  // Auto-scroll toutes les 3.5s
  useEffect(() => {
    if (!isPaused && canGoNext) {
      intervalRef.current = setInterval(goNext, 3500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, goNext, canGoNext]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (loading) {
    return (
      <div className="flex gap-4 sm:gap-5 overflow-hidden">
        {[...Array(Math.min(3, CARDS_VISIBLE))].map((_, i) => (
          <div key={i} className={`flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden animate-pulse ${CARDS_VISIBLE === 1 ? 'w-full' : CARDS_VISIBLE === 2 ? 'w-[calc(50%-10px)]' : 'w-[calc(33.333%-14px)]'}`}>
            <div className="h-48 bg-slate-200" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projets.length === 0) {
    return (
      <div className="text-center py-14">
        <MapPin className="w-14 h-14 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">Aucun projet disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Viewport masqué avec overflow-hidden */}
      <div className="overflow-hidden rounded-2xl">
        {/* Track qui se déplace */}
        <div
          ref={trackRef}
          className="flex gap-5"
          style={{
            transform: `translateX(calc(-${currentIndex} * (100% / ${CARDS_VISIBLE} + ${(4 * (CARDS_VISIBLE - 1)) / CARDS_VISIBLE}px)))`,
            transition: isAnimating ? 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
            width: `calc(${projets.length} * (100% / ${CARDS_VISIBLE}) + ${(projets.length - 1) * 20}px / ${CARDS_VISIBLE})`,
          }}
        >
          {projets.map((projet, i) => {
            const statut = STATUT_CONFIG[projet.statut] || STATUT_CONFIG.EN_COURS;
            const gradient = GRADIENTS[i % GRADIENTS.length];

            return (
              <div
                key={projet.id}
                className="group flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={{ width: `calc(100% / ${CARDS_VISIBLE} - ${(20 * (CARDS_VISIBLE - 1)) / CARDS_VISIBLE}px)` }}
                onClick={() => {
                  setSelectedProjet(projet);
                  setIsModalOpen(true);
                }}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <Image
                  src={projet.image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'}
                  alt={projet.titre}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* Badge statut */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statut.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statut.dot}`} />
                      {statut.label}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-5 flex flex-col gap-3">
                  <h3 className="font-bold text-agcm-900 text-base leading-tight line-clamp-2 group-hover:text-red-600 transition-colors duration-200">
                    {projet.titre}
                  </h3>

                  {projet.objectif && (
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <Target className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-400" />
                      <span className="line-clamp-2">{projet.objectif}</span>
                    </div>
                  )}

                  {projet.responsablePoste && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{projet.responsablePoste.nom}</span>
                    </div>
                  )}

                  <div className="pt-1 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1.5 text-red-600 font-semibold text-xs group-hover:gap-2.5 transition-all duration-200">
                      En savoir plus <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation arrows (visibles seulement si > 3 projets) */}
      {canGoNext && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 sm:-translate-x-4 z-10
              w-9 h-9 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center
              text-agcm-900 hover:bg-red-600 hover:text-white transition-colors duration-200
              border border-slate-200"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 sm:translate-x-4 z-10
              w-9 h-9 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center
              text-agcm-900 hover:bg-red-600 hover:text-white transition-colors duration-200
              border border-slate-200"
            aria-label="Suivant"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Indicateurs de position (dots) */}
      {canGoNext && (
        <div className="flex justify-center gap-1.5 mt-5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex
                  ? 'bg-red-600 w-5'
                  : 'bg-slate-300 hover:bg-slate-400'
                }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ProjetModal
        projet={selectedProjet}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProjet(null);
        }}
      />
    </div>
  );
}
