/** Email d’affichage : compte lié en priorité, sinon email de contact sur la fiche adhérent. */
export function memberContactEmail(m: {
  email: string | null;
  user: { email: string } | null;
}): string {
  return m.user?.email ?? m.email ?? '';
}
