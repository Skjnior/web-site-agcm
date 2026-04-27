/**
 * Navigation publique (site vitrine) : une seule source de vérité pour la navbar et le footer.
 * Préférence : routes dédiées ; ancres /#… uniquement quand le contenu n’existe que sur l’accueil (Nos axes, formulaire de don).
 */
export type PublicNavItem = {
  href: string;
  label: string;
  /** Afficher dans la barre du haut (le footer peut lister plus d’entrées si besoin) */
  inTopNav: boolean;
};

export const publicSiteNavigation: PublicNavItem[] = [
  { href: '/', label: 'Accueil', inTopNav: false },
  { href: '/#axes', label: 'Nos axes', inTopNav: true },
  { href: '/a-propos', label: 'À propos', inTopNav: true },
  { href: '/formations', label: 'Formations', inTopNav: true },
  { href: '/actualites', label: 'Actualités', inTopNav: true },
  { href: '/evenements', label: 'Événements', inTopNav: true },
  { href: '/ressources', label: 'Ressources', inTopNav: true },
  { href: '/#dons', label: 'Faire un don', inTopNav: true },
  { href: '/contact', label: 'Contact', inTopNav: true },
];

export const publicNavForHeader = publicSiteNavigation.filter((item) => item.inTopNav);

/** Liens “Navigation” du footer : Accueil + mêmes entrées que la barre du haut (ordre cohérent) */
export const publicNavFooterQuickLinks = [
  { href: '/', name: 'Accueil' },
  ...publicNavForHeader.map(({ href, label }) => ({ href, name: label })),
];
