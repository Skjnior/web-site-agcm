'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Handshake } from 'lucide-react';

type PartnerPublic = {
  id: string;
  nom: string;
  logo: string | null;
  description: string | null;
  siteUrl: string | null;
  type: string | null;
};

type PartnersCarouselSectionProps = {
  eyebrow?: string;
  title?: string;
};

export default function PartnersCarouselSection({
  eyebrow = 'Partenaires',
  title = 'Ils nous font confiance',
}: PartnersCarouselSectionProps) {
  const [partenaires, setPartenaires] = useState<PartnerPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/partenaires')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.partenaires)) setPartenaires(d.partenaires);
      })
      .catch(() => setPartenaires([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && partenaires.length === 0) {
    return null;
  }

  const doubled = [...partenaires, ...partenaires];

  return (
    <section id="partenaires" className="py-12 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-red-600 font-semibold text-sm uppercase flex items-center justify-center gap-2">
            <Handshake className="w-4 h-4" />
            {eyebrow}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-agcm-900 mt-2">{title}</h2>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-w-[280px] h-40 rounded-xl bg-slate-100 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : (
          <div className="relative -mx-4 sm:-mx-6">
            <div className="flex gap-4 animate-partners-scroll w-max hover:[animation-play-state:paused]">
              {doubled.map((p, i) => (
                <article
                  key={`${p.id}-${i}`}
                  className="min-w-[280px] max-w-[320px] shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {p.logo ? (
                      <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-100">
                        <Image src={p.logo} alt={p.nom} fill className="object-contain p-1" sizes="64px" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 shrink-0 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold text-xl">
                        {p.nom.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {p.type ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {p.type}
                        </span>
                      ) : null}
                      <h3 className="font-semibold text-agcm-900 leading-tight mt-0.5">{p.nom}</h3>
                      {p.description ? (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-3">{p.description}</p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
