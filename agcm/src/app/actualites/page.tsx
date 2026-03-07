// src/app/actualites/page.tsx
// Page Actualités — utilise le modèle Content (statutWorkflow=PUBLIE, visibiliteCible=PUBLIC_SITE)
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ChevronLeft, ChevronRight, Filter, Newspaper } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Actualités - AGCM',
  description: "Toutes les actualités de l'Association des Guinéens de La Charente-Maritime.",
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  ACTUALITE: { label: 'Actualité', color: 'bg-blue-100 text-blue-700' },
  ACTIVITE: { label: 'Activité', color: 'bg-green-100 text-green-700' },
  PARTAGE: { label: 'Partage', color: 'bg-purple-100 text-purple-700' },
  ANNONCE: { label: 'Annonce', color: 'bg-red-100 text-red-700' },
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Aujourd'hui";
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  const months = Math.floor(days / 30);
  return `Il y a ${months} mois`;
}

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

export default async function ActualitesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = parseParam(params.type);
  const pageParam = parseParam(params.page);
  const PAGE_SIZE = 12;
  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    statutWorkflow: 'PUBLIE' as const,
    visibiliteCible: 'PUBLIC_SITE' as const,
    ...(type ? { type: type as 'ACTUALITE' | 'ACTIVITE' | 'PARTAGE' | 'ANNONCE' } : {}),
  };

  const [total, contents] = await Promise.all([
    prisma.content.count({ where }),
    prisma.content.findMany({
      where,
      select: {
        id: true,
        type: true,
        titre: true,
        contenu: true,
        imagePrincipale: true,
        createdAt: true,
        auteurPoste: { select: { nom: true } },
      },
      orderBy: { createdAt: 'desc' },
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
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-5 right-10 w-48 h-48 bg-red-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
            <Newspaper className="w-4 h-4" />
            Publications de l&apos;AGCM
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Actualités</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Découvrez toutes les nouvelles, activités et annonces de l&apos;association.
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
            { value: 'ACTUALITE', label: 'Actualités' },
            { value: 'ACTIVITE', label: 'Activités' },
            { value: 'ANNONCE', label: 'Annonces' },
            { value: 'PARTAGE', label: 'Partages' },
          ].map((f) => (
            <Link
              key={f.value}
              href={f.value ? `/actualites?type=${f.value}` : '/actualites'}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${(type || '') === f.value
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {f.label}
            </Link>
          ))}
          <span className="ml-auto text-xs text-slate-400">{total} publication{total > 1 ? 's' : ''}</span>
        </div>
      </section>

      {/* Grille */}
      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {contents.length === 0 ? (
            <div className="text-center py-20">
              <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Aucune publication disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((actu) => {
                const typeInfo = TYPE_LABELS[actu.type] || { label: actu.type, color: 'bg-slate-100 text-slate-600' };
                return (
                  <Link
                    key={actu.id}
                    href={`/actualites/${actu.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={actu.imagePrincipale || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80'}
                        alt={actu.titre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-full ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h2 className="font-bold text-agcm-900 text-base leading-tight mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {actu.titre}
                      </h2>
                      {actu.contenu && (
                        <p className="text-slate-500 text-sm line-clamp-3 flex-1">{actu.contenu}</p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(actu.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateFull(actu.createdAt)}
                        </span>
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
                  href={`/actualites?page=${page - 1}${type ? `&type=${type}` : ''}`}
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
                  href={`/actualites?page=${page + 1}${type ? `&type=${type}` : ''}`}
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
