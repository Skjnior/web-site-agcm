import type { SitePublicPayload } from '@/types/site-public';

const MERGE_KEYS: (keyof Omit<SitePublicPayload, 'version'>)[] = [
  'hero',
  'axes',
  'history',
  'jeunesse',
  'guineeSection',
  'projetsLocaux',
  'adhesion',
  'partenaires',
  'faq',
  'contact',
  'gallery',
  'about',
];

/** Fusionne un patch partiel dans le payload courant (remplacement par clé racine). */
export function mergeSitePublicPayload(
  base: SitePublicPayload,
  patch: Partial<SitePublicPayload>,
): SitePublicPayload {
  const out: SitePublicPayload = { ...base, version: 1 };
  for (const k of MERGE_KEYS) {
    if (patch[k] !== undefined) {
      Object.assign(out, { [k]: patch[k] });
    }
  }
  return out;
}

/** N’autorise que les clés connues du payload (évite injection de champs arbitraires). */
export function pickSitePublicPatch(raw: unknown): Partial<SitePublicPayload> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const src = raw as Record<string, unknown>;
  const out: Partial<SitePublicPayload> = {};
  for (const k of MERGE_KEYS) {
    if (src[k as string] !== undefined) {
      Object.assign(out, { [k]: src[k as string] });
    }
  }
  return out;
}
