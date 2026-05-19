import type { User } from '@prisma/client';
import { isSuperAdmin } from '@/lib/rbac';
import { getBureauMandatContext } from '@/lib/rbac';
import { bureauMemberHasModule, type BureauModule } from '@/lib/bureau-poste-perimetre';

/** Secrétaire communication + super admin (+ président via tous les modules). */
export async function canManageSiteGalerie(user: User): Promise<boolean> {
  if (isSuperAdmin(user)) return true;
  const ctx = await getBureauMandatContext(user.id);
  if (!ctx) return false;
  const posteNoms = ctx.affectations.map((a) => a.poste.nom);
  return bureauMemberHasModule(user.roleSysteme, posteNoms, 'galerie');
}

export async function canManageSitePartenaires(user: User): Promise<boolean> {
  if (isSuperAdmin(user)) return true;
  const ctx = await getBureauMandatContext(user.id);
  if (!ctx) return false;
  const posteNoms = ctx.affectations.map((a) => a.poste.nom);
  return bureauMemberHasModule(user.roleSysteme, posteNoms, 'partenaires');
}

export type SiteMediaModule = Extract<BureauModule, 'galerie' | 'partenaires'>;

export async function canManageSiteMediaModule(
  user: User,
  module: SiteMediaModule,
): Promise<boolean> {
  return module === 'galerie' ? canManageSiteGalerie(user) : canManageSitePartenaires(user);
}
