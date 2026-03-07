// src/lib/role-utils.ts
// Utilitaires pour formater et traduire les rôles

/**
 * Traduit un rôle système en français lisible
 */
export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    'SUPER_ADMIN': 'Super Administrateur',
    'ADMIN': 'Administrateur',
    'MEMBER': 'Membre',
    // Support pour les anciens formats
    'ROLE_MEMBER': 'Membre',
  };

  return roleMap[role] || role;
}

/**
 * Retourne une description courte du rôle
 */
export function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    'SUPER_ADMIN': 'Accès complet au système',
    'ADMIN': 'Gestion et validation des contenus',
    'MEMBER': 'Accès membre standard',
    'ROLE_MEMBER': 'Accès membre standard',
  };

  return descriptions[role] || '';
}

/**
 * Retourne la couleur du badge selon le rôle
 */
export function getRoleBadgeVariant(role: string): 'default' | 'outline' | 'secondary' {
  if (role === 'SUPER_ADMIN') {
    return 'default';
  }
  if (role === 'ADMIN') {
    return 'outline';
  }
  return 'secondary';
}


