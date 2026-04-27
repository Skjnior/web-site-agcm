import type { ContentType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const VALID_TYPES: ContentType[] = ['ACTIVITE', 'ACTUALITE', 'PARTAGE', 'ANNONCE'];

/** Valeurs du formulaire historique → enum Prisma `ContentType` */
const LEGACY_CATEGORY_MAP: Record<string, ContentType> = {
  EVENEMENT: 'ANNONCE',
  FORMATION: 'ACTIVITE',
  REGLEMENTATION: 'PARTAGE',
  VIE_ASSOCIATIVE: 'ACTIVITE',
  PARTENARIAT: 'PARTAGE',
  AUTRE: 'ACTUALITE',
  ACTUALITE: 'ACTUALITE',
  ACTIVITE: 'ACTIVITE',
  PARTAGE: 'PARTAGE',
  ANNONCE: 'ANNONCE',
};

export function parseTagsInput(input: unknown): string[] {
  if (typeof input !== 'string') return [];
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function mapFormCategoryToContentType(cat: unknown): ContentType {
  const c = typeof cat === 'string' ? cat.trim() : '';
  if (VALID_TYPES.includes(c as ContentType)) return c as ContentType;
  return LEGACY_CATEGORY_MAP[c] ?? 'ACTUALITE';
}

export type ActualiteFormBody = Record<string, unknown>;

/** Corps JSON du formulaire admin → données valides pour `Content` (sans relations). */
export function mapBodyToContentFields(body: ActualiteFormBody) {
  const titre = typeof body.titre === 'string' ? body.titre.trim() : '';
  const contenuRaw = body.contenu ?? body.content;
  const contenu = typeof contenuRaw === 'string' ? contenuRaw : null;

  const typeSource = body.type ?? body.categorie;
  const type = mapFormCategoryToContentType(typeSource);

  const tags = parseTagsInput(body.tags);

  const imageRaw = body.imageUrl ?? body.imagePrincipale;
  const imagePrincipale =
    typeof imageRaw === 'string' && imageRaw.trim() !== '' ? imageRaw.trim() : null;

  const published = Boolean(body.published);

  let approvedAt: Date | null | undefined;
  if (Object.prototype.hasOwnProperty.call(body, 'datePublication')) {
    if (typeof body.datePublication === 'string') {
      const d = body.datePublication.trim();
      if (d === '') approvedAt = null;
      else {
        const parsed = new Date(d);
        approvedAt = Number.isNaN(parsed.getTime()) ? null : parsed;
      }
    }
  }

  return {
    titre,
    contenu,
    type,
    tags,
    imagePrincipale,
    statutWorkflow: published ? ('PUBLIE' as const) : ('BROUILLON' as const),
    approvedAt,
  };
}

/** Pour création : mandat actif + poste de l’admin ou premier poste actif. */
export async function resolveMandatAndAuteurPoste(userId: string): Promise<{
  mandatId: string;
  auteurPosteId: string;
} | null> {
  const mandat = await prisma.mandat.findFirst({
    where: { statut: 'ACTIF' },
    orderBy: { dateDebut: 'desc' },
  });
  if (!mandat) return null;

  const member = await prisma.member.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (member) {
    const affectation = await prisma.affectationPoste.findFirst({
      where: {
        memberId: member.id,
        mandatId: mandat.id,
        statut: 'ACTIF',
      },
      select: { posteId: true },
    });
    if (affectation) {
      return { mandatId: mandat.id, auteurPosteId: affectation.posteId };
    }
  }

  const firstPoste = await prisma.poste.findFirst({
    where: { estActif: true },
    orderBy: { nom: 'asc' },
    select: { id: true },
  });
  if (!firstPoste) return null;
  return { mandatId: mandat.id, auteurPosteId: firstPoste.id };
}

export function getAdminSessionRole(sessionUser: unknown): string {
  const u = sessionUser as { roleSysteme?: string; role?: string } | null | undefined;
  return u?.roleSysteme || u?.role || '';
}

export function isAdminRole(role: string): boolean {
  return ['ADMIN', 'SUPER_ADMIN'].includes(role);
}
