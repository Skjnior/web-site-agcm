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

function buildClient() {
  const devLogs: ('query' | 'error' | 'warn')[] =
    process.env.PRISMA_LOG_QUERIES === '1' ? ['query', 'error', 'warn'] : ['error', 'warn'];

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? devLogs : ['error'],
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
