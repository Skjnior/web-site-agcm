'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import Image from 'next/image';

interface BureauMember {
  nom: string;
  role: string;
  mandat: string;
  photoUrl?: string | null;
}

export default function BureauSectionCompact() {
  const [bureau, setBureau] = useState<BureauMember[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-64 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm animate-pulse">
            <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-3"></div>
            <div className="h-4 bg-slate-200 rounded mb-2 w-3/4 mx-auto"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (bureau.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-3">
          <Users className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-600 text-sm">Aucun membre du bureau actuel disponible pour le moment.</p>
      </div>
    );
  }

  // Marquee en boucle infinie continue : on duplique le contenu pour éviter tout vide lors du reset
  const bureauDuplicated = [...bureau, ...bureau];

  return (
    <div className="relative group overflow-hidden" style={{ minHeight: '320px' }}>
      <style jsx>{`
        @keyframes marqueeLoop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-content {
          animation: marqueeLoop 40s linear infinite;
        }
        .marquee-container:hover .marquee-content {
          animation-play-state: paused !important;
        }
      `}</style>

      <div className="marquee-container relative w-full h-full py-4 overflow-hidden">
        {/* Deux copies du contenu : quand la 1ère sort à gauche, la 2ème prend le relais sans vide */}
        <div
          className="marquee-content flex gap-6 px-4"
          style={{
            width: 'max-content',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {bureauDuplicated.map((m, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-56 sm:w-64 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center group/card"
            >
              {/* Photo */}
              <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-red-50 shadow-md bg-slate-100">
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
                  <span className="text-white text-2xl font-bold">
                    {m.nom.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              </div>

              {/* Informations */}
              <div className="text-center w-full">
                <h4 className="text-agcm-900 font-bold text-base mb-1 line-clamp-1 group-hover/card:text-red-600 transition-colors uppercase tracking-tight">{m.nom}</h4>
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-100 rounded-full mb-2">
                  <span className="text-red-600 font-semibold text-[10px] uppercase tracking-wider">{m.role}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.mandat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradients d'ombrage pour l'effet de fondu sur les bords */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
