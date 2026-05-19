import Image from 'next/image';
import { ArrowRight, Handshake } from 'lucide-react';
import { getSitePublicPayload } from '@/lib/site-public-server';

export default async function AboutPartners() {
  const p = await getSitePublicPayload();
  const s = p.about.partners;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-red-600 font-bold text-sm uppercase tracking-widest mb-3">
            <Handshake className="w-5 h-5" /> {s.eyebrow}
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-agcm-900 mb-6">{s.title}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">{s.lead}</p>
          <div className="flex justify-center gap-1.5">
            <div className="w-12 h-1 bg-red-600 rounded-full" />
            <div className="w-12 h-1 bg-yellow-500 rounded-full" />
            <div className="w-12 h-1 bg-emerald-500 rounded-full" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {s.items.map(({ name, description, logo, link, type }) => (
            <div
              key={name}
              className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative w-24 h-24 mx-auto mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">
                <Image src={logo} alt={name} fill className="object-cover rounded-2xl" />
              </div>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                  {type}
                </span>
                <h3 className="text-xl font-bold text-agcm-900 mb-3 group-hover:text-red-600 transition-colors">
                  {name}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{description}</p>
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm font-bold transition-colors"
                  >
                    Visiter le site <ArrowRight className="w-4 h-4" />
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
