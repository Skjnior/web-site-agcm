// src/app/actualites/[id]/page.tsx
// Page détail d'une actualité — modèle Content
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react';
import Footer from '@/components/layout/Footer';

type PageProps = {
  params: Promise<{ slug: string }>;
};

const TYPE_LABELS: Record<string, string> = {
  ACTUALITE: 'Actualité',
  ACTIVITE: 'Activité',
  PARTAGE: 'Partage',
  ANNONCE: 'Annonce',
};

function formatDateFull(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await prisma.content.findUnique({
    where: { id: slug },
    select: { titre: true, contenu: true },
  });
  if (!content) return { title: 'Actualité introuvable - AGCM' };
  return {
    title: `${content.titre} - AGCM`,
    description: content.contenu?.slice(0, 150) ?? undefined,
  };
}

export default async function ActualiteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await prisma.content.findUnique({
    where: { id: slug },
    include: {
      auteurPoste: {
        select: {
          nom: true,
          affectations: {
            where: { statut: 'ACTIF' },
            take: 1,
            include: {
              member: { select: { prenom: true, nom: true, photoUrl: true } },
            },
          },
        },
      },
    },
  });

  if (!content || content.statutWorkflow !== 'PUBLIE' || content.visibiliteCible !== 'PUBLIC_SITE') {
    notFound();
  }

  const auteurMember = content.auteurPoste?.affectations?.[0]?.member;

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
            href="/actualites"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux actualités
          </Link>

          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold uppercase tracking-wide">
                {TYPE_LABELS[content.type] || content.type}
              </span>
              {content.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-white/40" />
                  {content.tags.map((tag) => (
                    <span key={tag} className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-8">
              {content.titre}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDateFull(content.createdAt)}
              </span>
              {auteurMember ? (
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20">
                    <Image
                      src={auteurMember.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'}
                      alt={auteurMember.nom}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span>{auteurMember.prenom} {auteurMember.nom}</span>
                </div>
              ) : (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {content.auteurPoste?.nom || 'Équipe AGCM'}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="pb-16 bg-slate-50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
          <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Image principale */}
            <div className="relative aspect-[16/7] w-full overflow-hidden border-b border-slate-100">
              <Image
                src={content.imagePrincipale || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80'}
                alt={content.titre}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="p-8 md:p-12">

              {/* Contenu */}
              {content.contenu ? (
                <div className="prose prose-slate max-w-none text-base leading-relaxed whitespace-pre-line">
                  {content.contenu}
                </div>
              ) : (
                <p className="text-slate-400 italic">Aucun contenu disponible.</p>
              )}

              {/* Lien externe */}
              {content.lienExterne && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <a
                    href={content.lienExterne}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    En savoir plus →
                  </a>
                </div>
              )}
            </div>
          </article>

          {/* Retour */}
          <div className="mt-8 text-center">
            <Link
              href="/actualites"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Voir toutes les actualités
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
