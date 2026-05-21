import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Incrémenter après tout ajout/suppression de modèle ou changement notable du schéma Prisma.
 * Sinon `next dev` peut conserver un singleton `PrismaClient` généré *avant* `prisma generate` :
 * les nouveaux delegates sont alors `undefined` (ex. `prisma.memberRegistreCotisation.findMany`).
 */
const PRISMA_SCHEMA_REV = 4;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSchemaRev?: number;
};

/**
 * En production sur Vercel + Prisma Postgres direct, on peut très vite saturer
 * le pool de connexions (chaque lambda peut ouvrir N connexions). On force ici
 * un `connection_limit` raisonnable si l'opérateur n'en a pas mis un dans
 * `DATABASE_URL`. Cela évite les Prisma P2037 ("Too many connections") sans
 * exiger de manipuler les env vars Vercel.
 *
 * Pas appliqué pour les URLs Accelerate / Data Proxy (`prisma+postgres://`,
 * `prisma://`) qui gèrent leur propre pooling.
 */
function ensureConnectionLimit(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return rawUrl;
  // Accelerate / Data Proxy : déjà poolé côté Prisma.
  if (rawUrl.startsWith('prisma+postgres://') || rawUrl.startsWith('prisma://')) {
    return rawUrl;
  }
  if (!/^postgres(?:ql)?:\/\//.test(rawUrl)) return rawUrl;
  if (/[?&]connection_limit=/.test(rawUrl)) return rawUrl;

  const sep = rawUrl.includes('?') ? '&' : '?';
  // 1 connexion par instance lambda — limite la saturation P2037 sur Vercel.
  const extras = `connection_limit=1&pool_timeout=20`;
  return `${rawUrl}${sep}${extras}`;
}

function buildClient() {
  const devLogs: ('query' | 'error' | 'warn')[] =
    process.env.PRISMA_LOG_QUERIES === '1' ? ['query', 'error', 'warn'] : ['error', 'warn'];

  // Vercel + intégration Prisma injecte souvent `agcm_db_DATABASE_URL` et peut
  // réécraser `DATABASE_URL` à chaque deploy — on accepte les deux noms.
  const rawDbUrl =
    process.env.DATABASE_URL ?? process.env.agcm_db_DATABASE_URL;
  const datasourceUrl = ensureConnectionLimit(rawDbUrl);

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? devLogs : ['error'],
    ...(datasourceUrl ? { datasourceUrl } : {}),
  });
}

const staleSingleton =
  Boolean(globalForPrisma.prisma) &&
  globalForPrisma.prismaSchemaRev !== PRISMA_SCHEMA_REV;

if (staleSingleton && globalForPrisma.prisma) {
  void globalForPrisma.prisma.$disconnect();
}

const needsNewClient = !globalForPrisma.prisma || staleSingleton;

export const prisma = needsNewClient ? buildClient() : globalForPrisma.prisma!;

// Singleton aussi en production (recommandé Next.js / Vercel) : évite de recréer
// un PrismaClient à chaque requête dans la même instance lambda.
globalForPrisma.prisma = prisma;
globalForPrisma.prismaSchemaRev = PRISMA_SCHEMA_REV;

/**
 * Exécute une opération Prisma avec un retry léger sur les erreurs transitoires
 * de pool (P2037 « too many connections », P1008 timeout, P1017 connexion fermée).
 * Utiliser cette fonction sur les requêtes critiques effectuées au SSR
 * (Server Components, layouts) pour éviter qu'un pic de saturation ne fasse
 * tomber toute la page.
 *
 * NB : ne pas l'utiliser en boucle massive — c'est juste un filet de sécurité
 * pour les ~5 requêtes que font les layouts/dashboards.
 */
export async function prismaRetry<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; delayMs?: number } = {},
): Promise<T> {
  const retries = opts.retries ?? 3;
  const delayMs = opts.delayMs ?? 250;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const code =
        e instanceof Prisma.PrismaClientKnownRequestError ? e.code : undefined;
      const initErr = e instanceof Prisma.PrismaClientInitializationError;
      const isTransient =
        code === 'P2037' || code === 'P1008' || code === 'P1017' || initErr;
      if (!isTransient || attempt === retries) throw e;
      const wait = delayMs * Math.pow(2, attempt); // 250, 500, 1000ms
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}
