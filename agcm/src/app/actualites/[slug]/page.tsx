// src/app/actualites/[slug]/page.tsx
// Page détail d'une actualité — modèle Content
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag, Clock, ChevronRight } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import ShareButtons from '@/components/app/ShareButtons';

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

  // Articles suggérés
  const relatedArticles = await prisma.content.findMany({
    where: {
      statutWorkflow: 'PUBLIE',
      visibiliteCible: 'PUBLIC_SITE',
      NOT: { id: content.id }
    },
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  const auteurMember = content.auteurPoste?.affectations?.[0]?.member;

  return (
    <>
      {/* Hero Section (Design d'origine conservé) */}
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

            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-center gap-3">
                {auteurMember ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    <Image
                      src={auteurMember.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'}
                      alt={auteurMember.nom}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <User className="w-4 h-4 text-white/40" />
                  </div>
                )}
                <p className="font-medium">
                  Par {auteurMember ? `${auteurMember.prenom} ${auteurMember.nom}` : (content.auteurPoste?.nom || 'Équipe AGCM')},
                </p>
              </div>
              <p className="flex items-center gap-2 text-white/60">
                <Clock className="w-4 h-4" />
                Publié le {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(content.createdAt)} à {new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(content.createdAt).replace(':', 'h')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="pb-16 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Colonne GAUCHE : Boutons de partage */}
            <div className="hidden lg:block lg:col-span-1">
              <ShareButtons title={content.titre} />
            </div>

            {/* Colonne MILIEU : Article principal */}
            <div className="lg:col-span-8">
              <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Image principale */}
                <div className="relative aspect-video w-full overflow-hidden border-b border-slate-100">
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
                    <div 
                      className="prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: content.contenu }}
                    />
                  ) : (
                    <p className="text-slate-400 italic text-center py-8">Aucun contenu disponible.</p>
                  )}

                  {/* Boutons de partage (Mobile seulement) */}
                  <div className="mt-12 pt-8 border-t border-slate-100 lg:hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Partager l'article</p>
                    <ShareButtons title={content.titre} />
                  </div>

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
            </div>

            {/* Colonne DROITE : Autres actualités */}
            <div className="lg:col-span-3">
              <div className="sticky top-32 space-y-8">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-200 pb-3">
                  À lire aussi
                </h4>
                <div className="space-y-6">
                  {relatedArticles.map((article) => (
                    <Link key={article.id} href={`/actualites/${article.id}`} className="group block">
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                        <Image
                          src={article.imagePrincipale || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80'}
                          alt={article.titre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h5 className="font-bold text-slate-800 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                        {article.titre}
                      </h5>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Retour */}
          <div className="mt-12 text-center">
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
