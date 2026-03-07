// src/app/evenements/[slug]/page.tsx
// Page détail d'un événement — modèle Event
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Clock, ChevronRight, Facebook } from 'lucide-react';
import Footer from '@/components/layout/Footer';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

const STATUT_LABELS: Record<string, { label: string; color: string }> = {
  PASSE: { label: 'Passé', color: 'bg-slate-100 text-slate-600' },
  EN_COURS: { label: 'En cours', color: 'bg-green-100 text-green-700' },
  A_VENIR: { label: 'À venir', color: 'bg-red-100 text-red-700' },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { titre: true, description: true },
  });
  if (!event) return { title: 'Événement introuvable - AGCM' };
  return {
    title: `${event.titre} - AGCM`,
    description: event.description?.slice(0, 150) ?? undefined,
  };
}

export default async function EvenementDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      medias: { orderBy: { isPrincipale: 'desc' } },
      mandat: { select: { titre: true } },
    },
  });

  if (!event || !event.afficheSite) {
    notFound();
  }

  const statutInfo = STATUT_LABELS[event.statut] || STATUT_LABELS.A_VENIR;
  const mainImage = event.medias.find((m) => m.isPrincipale)?.url || event.medias[0]?.url;
  const galleryImages = event.medias.filter((m) => !m.isPrincipale).slice(0, 6);

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-agcm-900 via-agcm-800 to-red-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-5 right-10 w-48 h-48 bg-red-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/evenements"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux événements
          </Link>

          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statutInfo.color} text-white bg-red-500`}>
                {statutInfo.label}
              </span>
              {event.mandat && (
                <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                  {event.mandat.titre}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-8">
              {event.titre}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDateLong(event.dateDebut)}
              </span>
              {event.lieu && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {event.lieu}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {statutInfo.label}
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="pb-16 bg-slate-50 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image principale */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-xl border-b border-slate-100">
                <Image
                  src={mainImage || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80'}
                  alt={event.titre}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Description */}
              {event.description && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-agcm-900 mb-3">À propos</h2>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>
              )}

              {/* Galerie */}
              {galleryImages.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-agcm-900 mb-3">Photos</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {galleryImages.map((media) => (
                      <div key={media.id} className="relative aspect-square rounded-xl overflow-hidden">
                        <Image src={media.url} alt={event.titre} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              {/* Card infos */}
              <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4 sticky top-24">
                <h3 className="font-bold text-agcm-900 text-base border-b border-slate-100 pb-3">
                  Informations pratiques
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">Date</p>
                      <p className="text-sm font-semibold text-agcm-900">{formatDateLong(event.dateDebut)}</p>
                      {event.dateFin && event.dateFin.getTime() !== event.dateDebut.getTime() && (
                        <p className="text-xs text-slate-500">→ {formatDateLong(event.dateFin)}</p>
                      )}
                    </div>
                  </div>

                  {event.lieu && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-0.5">Lieu</p>
                        <p className="text-sm font-semibold text-agcm-900">{event.lieu}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">Statut</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statutInfo.color}`}>
                        {statutInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bouton retour contact et lien Facebook */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <Link
                    href="/contact"
                    className="block w-full text-center bg-red-600 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors"
                  >
                    Nous contacter
                  </Link>
                  <a
                    href="https://www.facebook.com/share/14NXh1YLUkc/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-center border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    <Facebook className="w-4 h-4 text-[#1877F2]" />
                    Suivre sur Facebook
                  </a>
                </div>
              </div>
            </aside>
          </div>

          {/* Retour */}
          <div className="mt-10 text-center">
            <Link
              href="/evenements"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Voir tous les événements
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
