import { PrismaClient } from '@prisma/client';

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
  const extras = `connection_limit=3&pool_timeout=20`;
  return `${rawUrl}${sep}${extras}`;
}

function buildClient() {
  const devLogs: ('query' | 'error' | 'warn')[] =
    process.env.PRISMA_LOG_QUERIES === '1' ? ['query', 'error', 'warn'] : ['error', 'warn'];

  const datasourceUrl = ensureConnectionLimit(process.env.DATABASE_URL);

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

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaRev = PRISMA_SCHEMA_REV;
}
