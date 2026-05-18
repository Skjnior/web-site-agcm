// Périmètre fonctionnel par poste du bureau (aligné sur bureau-reglement-seed / règlement intérieur)

import type { RoleSysteme } from '@prisma/client';

export const BUREAU_MODULES = [
  'contents',
  'projets',
  'evenements',
  'galerie',
  'partenaires',
  'traces',
  'paiements',
  'chat',
  'notifications',
] as const;

export type BureauModule = (typeof BUREAU_MODULES)[number];

export const ALL_BUREAU_MODULES: BureauModule[] = [...BUREAU_MODULES];

/** Noms de postes = libellés exacts seed (`BUREAU_EXECUTIF_POSTES`) */
type PerimetreRow = { modules: BureauModule[]; focus: string };

const PERIMETRE_PAR_POSTE: Record<string, PerimetreRow> = {
  Président: {
    modules: [...ALL_BUREAU_MODULES],
    focus: 'Coordination du bureau, pilotage stratégique et validation.',
  },
  'Secrétaire administratif': {
    modules: ['contents', 'traces', 'chat', 'notifications'],
    focus:
      'Archives, PV et correspondance ; rédaction d’activités liées à la gestion administrative et à la traçabilité.',
  },
  'Secrétaire chargé à la formation et directeur des finances': {
    modules: ['contents', 'projets', 'evenements', 'traces', 'paiements', 'chat', 'notifications'],
    focus: 'Formations, montage de projets et d’événements, validation des flux financiers avec le président.',
  },
  Trésorier: {
    modules: ['traces', 'paiements', 'contents', 'chat', 'notifications'],
    focus: 'Comptes, cotisations et rapports financiers (activités pour bilans / communications financières).',
  },
  'Secrétaire chargé à l\'organisation': {
    modules: ['projets', 'evenements', 'traces', 'chat', 'notifications'],
    focus: 'Logistique, faisabilité des activités et des événements.',
  },
  'Secrétaire chargé à l\'information et à la communication': {
    modules: ['contents', 'evenements', 'galerie', 'partenaires', 'traces', 'chat', 'notifications'],
    focus: 'Communication, galerie photos, partenaires, convocations et contenus publics.',
  },
  'Secrétaire chargé aux affaires sociales et à l\'intégration': {
    modules: ['evenements', 'contents', 'traces', 'chat', 'notifications'],
    focus: 'Événements sociaux, accueil et intégration des adhérents.',
  },
  'Secrétaire chargé à la sécurité': {
    modules: ['evenements', 'projets', 'traces', 'chat', 'notifications'],
    focus: 'Sécurité des activités, évaluation des risques, logistique sensible.',
  },
  'Secrétaire chargé aux sports, à la culture et à l\'environnement': {
    modules: ['contents', 'projets', 'evenements', 'traces', 'chat', 'notifications'],
    focus: 'Activités sportives, culturelles et sensibilisation environnementale.',
  },
};

export function getBureauPerimetreForPostes(posteNoms: string[]): {
  modules: Set<BureauModule>;
  focusLines: string[];
} {
  if (posteNoms.length === 0) {
    return { modules: new Set(ALL_BUREAU_MODULES), focusLines: [] };
  }

  const modules = new Set<BureauModule>();
  const focusLines: string[] = [];
  let anyUnknown = false;

  for (const nom of posteNoms) {
    const row = PERIMETRE_PAR_POSTE[nom];
    if (!row) {
      anyUnknown = true;
      break;
    }
    for (const m of row.modules) modules.add(m);
    if (row.focus && !focusLines.includes(row.focus)) focusLines.push(row.focus);
  }

  if (anyUnknown || modules.size === 0) {
    return {
      modules: new Set(ALL_BUREAU_MODULES),
      focusLines: ['Poste non référencé dans le périmètre : accès complet aux modules bureau (comportement de repli).'],
    };
  }

  return { modules, focusLines };
}

export function bureauMemberHasModule(
  roleSysteme: RoleSysteme,
  posteNoms: string[],
  module: BureauModule
): boolean {
  if (roleSysteme === 'SUPER_ADMIN' || roleSysteme === 'ADMIN') {
    return true;
  }
  const { modules } = getBureauPerimetreForPostes(posteNoms);
  return modules.has(module);
}

/** Filtrage sidebar : href → module requis */
export function bureauHrefToModule(href: string): BureauModule | null {
  const path = href.split('?')[0];
  const rules: [string, BureauModule][] = [
    ['/bureau/contents', 'contents'],
    ['/bureau/projets', 'projets'],
    ['/bureau/evenements', 'evenements'],
    ['/bureau/traces', 'traces'],
    ['/bureau/galerie', 'galerie'],
    ['/bureau/partenaires', 'partenaires'],
    ['/admin/galerie', 'galerie'],
    ['/admin/partenaires', 'partenaires'],
    ['/bureau/registre-cotisations', 'paiements'],
    ['/dashboard/paiements', 'paiements'],
    ['/app/notifications', 'notifications'],
    ['/app/chat', 'chat'],
  ];
  for (const [prefix, mod] of rules) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return mod;
    }
  }
  return null;
}

export function isBureauSidebarHrefAllowed(href: string, modules: Set<BureauModule>): boolean {
  const required = bureauHrefToModule(href);
  if (required === null) return true;
  return modules.has(required);
}
