'use client';

import { useState, useEffect, useRef } from 'react';
import { Users } from 'lucide-react';
import Image from 'next/image';

interface BureauMember {
  nom: string;
  role: string;
  mandat: string;
  photoUrl?: string | null;
}

export default function BureauSection() {
  const [bureau, setBureau] = useState<BureauMember[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchBureau = async () => {
      try {
        const response = await fetch('/api/public/bureau-actuel');
        if (response.ok) {
          const data = await response.json();
          setBureau(data.bureau || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du bureau:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBureau();
  }, []);

  // Auto-scroll avec animation
  useEffect(() => {
    if (loading || bureau.length <= 1 || isPaused) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels par frame
    let animationFrame: number;

    const scroll = () => {
      if (isPaused) return;

      scrollPosition += scrollSpeed;
      
      if (scrollPosition >= maxScroll) {
        // Retour au début en douceur
        scrollPosition = 0;
      }

      container.scrollTo({
        left: scrollPosition,
        behavior: 'auto',
      });

      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [loading, bureau.length, isPaused]);

  if (loading) {
    return (
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-6 min-w-max">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72 bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-pulse">
              <div className="w-28 h-28 bg-slate-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bureau.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">Aucun membre du bureau disponible pour le moment.</p>
        <p className="text-slate-500 text-sm mt-2">Le bureau exécutif sera affiché ici une fois configuré.</p>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Scroll horizontal avec auto-scroll */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex gap-4 sm:gap-6 min-w-max" style={{ width: 'max-content' }}>
          {bureau.map((m, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[260px] sm:w-64 md:w-72 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all hover-lift"
            >
              {/* Photo */}
              <div className="relative w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-4 border-red-100 shadow-md bg-slate-100">
                <Image
                  src={m.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80'}
                  alt={m.nom}
                  fill
                  className="object-cover"
                  unoptimized={(m.photoUrl || '').startsWith('https://images.unsplash.com') || (m.photoUrl || '').startsWith('http://')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.photo-fallback') as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }
                  }}
                />
                {/* Fallback avec initiales si l'image ne charge pas */}
                <div 
                  className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center photo-fallback hidden"
                >
                  <span className="text-white text-3xl font-bold">
                    {m.nom
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
              </div>

              {/* Informations */}
              <div className="text-center">
                <h3 className="text-agcm-900 font-bold text-xl mb-2">{m.nom}</h3>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full mb-3">
                  <span className="text-red-600 font-semibold text-sm">{m.role}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{m.mandat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicateur de scroll */}
      {bureau.length > 1 && (
        <div className="text-center mt-4">
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
