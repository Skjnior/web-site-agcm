/** Libellés français pour l’UI des logs d’audit (liste + détail). */

export const AUDIT_ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Toutes les actions' },
  { value: 'CREATE', label: 'Création' },
  { value: 'UPDATE', label: 'Modification' },
  { value: 'DELETE', label: 'Suppression' },
  { value: 'ASSIGN', label: 'Attribution / activation' },
  { value: 'INACTIVATE', label: 'Inactivation' },
  { value: 'APPROVE', label: 'Approbation' },
  { value: 'REJECT', label: 'Rejet' },
  { value: 'SUBMIT', label: 'Soumission' },
  { value: 'ARCHIVE', label: 'Archivage' },
];

export const ENTITY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tous les types' },
  { value: 'AffectationPoste', label: 'Affectation de poste' },
  { value: 'Comment', label: 'Commentaire' },
  { value: 'Content', label: 'Contenu' },
  { value: 'DemandeAdhesion', label: 'Demande d’adhésion' },
  { value: 'DemandePartenariat', label: 'Demande de partenariat' },
  { value: 'DonationIntent', label: 'Don / intention de don' },
  { value: 'Event', label: 'Événement' },
  { value: 'Mandat', label: 'Mandat' },
  { value: 'Member', label: 'Membre' },
  { value: 'Poste', label: 'Poste' },
  { value: 'Projet', label: 'Projet' },
  { value: 'User', label: 'Compte utilisateur' },
];

export function entityTypeLabel(type: string): string {
  return ENTITY_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function actionLabel(action: string): string {
  return AUDIT_ACTION_OPTIONS.find((o) => o.value === action)?.label ?? action;
}
