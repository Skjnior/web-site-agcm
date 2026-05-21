'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  MapPin,
  Target,
  Briefcase,
} from 'lucide-react';
import { SmartImage } from '@/components/ui/smart-image';
import { pickFirstImageMediaUrl } from '@/lib/media-display-url';
import ProjetModal from './ProjetModal';

interface Projet {
  id: string;
  titre: string;
  slug: string;
  description: string;
  objectif: string;
  image: string | null;
  images: string[];
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

type ProjetCardProps = {
  projet: Projet;
  onSelect: (projet: Projet) => void;
  size?: 'lg' | 'md';
};

function ProjetCard({ projet, onSelect, size = 'md' }: ProjetCardProps) {
  const statut = STATUT_CONFIG[projet.statut] || STATUT_CONFIG.EN_COURS;
  const imageHeight = size === 'lg' ? 'h-56' : 'h-48';
  const titleSize = size === 'lg' ? 'text-xl' : 'text-base';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(projet)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(projet);
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-2xl"
    >
      <div className={`relative w-full bg-slate-200 ${imageHeight}`}>
        <SmartImage
          src={projet.image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'}
          alt={projet.titre}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 280px, 320px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statut.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statut.dot}`} />
            {statut.label}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <h3
          className={`font-bold leading-tight text-agcm-900 ${titleSize} line-clamp-2 transition-colors duration-200 group-hover:text-red-600`}
        >
          {projet.titre}
        </h3>

        {projet.objectif && (
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <Target className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
            <span className="line-clamp-2">{projet.objectif}</span>
          </div>
        )}

        {projet.responsablePoste && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{projet.responsablePoste.nom}</span>
          </div>
        )}

        <div className="border-t border-slate-100 pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 transition-all duration-200 group-hover:gap-2.5">
            En savoir plus <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProjetsGuineeSection() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchProjets = async () => {
      try {
        const response = await fetch('/api/public/projets?visible=true&limit=12');
        if (response.ok) {
          const data = await response.json();
          const mapped = (data.data || []).map((p: {
            id: string;
            titre: string;
            slug: string;
            description?: string | null;
            objectif?: string | null;
            statut?: string | null;
            responsablePoste?: { nom: string } | null;
            medias?: Array<{ url: string; type?: string }>;
          }) => {
            const imageMedias = (p.medias ?? []).filter(
              (m) => !m.type || m.type === 'IMAGE',
            );
            const images = imageMedias.map((m) => m.url);
            return {
            id: p.id,
            titre: p.titre,
            slug: p.slug,
            description: p.description || p.objectif || '',
            objectif: p.objectif || '',
            image: pickFirstImageMediaUrl(imageMedias) ?? null,
            images,
            statut: p.statut || 'EN_COURS',
            responsablePoste: p.responsablePoste ?? null,
          };
          });
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

  // Auto-scroll horizontal quand on a plusieurs projets (même mécanisme que EvenementsSection)
  useEffect(() => {
    if (loading || projets.length <= 1 || isPaused) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // px/frame
    let animationFrame: number;

    const scroll = () => {
      if (isPaused) return;
      scrollPosition += scrollSpeed;
      if (scrollPosition >= maxScroll) scrollPosition = 0;
      container.scrollTo({ left: scrollPosition, behavior: 'auto' });
      animationFrame = requestAnimationFrame(scroll);
    };
    animationFrame = requestAnimationFrame(scroll);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [loading, projets, isPaused]);

  const openProjet = (projet: Projet) => {
    setSelectedProjet(projet);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center gap-4 sm:gap-5 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="hidden w-72 animate-pulse overflow-hidden rounded-2xl bg-slate-50 sm:block"
          >
            <div className="h-48 bg-slate-200" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded bg-slate-200" />
            </div>
          </div>
        ))}
        <div className="block w-full animate-pulse overflow-hidden rounded-2xl bg-slate-50 sm:hidden">
          <div className="h-48 bg-slate-200" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="h-5 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (projets.length === 0) {
    return (
      <div className="text-center py-14">
        <MapPin className="mx-auto mb-4 h-14 w-14 text-slate-300" />
        <p className="text-lg text-slate-500">Aucun projet disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <>
      {projets.length === 1 ? (
        // Une seule carte : centrée, format vertical large
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <ProjetCard projet={projets[0]} onSelect={openProjet} size="lg" />
          </div>
        </div>
      ) : (
        // Plusieurs : scroll horizontal avec auto-scroll continu
        <div
          className="relative overflow-x-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide touch-pan-x"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div
              className="flex gap-4 sm:gap-6 min-w-max"
              style={{ width: 'max-content' }}
            >
              {projets.map((projet) => (
                <div
                  key={projet.id}
                  className="flex-shrink-0 w-[min(280px,85vw)] sm:w-72 md:w-80"
                >
                  <ProjetCard projet={projet} onSelect={openProjet} />
                </div>
              ))}
            </div>
          </div>

          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}

      <ProjetModal
        projet={selectedProjet}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProjet(null);
        }}
      />
    </>
  );
}
