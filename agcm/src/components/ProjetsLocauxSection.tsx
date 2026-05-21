'use client';

import { CheckCircle } from 'lucide-react';
import { SmartImage } from '@/components/ui/smart-image';
import { PLACEHOLDER_CARD_IMAGE } from '@/lib/placeholder-images';
import type { SitePublicPayload } from '@/types/site-public';

type ProjetsLocauxSectionProps = {
  data: SitePublicPayload['projetsLocaux'];
};

export default function ProjetsLocauxSection({ data }: ProjetsLocauxSectionProps) {
  const imageSrc = data.imageUrl?.trim() || PLACEHOLDER_CARD_IMAGE;

  return (
    <section
      id="projets-locaux"
      className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-agcm-900 via-agcm-800 to-agcm-900 text-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Texte en premier sur mobile */}
          <div className="space-y-4 min-w-0 order-1 lg:order-2">
            <span className="text-red-300 font-semibold text-xs sm:text-sm uppercase tracking-wide">
              {data.eyebrow}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance leading-tight">
              {data.title}
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {data.lead}
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-slate-100">
              {data.bullets.map((b, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <CheckCircle
                    size={16}
                    className="text-red-300 mt-0.5 shrink-0"
                    aria-hidden
                  />
                  <span className="min-w-0 break-words">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative w-full min-w-0 order-2 lg:order-1 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] max-h-[min(70vh,400px)] lg:max-h-none lg:min-h-[280px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <SmartImage
              src={imageSrc}
              alt={data.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              fallbackSrc={PLACEHOLDER_CARD_IMAGE}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
