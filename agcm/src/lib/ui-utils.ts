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
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
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
    SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    ADMIN: 'bg-blue-100 text-blue-800 border-blue-200',
    MEMBER: 'bg-gray-100 text-gray-800 border-gray-200',
    ROLE_SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    ROLE_ADMIN: 'bg-blue-100 text-blue-800 border-blue-200',
    ROLE_MEMBER: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return roleMap[role] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Retourne les classes CSS pour les badges d'action
 */
export function getActionBadgeClasses(action: string): string {
  const actionMap: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-800 border-green-200',
    UPDATE: 'bg-blue-100 text-blue-800 border-blue-200',
    DELETE: 'bg-red-100 text-red-800 border-red-200',
    ASSIGN: 'bg-purple-100 text-purple-800 border-purple-200',
    INACTIVATE: 'bg-orange-100 text-orange-800 border-orange-200',
    ACTIVATE: 'bg-green-100 text-green-800 border-green-200',
    APPROVE: 'bg-green-100 text-green-800 border-green-200',
    REJECT: 'bg-red-100 text-red-800 border-red-200',
    SUBMIT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ARCHIVE: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return actionMap[action] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Retourne les classes CSS pour les badges de type de poste
 */
export function getPosteTypeBadgeClasses(isBureau: boolean): string {
  return isBureau
    ? 'bg-purple-100 text-purple-800 border-purple-200'
    : 'bg-gray-100 text-gray-800 border-gray-200';
}

