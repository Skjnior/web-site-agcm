// lib/permissions.ts

/**
 * Vérifie si un utilisateur peut agir sur un autre utilisateur
 * @param currentUserRole - Rôle de l'utilisateur actuel
 * @param targetUserRole - Rôle de l'utilisateur cible
 * @returns true si l'utilisateur peut agir, false sinon
 */
export function canActOnUser(currentUserRole: string, targetUserRole: string): boolean {
  // Normaliser les rôles (supporter ROLE_ et sans ROLE_)
  const normalizedCurrent = currentUserRole.replace('ROLE_', '');
  const normalizedTarget = targetUserRole.replace('ROLE_', '');
  
  // SUPER_ADMIN peut agir sur tout le monde
  if (normalizedCurrent === 'SUPER_ADMIN') {
    return true;
  }

  // ADMIN ne peut pas agir sur SUPER_ADMIN
  if (normalizedCurrent === 'ADMIN' && normalizedTarget === 'SUPER_ADMIN') {
    return false;
  }

  // ADMIN peut agir sur les autres (MEMBRE, ADMIN)
  if (normalizedCurrent === 'ADMIN') {
    return true;
  }

  // MEMBRE ne peut agir sur personne
  return false;
}

/**
 * Vérifie si un utilisateur peut voir les données d'un autre utilisateur
 * @param currentUserRole - Rôle de l'utilisateur actuel
 * @param targetUserRole - Rôle de l'utilisateur cible
 * @param currentUserId - ID de l'utilisateur actuel
 * @param targetUserId - ID de l'utilisateur cible
 * @returns true si l'utilisateur peut voir, false sinon
 */
export function canViewUser(
  currentUserRole: string,
  targetUserRole: string,
  currentUserId: string,
  targetUserId: string
): boolean {
  // Un utilisateur peut toujours voir ses propres données
  if (currentUserId === targetUserId) {
    return true;
  }

  // SUPER_ADMIN peut voir tout le monde
  if (currentUserRole === 'SUPER_ADMIN') {
    return true;
  }

  // ADMIN peut voir tout le monde (mais ne peut agir que sur MEMBRE et ADMIN)
  if (currentUserRole === 'ADMIN') {
    return true;
  }

  // MEMBRE ne peut voir que ses propres données
  return false;
}

/**
 * Vérifie si un utilisateur est super admin
 */
export function isSuperAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN';
}

/**
 * Vérifie si un utilisateur est admin (ou super admin)
 */
export function isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

