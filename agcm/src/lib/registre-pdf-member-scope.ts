import type { Prisma } from '@prisma/client';

/** Adhérents issus de l’import PDF (technique registre-pdf-*@import.agcm.local). */
export const REGISTRE_PDF_MEMBER_SCOPE: Prisma.MemberWhereInput = {
  AND: [{ email: { startsWith: 'registre-pdf-' } }, { email: { endsWith: '@import.agcm.local' } }],
};
