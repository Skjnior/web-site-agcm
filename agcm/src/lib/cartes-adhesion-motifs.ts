/**
 * Motifs de fond — rendu « haut de gamme » : pas de quadrillage visible,
 * uniquement des lumières douces, mesh gradients et textures quasi imperceptibles.
 */
export type CarteAdhesionMotifId =
  | 'uni'
  | 'brume'
  | 'toile'
  | 'lignes'
  | 'coins'
  | 'maille'
  | 'perle'
  | 'granite'
  | 'douce_nuit'
  | 'lin_celeste';

export type CarteAdhesionMotif = {
  id: CarteAdhesionMotifId;
  label: string;
  description: string;
  /** Classes sur la zone corps (sous bandeau) */
  bodyClass: string;
};

export const CARTES_ADHESION_MOTIFS: CarteAdhesionMotif[] = [
  {
    id: 'uni',
    label: 'Neige',
    description: 'Blanc pur calibré — institutionnel',
    bodyClass: 'bg-[#fdfdfd]',
  },
  {
    id: 'brume',
    label: 'Voile polaire',
    description: 'Studio photo — halos blancs superposés',
    bodyClass:
      'bg-[#f7f7f7] bg-[radial-gradient(circle_at_0%_0%,rgb(255_255_255)_0%,transparent_45%),radial-gradient(circle_at_100%_5%,rgb(255_255_255)_0%,transparent_40%),radial-gradient(circle_at_50%_100%,rgb(252_252_252)_0%,transparent_55%)]',
  },
  {
    id: 'toile',
    label: 'Parchemin',
    description: 'Blanc cassé chaud — légers reflets ivoire',
    bodyClass:
      'bg-[#faf8f5] bg-[radial-gradient(circle_at_15%_25%,rgb(255_254_252/0.98)_0%,transparent_50%),radial-gradient(circle_at_88%_78%,rgb(248_246_242/0.95)_0%,transparent_48%),radial-gradient(circle_at_50%_50%,rgb(255_255_255/0.4)_0%,transparent_65%)]',
  },
  {
    id: 'lignes',
    label: 'Atlas',
    description: 'Volume léger — aucune ligne dessinée, seulement du relief lumineux',
    bodyClass:
      'bg-[#fcfcfc] bg-[linear-gradient(175deg,rgb(255_255_255)_0%,rgb(250_250_249)_38%,rgb(255_255_255)_72%,rgb(252_252_251)_100%)]',
  },
  {
    id: 'coins',
    label: 'Cabinet',
    description: 'Pièce feutrée — vignette très douce au centre',
    bodyClass:
      'bg-[#fafafa] bg-[radial-gradient(ellipse_130%_100%_at_50%_48%,rgb(255_255_255)_0%,rgb(246_247_249)_72%,rgb(241_243_246)_100%)]',
  },
  {
    id: 'maille',
    label: 'Soie froissée',
    description: 'Reflet diagonal satin — zéro motif géométrique',
    bodyClass:
      'bg-[#fefefe] bg-[linear-gradient(118deg,rgb(255_255_255)_0%,rgb(251_251_252)_32%,rgb(255_255_255)_58%,rgb(248_249_250)_100%)]',
  },
  {
    id: 'perle',
    label: 'Grain museum',
    description: 'Micro-texture imperceptible — espacement large, très bas contraste',
    bodyClass:
      'bg-[#fdfdfd] bg-[radial-gradient(rgb(100_116_139/0.035)_0.55px,transparent_0.55px)] [background-size:22px_22px]',
  },
  {
    id: 'granite',
    label: 'Marbre froid',
    description: 'Transitions pierre naturelle — gris glacier sur blanc',
    bodyClass:
      'bg-[#f9fafb] bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255)_0%,transparent_35%),radial-gradient(circle_at_75%_85%,rgb(238_241_245/0.65)_0%,transparent_40%),linear-gradient(165deg,rgb(252_252_253)_0%,rgb(245_247_250)_100%)]',
  },
  {
    id: 'douce_nuit',
    label: 'Aube grise',
    description: 'Ambiance bleu acier très dilué — premium corporate',
    bodyClass:
      'bg-[#fbfcfd] bg-[radial-gradient(ellipse_95%_70%_at_50%_105%,rgb(235_240_247/0.55)_0%,transparent_58%),radial-gradient(circle_at_95%_8%,rgb(236_242_255/0.22)_0%,transparent_42%),radial-gradient(circle_at_8%_92%,rgb(241_245_249/0.5)_0%,transparent_38%)]',
  },
  {
    id: 'lin_celeste',
    label: 'Brume océan',
    description: 'Blanc glacier avec respiration cyan imperceptible',
    bodyClass:
      'bg-[#fafcfd] bg-[linear-gradient(180deg,rgb(255_255_255)_0%,rgb(248_252_254)_42%,rgb(244_249_252)_100%)] bg-[radial-gradient(circle_at_80%_30%,rgb(224_242_254/0.12)_0%,transparent_50%)]',
  },
];

export function getCarteAdhesionMotif(id: CarteAdhesionMotifId): CarteAdhesionMotif {
  return CARTES_ADHESION_MOTIFS.find((m) => m.id === id) ?? CARTES_ADHESION_MOTIFS[0];
}
