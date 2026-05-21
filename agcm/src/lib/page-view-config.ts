/**
 * Tracking des visites : désactivé en production par défaut pour ne pas saturer
 * le pool PostgreSQL (chaque visite = 1 connexion Prisma sur une lambda).
 *
 * Activer explicitement : ENABLE_PAGE_VIEWS=1 sur Vercel.
 * Désactiver en dev : DISABLE_PAGE_VIEWS=1
 */
export function isPageViewTrackingEnabled(): boolean {
  if (process.env.DISABLE_PAGE_VIEWS === '1') return false;
  if (process.env.ENABLE_PAGE_VIEWS === '1') return true;
  return process.env.NODE_ENV !== 'production';
}
