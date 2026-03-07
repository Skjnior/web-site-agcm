import Image from 'next/image';

export default function AboutHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center pt-24 overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1523050335456-c7884704b129?auto=format&fit=crop&w=1920&q=80"
          alt="Education and Community"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-agcm-900/95 via-agcm-800/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
            Découvrez notre histoire
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-slide-up">
            À propos de l&apos;<span className="text-red-500">AGCM</span>
          </h1>
          <p className="text-xl text-slate-200 mb-8 leading-relaxed max-w-2xl animate-slide-up delay-100">
            Une communauté unie au service de l&apos;intégration en Charente-Maritime et du développement solidaire en Guinée.
          </p>
          <div className="flex flex-wrap gap-4 animate-slide-up delay-200">
            <div className="w-16 h-1.5 bg-red-600 rounded-full" />
            <div className="w-16 h-1.5 bg-yellow-500 rounded-full" />
            <div className="w-16 h-1.5 bg-emerald-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-tl from-red-600/20 to-transparent blur-3xl pointer-events-none" />
    </section>
  );
}

