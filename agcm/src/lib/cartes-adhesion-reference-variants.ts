/**
 * Combinaisons « presque infinies » : forme du bandeau, accent latéral, cadre photo, filigrane verso.
 * Couleur = thème séparément (`referencePalette` dans les thèmes).
 */
export type ReferenceHeaderShapeId =
  | 'triangle_classique'
  | 'diagonale_large'
  | 'vague_bas'
  | 'coin_moderne';

export type ReferenceAccentId = 'demi_cercle' | 'double_bulle' | 'bande_verticale' | 'aucun';

export type ReferencePhotoFrameId = 'cercle' | 'carre_arrondi';

export type ReferenceWatermarkId = 'logo_large' | 'logo_discret' | 'geometrique' | 'aucun';

export type CarteReferenceVariants = {
  headerShape: ReferenceHeaderShapeId;
  accent: ReferenceAccentId;
  photoFrame: ReferencePhotoFrameId;
  versoWatermark: ReferenceWatermarkId;
};

/** clip-path CSS pour le bloc couleur haut (pourcentages). */
export const REFERENCE_HEADER_CLIP: Record<ReferenceHeaderShapeId, string> = {
  triangle_classique: 'polygon(0 0, 100% 0, 0 48%)',
  diagonale_large: 'polygon(0 0, 100% 0, 58% 36%, 0 52%)',
  vague_bas:
    'polygon(0 0, 100% 0, 100% 18%, 82% 26%, 62% 22%, 42% 30%, 22% 24%, 0 32%)',
  coin_moderne: 'polygon(0 0, 82% 0, 70% 14%, 52% 26%, 0 22%)',
};

export const REFERENCE_HEADER_LABEL: Record<ReferenceHeaderShapeId, string> = {
  triangle_classique: 'Triangle AGCM',
  diagonale_large: 'Diagonale large',
  vague_bas: 'Courbe douce',
  coin_moderne: 'Coin moderne',
};

export const REFERENCE_ACCENT_LABEL: Record<ReferenceAccentId, string> = {
  demi_cercle: 'Disque latéral',
  double_bulle: 'Double cercle',
  bande_verticale: 'Bande verticale',
  aucun: 'Sans accent',
};

export const REFERENCE_PHOTO_LABEL: Record<ReferencePhotoFrameId, string> = {
  cercle: 'Photo ronde',
  carre_arrondi: 'Rectangle arrondi',
};

export const REFERENCE_WATERMARK_LABEL: Record<ReferenceWatermarkId, string> = {
  logo_large: 'Filigrane logo fort',
  logo_discret: 'Filigrane léger',
  geometrique: 'Lumière diffuse (verso)',
  aucun: 'Sans filigrane',
};

export const DEFAULT_REFERENCE_VARIANTS = {
  headerShape: 'triangle_classique' satisfies ReferenceHeaderShapeId,
  accent: 'demi_cercle' satisfies ReferenceAccentId,
  photoFrame: 'cercle' satisfies ReferencePhotoFrameId,
  versoWatermark: 'logo_discret' satisfies ReferenceWatermarkId,
} as const;

export const REFERENCE_HEADER_SHAPE_IDS: ReferenceHeaderShapeId[] = [
  'triangle_classique',
  'diagonale_large',
  'vague_bas',
  'coin_moderne',
];

export const REFERENCE_ACCENT_IDS: ReferenceAccentId[] = ['demi_cercle', 'double_bulle', 'bande_verticale', 'aucun'];

export const REFERENCE_PHOTO_FRAME_IDS: ReferencePhotoFrameId[] = ['cercle', 'carre_arrondi'];

export const REFERENCE_WATERMARK_IDS: ReferenceWatermarkId[] = ['logo_large', 'logo_discret', 'geometrique', 'aucun'];
