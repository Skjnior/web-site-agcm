import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Newspaper, ArrowRight, ExternalLink, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Actualités & activités - AGCM',
  description: 'Actualités, activités et annonces de l\'association',
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  ACTUALITE: { label: 'Actualité', color: 'bg-blue-500/20 text-blue-400' },
  ACTIVITE: { label: 'Activité', color: 'bg-emerald-500/20 text-emerald-400' },
  PARTAGE: { label: 'Partage', color: 'bg-purple-500/20 text-purple-400' },
  ANNONCE: { label: 'Annonce', color: 'bg-amber-500/20 text-amber-400' },
};

export default async function MesActivitesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/connexion');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.roleSysteme !== 'MEMBER') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
  const type = typeParam && ['ACTUALITE', 'ACTIVITE', 'PARTAGE', 'ANNONCE'].includes(typeParam)
    ? (typeParam as 'ACTUALITE' | 'ACTIVITE' | 'PARTAGE' | 'ANNONCE')
    : undefined;

  const where = {
    statutWorkflow: 'PUBLIE' as const,
    visibiliteCible: 'PUBLIC_SITE' as const,
    ...(type ? { type } : {}),
  };

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        titre: true,
        type: true,
        contenu: true,
        imagePrincipale: true,
        createdAt: true,
        auteurPoste: { select: { nom: true } },
      },
    }),
    prisma.content.count({ where }),
  ]);

  const filters = [
    { value: '', label: 'Tout' },
    { value: 'ACTUALITE', label: 'Actualités' },
    { value: 'ACTIVITE', label: 'Activités' },
    { value: 'PARTAGE', label: 'Partages' },
    { value: 'ANNONCE', label: 'Annonces' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-emerald-400" />
            Actualités & activités
          </h1>
          <p className="text-slate-400 mt-1">Restez informé des dernières publications</p>
        </div>
        <Link
          href="/actualites"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          Voir toutes les actualités
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/app/dashboard/mes-activites?type=${f.value}` : '/app/dashboard/mes-activites'}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              (!type && !f.value) || (type === f.value)
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-300'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Liste */}
      {contents.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-12 text-center">
          <Newspaper className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500">
            {type
              ? `Aucune publication de type "${TYPE_LABELS[type]?.label || type}" pour le moment.`
              : 'Aucune publication pour le moment.'}
          </p>
          <Link href="/actualites" className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block">
            Voir les actualités
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {contents.map((content) => {
            const typeInfo = TYPE_LABELS[content.type] || TYPE_LABELS.ACTUALITE;
            return (
              <Link
                key={content.id}
                href={`/actualites/${content.id}`}
                className="block group bg-slate-900/40 border border-slate-800/50 rounded-2xl overflow-hidden hover:border-emerald-500/30 hover:bg-slate-800/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row">
                  {content.imagePrincipale && (
                    <div className="sm:w-48 h-32 sm:h-auto bg-slate-800 relative flex-shrink-0">
                      <img
                        src={content.imagePrincipale}
                        alt={content.titre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      <span className="text-xs text-slate-500">{content.auteurPoste.nom}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(content.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {content.titre}
                    </h3>
                    {content.contenu && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        {content.contenu.replace(/<[^>]*>/g, '').slice(0, 150)}...
                      </p>
                    )}
                    <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Lire la suite <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {total > contents.length && (
        <div className="text-center">
          <Link
            href="/actualites"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            Voir les {total} publications <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
