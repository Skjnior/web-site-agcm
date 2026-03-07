// src/app/evenements/page.tsx
// Page Événements — utilise le modèle Event (afficheSite=true)
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, CalendarDays, Filter } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Événements - AGCM',
  description: "Tous les événements de l'Association des Guinéens de La Charente-Maritime.",
};

const STATUT_CONFIG: Record<string, { label: string; color: string }> = {
  PASSE: { label: 'Passé', color: 'bg-slate-100 text-slate-500' },
  EN_COURS: { label: "En cours", color: 'bg-green-100 text-green-700' },
  A_VENIR: { label: 'À venir', color: 'bg-red-100 text-red-700' },
};

function formatDateFull(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseParam(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function EvenementsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statut = parseParam(params.statut);
  const pageParam = parseParam(params.page);
  const PAGE_SIZE = 9;
  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    afficheSite: true,
    ...(statut ? { statut: statut as 'PASSE' | 'EN_COURS' | 'A_VENIR' } : {}),
  };

  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      select: {
        id: true,
        titre: true,
        slug: true,
        description: true,
        dateDebut: true,
        dateFin: true,
        lieu: true,
        statut: true,
        medias: {
          select: { url: true, isPrincipale: true },
          orderBy: { isPrincipale: 'desc' },
          take: 1,
        },
      },
      orderBy: { dateDebut: 'asc' },
      skip,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-agcm-900 via-agcm-800 to-red-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-5 left-10 w-48 h-48 bg-red-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
            <CalendarDays className="w-4 h-4" />
            Agenda de l&apos;AGCM
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Événements</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Retrouvez tous nos événements : fêtes culturelles, réunions, initiatives communautaires et bien plus.
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtrer :
          </span>
          {[
            { value: '', label: 'Tous' },
            { value: 'A_VENIR', label: 'À venir' },
            { value: 'EN_COURS', label: 'En cours' },
            { value: 'PASSE', label: 'Passés' },
          ].map((f) => (
            <Link
              key={f.value}
              href={f.value ? `/evenements?statut=${f.value}` : '/evenements'}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${(statut || '') === f.value
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {f.label}
            </Link>
          ))}
          <span className="ml-auto text-xs text-slate-400">{total} événement{total > 1 ? 's' : ''}</span>
        </div>
      </section>

      {/* Grille */}
      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {events.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Aucun événement disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const statutInfo = STATUT_CONFIG[event.statut] || STATUT_CONFIG.A_VENIR;
                const imageUrl = event.medias[0]?.url;

                return (
                  <Link
                    key={event.id}
                    href={`/evenements/${event.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={imageUrl || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80'}
                        alt={event.titre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-full ${statutInfo.color}`}>
                        {statutInfo.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="font-bold text-agcm-900 text-base leading-tight mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {event.titre}
                      </h2>
                      {event.description && (
                        <p className="text-slate-500 text-sm line-clamp-2 flex-1">{event.description}</p>
                      )}
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-red-400" />
                          {formatDateFull(event.dateDebut)}
                        </div>
                        {event.lieu && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-red-400" />
                            {event.lieu}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              {page > 1 && (
                <Link
                  href={`/evenements?page=${page - 1}${statut ? `&statut=${statut}` : ''}`}
                  className="flex items-center gap-1 px-4 py-2 rounded-full bg-white border text-sm text-slate-600 hover:bg-slate-50 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </Link>
              )}
              <span className="text-sm text-slate-500 px-3">
                Page {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/evenements?page=${page + 1}${statut ? `&statut=${statut}` : ''}`}
                  className="flex items-center gap-1 px-4 py-2 rounded-full bg-red-600 text-white text-sm hover:bg-red-700 shadow-sm"
                >
                  Suivant <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
