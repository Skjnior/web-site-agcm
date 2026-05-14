// Helpers pour l’affichage public (Next/Image ne supporte pas PDF / bureautique)

const NON_IMAGE_SUFFIXES = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.csv',
  '.txt',
  '.zip',
  '.rar',
];

/** URL probablement affichable comme image (exclut PDF et pièces jointes bureau courantes). */
export function isLikelyImageAssetUrl(url: string): boolean {
  const base = (url.split('?')[0] ?? '').toLowerCase();
  return !NON_IMAGE_SUFFIXES.some((ext) => base.endsWith(ext));
}

type MediaWithUrl = { url: string; isPrincipale?: boolean };

/** Image principale : préfère une vignette marquée principale parmi les URLs images, sinon la première image. */
export function pickFirstImageMediaUrl(medias: MediaWithUrl[]): string | undefined {
  const imgs = medias.filter((m) => isLikelyImageAssetUrl(m.url));
  const principale = imgs.find((m) => m.isPrincipale);
  return principale?.url ?? imgs[0]?.url;
}
