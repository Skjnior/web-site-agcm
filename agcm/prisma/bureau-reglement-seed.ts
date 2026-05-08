/**
 * Bureau exécutif — aligné sur le règlement intérieur AGCM (art. 8 et 9).
 * Le post unique « Secrétaire chargé à la formation et directeur des finances »
 * remplace l’ancien « Directeur des finances » seul, conformément à la demande projet.
 *
 * Mot de passe unique de seed (tous les comptes générés par prisma/seed.ts) —
 * voir docs/COMPTES_BUREAU_SEED.md
 */
export const BUREAU_SEED_PASSWORD = 'AGCM-Bureau-Test-2026!';
export const BUREAU_SEED_DOMAIN = 'seed.agcm.local';

/** Descriptions synthétiques / art. 9 du règlement + extension « formation » pour le poste fusionné */
export const BUREAU_EXECUTIF_POSTES: { nom: string; description: string }[] = [
  {
    nom: 'Président',
    description:
      "Représentant de l'association dans la vie civile ; dirige le bureau exécutif ; préside les AG ; plan d'action annuel ; coordonne les flux financiers ; exécute les décisions de l'AG.",
  },
  {
    nom: 'Secrétaire administratif',
    description:
      "Gestion administrative et judiciaire ; documentation du budget et des flux d'argent ; archives et PV ; correspondance.",
  },
  {
    nom: 'Secrétaire chargé à la formation et directeur des finances',
    description:
      "Formation des membres et montée en compétences ; études et devis des projets et événements ; validation des entrées/sorties d'argent avec le président ; bilan financier avec le trésorier (art. 9).",
  },
  {
    nom: 'Trésorier',
    description:
      "Gestion des comptes ; rapport financier en AG ; cotisations ; décaissements sur demande validée par le directeur des finances et le président.",
  },
  {
    nom: 'Secrétaire chargé à l\'organisation',
    description:
      "Logistique matérielle ; faisabilité des activités et événements ; coopération avec le secrétaire à la sécurité.",
  },
  {
    nom: 'Secrétaire chargé à l\'information et à la communication',
    description:
      "Porte-parole ; ordre en AG ; communication numérique ; convocations AG ; vulgarisation des décisions.",
  },
  {
    nom: 'Secrétaire chargé aux affaires sociales et à l\'intégration',
    description:
      "Coordination des événements sociaux ; accueil et intégration des nouveaux adhérents.",
  },
  {
    nom: 'Secrétaire chargé à la sécurité',
    description:
      "Sécurité des activités ; évaluation des risques ; consignes et propositions pour le bon déroulement.",
  },
  {
    nom: 'Secrétaire chargé aux sports, à la culture et à l\'environnement',
    description:
      "Coordination des activités récréatives ; plans d'action sensibilisation et préservation de l'environnement.",
  },
];

/** Une ligne par poste : email local part + rôle système (le président a les droits d’approbation super-admin) */
export const BUREAU_SEED_ACCOUNTS: { localPart: string; roleSysteme: 'SUPER_ADMIN' | 'MEMBER' }[] = [
  { localPart: 'president', roleSysteme: 'SUPER_ADMIN' },
  { localPart: 'secretaire.administratif', roleSysteme: 'MEMBER' },
  { localPart: 'formation.finance', roleSysteme: 'MEMBER' },
  { localPart: 'tresorier', roleSysteme: 'MEMBER' },
  { localPart: 'organisation', roleSysteme: 'MEMBER' },
  { localPart: 'communication', roleSysteme: 'MEMBER' },
  { localPart: 'affaires.sociales', roleSysteme: 'MEMBER' },
  { localPart: 'securite', roleSysteme: 'MEMBER' },
  { localPart: 'sports.culture.environnement', roleSysteme: 'MEMBER' },
];

export const NOMBRE_POSTES_BUREAU = BUREAU_EXECUTIF_POSTES.length;
