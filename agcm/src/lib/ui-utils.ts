// src/lib/ui-utils.ts
// Utilitaires pour les styles uniformes de l'application

/**
 * Retourne les classes CSS pour les boutons selon leur action
 */
export function getButtonActionClasses(action: 'add' | 'edit' | 'delete' | 'view' | 'default'): string {
  const classes: Record<string, string> = {
    add: 'bg-green-600 hover:bg-green-700 text-white border-green-600',
    edit: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
    delete: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
    view: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600',
    default: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600',
  };
  return classes[action] || classes.default;
}

/**
 * Retourne les classes CSS pour les badges de statut
 */
export function getStatusBadgeClasses(status: string, isActive?: boolean): string {
  // Si isActive est fourni, utiliser cette valeur
  if (isActive !== undefined) {
    return isActive
      ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/50'
      : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50';
  }

  // Sinon, utiliser le statut
  const statusMap: Record<string, string> = {
    ACTIF: 'bg-green-100 text-green-800 border-green-200',
    INACTIF: 'bg-red-100 text-red-800 border-red-200',
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    INACTIVE: 'bg-red-100 text-red-800 border-red-200',
    ACTIFS: 'bg-green-100 text-green-800 border-green-200',
    INACTIFS: 'bg-red-100 text-red-800 border-red-200',
    // Statuts workflow
    BROUILLON: 'bg-gray-100 text-gray-800 border-gray-200',
    SOUMIS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROUVE: 'bg-blue-100 text-blue-800 border-blue-200',
    REJETE: 'bg-red-100 text-red-800 border-red-200',
    PUBLIE: 'bg-green-100 text-green-800 border-green-200',
    ARCHIVE: 'bg-gray-100 text-gray-800 border-gray-200',
    EXPIRE: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return statusMap[status.toUpperCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Retourne les classes CSS pour les badges de rôle
 */
export function getRoleBadgeClasses(role: string): string {
  const roleMap: Record<string, string> = {
    SUPER_ADMIN:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800/50',
    ADMIN:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
    MEMBER:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-600',
    ROLE_SUPER_ADMIN:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800/50',
    ROLE_ADMIN:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
    ROLE_MEMBER:
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-600',
  };

  return (
    roleMap[role] ||
    'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-600'
  );
}

/**
 * Retourne les classes CSS pour les badges d'action
 */
export function getActionBadgeClasses(action: string): string {
  const actionMap: Record<string, string> = {
    CREATE:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/45 dark:text-emerald-300 dark:border-emerald-800/50',
    UPDATE:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/45 dark:text-blue-300 dark:border-blue-800/50',
    DELETE:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/45 dark:text-red-300 dark:border-red-800/50',
    ASSIGN:
      'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/45 dark:text-violet-300 dark:border-violet-800/50',
    INACTIVATE:
      'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/50',
    ACTIVATE:
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/45 dark:text-emerald-300 dark:border-emerald-800/50',
    APPROVE:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/45 dark:text-green-300 dark:border-green-800/50',
    REJECT:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/45 dark:text-red-300 dark:border-red-800/50',
    SUBMIT:
      'bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-200 dark:border-yellow-800/50',
    ARCHIVE:
      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-600',
  };

  return (
    actionMap[action] ||
    'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:border-slate-600'
  );
}

/**
 * Retourne les classes CSS pour les badges de type de poste
 */
export function getPosteTypeBadgeClasses(isBureau: boolean): string {
  return isBureau
    ? 'bg-purple-100 text-purple-800 border-purple-200'
    : 'bg-gray-100 text-gray-800 border-gray-200';
}

