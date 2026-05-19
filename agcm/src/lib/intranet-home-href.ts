/** Lien d’« accueil intranet » : évite `/dashboard` (SSR + redirection) pour admins et bureau. */
export function getIntranetHomeHref(
  userRole: string | undefined,
  options?: {
    /** Depuis `(app)/layout` : membre bureau */
    isBureau?: boolean;
    /** JWT : membre avec accès intranet */
    canAccessIntranet?: boolean;
  },
): string {
  const role = userRole ?? 'MEMBER';

  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return '/admin';
  }

  if (
    role === 'MEMBER' &&
    (options?.isBureau === true || options?.canAccessIntranet === true)
  ) {
    return '/bureau';
  }

  return '/dashboard';
}
