/**
 * Thèmes pour cartes d’adhérent — bandeaux, accents et cadre photo (portrait).
 */
export type CarteAdhesionThemeId =
  | 'officielle_orange'
  | 'agcm_vert'
  | 'marine'
  | 'ivoire'
  | 'ardoise'
  | 'guinee_tricolor'
  | 'corail'
  | 'indigo_nuit'
  | 'cyan_atlantique'
  | 'terracotta'
  | 'violet_royal';

export type CarteAdhesionTheme = {
  id: CarteAdhesionThemeId;
  label: string;
  description: string;
  /** Bandeau bas */
  bannerStrip: string;
  /** Barre d’accent gauche (fonction bureau) — largeur + couleur */
  bureauStripe: string;
  /** Badge statut */
  chipStatut: string;
  /** Dégradé sur l’image du bandeau haut */
  headerOverlay: string;
  /** Cadre photo (mode portrait centré) */
  photoFrame: string;
  /** Couleurs pour le modèle carte plastique (recto / verso) */
  referencePalette: {
    primary: string;
    primaryDark: string;
    soft: string;
  };
};

export const CARTES_ADHESION_THEMES: CarteAdhesionTheme[] = [
  {
    id: 'officielle_orange',
    label: 'Orange officiel',
    description: 'Énergie et visibilité — style carte établissement',
    bannerStrip: 'bg-gradient-to-r from-orange-600 to-orange-500',
    bureauStripe: 'border-l-[5px] border-l-orange-500',
    chipStatut: 'border border-orange-100 bg-orange-50/90 text-orange-950',
    headerOverlay: 'from-orange-950/90 via-slate-900/55 to-slate-800/30',
    photoFrame: 'ring-[3px] ring-orange-200/80 shadow-xl shadow-orange-900/15',
    referencePalette: { primary: '#ea580c', primaryDark: '#c2410c', soft: '#ffedd5' },
  },
  {
    id: 'agcm_vert',
    label: 'Vert AGCM',
    description: 'Identité association — frais et lisible',
    bannerStrip: 'bg-gradient-to-r from-emerald-700 to-emerald-600',
    bureauStripe: 'border-l-[5px] border-l-emerald-600',
    chipStatut: 'border border-emerald-200 bg-emerald-50 text-emerald-900',
    headerOverlay: 'from-emerald-950/92 via-emerald-900/55 to-slate-900/35',
    photoFrame: 'ring-[3px] ring-emerald-200/90 shadow-xl shadow-emerald-900/15',
    referencePalette: { primary: '#059669', primaryDark: '#047857', soft: '#d1fae5' },
  },
  {
    id: 'marine',
    label: 'Bleu marine',
    description: 'Institutionnel et sérieux',
    bannerStrip: 'bg-gradient-to-r from-blue-950 to-blue-800',
    bureauStripe: 'border-l-[5px] border-l-amber-400',
    chipStatut: 'border border-blue-100 bg-blue-50 text-blue-950',
    headerOverlay: 'from-blue-950/95 via-slate-900/60 to-slate-800/30',
    photoFrame: 'ring-[3px] ring-blue-200/70 shadow-xl shadow-blue-950/25',
    referencePalette: { primary: '#1d4ed8', primaryDark: '#1e3a8a', soft: '#dbeafe' },
  },
  {
    id: 'ivoire',
    label: 'Ivoire & bordeaux',
    description: 'Classique associations — élégant',
    bannerStrip: 'bg-gradient-to-r from-[#6d2036] to-[#8B2942]',
    bureauStripe: 'border-l-[5px] border-l-[#8B2942]',
    chipStatut: 'border border-stone-200 bg-stone-50 text-stone-800',
    headerOverlay: 'from-stone-900/88 via-stone-800/48 to-amber-900/25',
    photoFrame: 'ring-[3px] ring-stone-300/90 shadow-xl shadow-stone-900/15',
    referencePalette: { primary: '#8B2942', primaryDark: '#6d2036', soft: '#fce7f3' },
  },
  {
    id: 'ardoise',
    label: 'Ardoise tech',
    description: 'Moderne anthracite et accent bleu ciel',
    bannerStrip: 'bg-gradient-to-r from-slate-900 to-slate-700',
    bureauStripe: 'border-l-[5px] border-l-sky-500',
    chipStatut: 'border border-slate-200 bg-slate-50 text-slate-900',
    headerOverlay: 'from-slate-950/95 via-slate-800/55 to-slate-600/28',
    photoFrame: 'ring-[3px] ring-sky-200/60 shadow-xl shadow-slate-900/25',
    referencePalette: { primary: '#475569', primaryDark: '#1e293b', soft: '#e2e8f0' },
  },
  {
    id: 'guinee_tricolor',
    label: 'Guinée tricolore',
    description: 'Hommage rouge · jaune · vert',
    bannerStrip: 'bg-gradient-to-r from-red-700 via-yellow-500 to-green-700',
    bureauStripe: 'border-l-[5px] border-l-green-700',
    chipStatut: 'border border-yellow-100 bg-yellow-50 text-green-950',
    headerOverlay: 'from-red-950/85 via-yellow-900/35 to-green-950/60',
    photoFrame: 'ring-[3px] ring-yellow-200/90 shadow-xl shadow-green-900/20',
    referencePalette: { primary: '#15803d', primaryDark: '#14532d', soft: '#bbf7d0' },
  },
  {
    id: 'corail',
    label: 'Corail doux',
    description: 'Accueillant, ton chaud contemporain',
    bannerStrip: 'bg-gradient-to-r from-rose-600 to-orange-400',
    bureauStripe: 'border-l-[5px] border-l-rose-500',
    chipStatut: 'border border-rose-100 bg-rose-50 text-rose-950',
    headerOverlay: 'from-rose-950/88 via-orange-900/40 to-slate-800/25',
    photoFrame: 'ring-[3px] ring-rose-200/80 shadow-xl shadow-rose-900/15',
    referencePalette: { primary: '#e11d48', primaryDark: '#be123c', soft: '#ffe4e6' },
  },
  {
    id: 'indigo_nuit',
    label: 'Indigo nuit',
    description: 'Contraste profond et violet discret',
    bannerStrip: 'bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-900',
    bureauStripe: 'border-l-[5px] border-l-violet-400',
    chipStatut: 'border border-indigo-100 bg-indigo-50 text-indigo-950',
    headerOverlay: 'from-indigo-950/95 via-indigo-900/50 to-slate-900/35',
    photoFrame: 'ring-[3px] ring-indigo-200/70 shadow-xl shadow-indigo-950/30',
    referencePalette: { primary: '#4f46e5', primaryDark: '#3730a3', soft: '#e0e7ff' },
  },
  {
    id: 'cyan_atlantique',
    label: 'Cyan atlantique',
    description: 'Clair, maritime, très lisible',
    bannerStrip: 'bg-gradient-to-r from-cyan-700 to-teal-600',
    bureauStripe: 'border-l-[5px] border-l-teal-500',
    chipStatut: 'border border-cyan-100 bg-cyan-50 text-teal-950',
    headerOverlay: 'from-cyan-950/88 via-teal-900/45 to-slate-800/28',
    photoFrame: 'ring-[3px] ring-cyan-200/80 shadow-xl shadow-teal-900/18',
    referencePalette: { primary: '#0d9488', primaryDark: '#0f766e', soft: '#ccfbf1' },
  },
  {
    id: 'terracotta',
    label: 'Terre cuite',
    description: 'Chaleur méditerranéenne, sobre',
    bannerStrip: 'bg-gradient-to-r from-orange-900 via-[#b45328] to-[#c2410c]',
    bureauStripe: 'border-l-[5px] border-l-orange-700',
    chipStatut: 'border border-orange-100 bg-orange-50 text-orange-950',
    headerOverlay: 'from-orange-950/90 via-stone-800/45 to-amber-900/30',
    photoFrame: 'ring-[3px] ring-orange-300/70 shadow-xl shadow-orange-950/20',
    referencePalette: { primary: '#c2410c', primaryDark: '#9a3412', soft: '#ffedd5' },
  },
  {
    id: 'violet_royal',
    label: 'Violet royal',
    description: 'Cérémoniel sans être criard',
    bannerStrip: 'bg-gradient-to-r from-purple-900 to-fuchsia-800',
    bureauStripe: 'border-l-[5px] border-l-fuchsia-400',
    chipStatut: 'border border-purple-100 bg-purple-50 text-purple-950',
    headerOverlay: 'from-purple-950/92 via-fuchsia-900/48 to-slate-900/30',
    photoFrame: 'ring-[3px] ring-purple-200/75 shadow-xl shadow-purple-950/25',
    referencePalette: { primary: '#7c3aed', primaryDark: '#5b21b6', soft: '#ede9fe' },
  },
];

export function getCarteAdhesionTheme(id: CarteAdhesionThemeId): CarteAdhesionTheme {
  return CARTES_ADHESION_THEMES.find((t) => t.id === id) ?? CARTES_ADHESION_THEMES[0];
}
