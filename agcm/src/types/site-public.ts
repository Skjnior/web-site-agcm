/** Icônes utilisées dans les cartes hero (landing). */
export type SiteHighlightIcon = 'heart' | 'book' | 'globe';

export interface SiteGalleryItem {
  id: string;
  url: string;
  alt: string;
}

export interface SitePartnerCard {
  name: string;
  description: string;
  logo: string;
  link?: string;
  type: string;
}

/** Données éditoriales du site vitrine — sérialisées dans `SitePublicPage.payload`. */
export interface SitePublicPayload {
  version: 1;
  hero: {
    badge: string;
    title: string;
    paragraph: string;
    backgroundUrl: string;
    highlights: Array<{ title: string; text: string; icon: SiteHighlightIcon }>;
  };
  axes: Array<{ title: string; text: string }>;
  history: {
    tagline: string;
    title: string;
    body: string;
    valeurLabels: string[];
    bureauTeaser: string;
  };
  jeunesse: { tagline: string; title: string; items: string[] };
  guineeSection: { eyebrow: string; title: string; intro: string };
  projetsLocaux: {
    eyebrow: string;
    title: string;
    lead: string;
    imageUrl: string;
    bullets: string[];
  };
  adhesion: { intro: string; bullets: string[]; cotisationHint: string };
  partenaires: { eyebrow: string; title: string; items: string[] };
  faq: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: Array<{ q: string; a: string }>;
  };
  contact: {
    eyebrow: string;
    title: string;
    lead: string;
    phone: string;
    whatsappLine: string;
    regionLine: string;
    mapEmbedUrl: string;
  };
  gallery: SiteGalleryItem[];
  about: {
    hero: {
      backgroundUrl: string;
      badge: string;
      title: string;
      subtitle: string;
    };
    partners: {
      eyebrow: string;
      title: string;
      lead: string;
      items: SitePartnerCard[];
    };
  };
}
