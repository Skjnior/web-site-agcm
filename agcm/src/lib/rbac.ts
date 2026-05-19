// src/lib/rbac.ts
// Role-Based Access Control - Système de permissions AGCM simplifié
// 4 niveaux : SUPER_ADMIN, ADMIN/PRÉSIDENT, BUREAU, MEMBRE

import { cache } from 'react';
import { prisma } from './prisma';
import { getMandatActif } from './mandat';
import type { User } from '@prisma/client';

/**
 * ============================================
 * 🔐 SUPER ADMIN - Pouvoir absolu
 * ============================================
 */
export function isSuperAdmin(user: User): boolean {
  return user.roleSysteme === 'SUPER_ADMIN';
}

/**
 * ============================================
 * 👑 ADMIN / PRÉSIDENT - Superviseur institutionnel
 * ============================================
 */
export function isAdmin(user: User): boolean {
  return user.roleSysteme === 'ADMIN' || user.roleSysteme === 'SUPER_ADMIN';
}

/**
 * Admin peut approuver/rejeter du contenu
 * RÈGLE : Ne peut pas approuver son propre contenu
 */
export async function canApprove(user: User, contentId?: string): Promise<boolean> {
  if (isSuperAdmin(user)) return true;
  if (!isAdmin(user)) return false;

  if (contentId) {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (content) {
      const member = await prisma.member.findUnique({ where: { userId: user.id } });
      if (member) {
        const userAffectation = await prisma.affectationPoste.findFirst({
          where: { posteId: content.auteurPosteId, memberId: member.id, statut: 'ACTIF' },
        });
        if (userAffectation) return false; // Ne peut pas approuver son propre contenu
      }
    }
  }

  return true;
}

/**
 * Admin peut gérer les demandes (adhésion, partenariat, dons, contact)
 */
export async function canManageDemandes(user: User): Promise<boolean> {
  return isAdmin(user);
}

/**
 * Admin peut voir toutes les activités du bureau (lecture seule)
 */
export async function canViewBureauActivities(user: User): Promise<boolean> {
  return isAdmin(user);
}

/**
 * ============================================
 * 🏛️ MEMBRES DU BUREAU - Responsables opérationnels
 * ============================================
 */

type AffectationBureauRow = {
  posteId: string;
  statut: string;
  poste: { id: string; nom: string; estBureau: boolean };
  mandat: { id: string; dateDebut: Date; dateFin: Date; titre: string };
};

export type BureauMandatContext = {
  mandatId: string;
  mandat: NonNullable<Awaited<ReturnType<typeof getMandatActif>>>;
  /** Tous les postes occupés par le membre sur le mandat actif (pour filtres liste) */
  posteIds: string[];
  affectations: AffectationBureauRow[];
  /** Première affectation (ordre stable) — création de contenus / rétrocompat */
  primaryAffectation: AffectationBureauRow;
};

/**
 * Contexte mandat actif + tous les postes actifs du membre (indispensable pour listes « mes » données).
 */
export const getBureauMandatContext = cache(
  async (userId: string): Promise<BureauMandatContext | null> => {
    const mandatActif = await getMandatActif();
    if (!mandatActif) return null;

    const member = await prisma.member.findUnique({
      where: { userId },
      include: {
        affectations: {
          where: { mandatId: mandatActif.id, statut: 'ACTIF' },
          include: { poste: true, mandat: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!member?.affectations.length) return null;

    return {
      mandatId: mandatActif.id,
      mandat: mandatActif,
      posteIds: member.affectations.map((a) => a.posteId),
      affectations: member.affectations,
      primaryAffectation: member.affectations[0]!,
    };
  },
);

/**
 * Récupère l'affectation « principale » (première du mandat actif, ordre chronologique)
 */
export async function getAffectationActive(userId: string) {
  const ctx = await getBureauMandatContext(userId);
  return ctx?.primaryAffectation ?? null;
}

/**
 * Vérifie si l'utilisateur occupe au moins un poste du bureau exécutif sur le mandat actif
 */
export async function isBureauActif(userId: string): Promise<boolean> {
  const ctx = await getBureauMandatContext(userId);
  if (!ctx) return false;
  return ctx.affectations.some((a) => a.poste.estBureau === true && a.statut === 'ACTIF');
}

/**
 * Vérifie si un utilisateur peut créer/soumettre du contenu (auteur = l’un de ses postes)
 */
export async function canSubmitContent(userId: string, auteurPosteId?: string): Promise<boolean> {
  const ctx = await getBureauMandatContext(userId);
  if (!ctx) return false;
  if (auteurPosteId) return ctx.posteIds.includes(auteurPosteId);
  return true;
}

/**
 * Vérifie si un utilisateur peut accéder au salon privé bureau
 */
export async function canAccessSalonBureau(userId: string): Promise<boolean> {
  return await isBureauActif(userId);
}

/**
 * Vérifie si un utilisateur peut modifier un contenu
 */
export async function canModifyContent(
  userId: string,
  contentId: string,
): Promise<{ canModify: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { canModify: false, reason: 'Utilisateur introuvable' };

  if (isSuperAdmin(user)) return { canModify: true };

  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) return { canModify: false, reason: 'Contenu introuvable' };

  if (content.statutWorkflow === 'PUBLIE')
    return { canModify: false, reason: 'Contenu déjà publié' };
  if (content.statutWorkflow === 'ARCHIVE')
    return { canModify: false, reason: 'Contenu archivé' };

  const ctx = await getBureauMandatContext(userId);
  if (!ctx || !ctx.posteIds.includes(content.auteurPosteId))
    return { canModify: false, reason: "Vous n'êtes pas l'auteur de ce contenu" };

  return { canModify: true };
}

/**
 * Vérifie si un utilisateur peut supprimer un contenu
 * - Super-admin : oui (y compris publié, sauf si autre règle métier côté API).
 * - Auteur (poste) : brouillon, soumis (retrait avant décision) ou rejeté — pas publié / archivé / approuvé en attente de mise en ligne.
 */
export async function canDeleteContent(userId: string, contentId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  if (isSuperAdmin(user)) return true;

  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) return false;
  if (content.statutWorkflow === 'ARCHIVE' || content.statutWorkflow === 'PUBLIE') return false;
  if (content.statutWorkflow === 'APPROUVE') return false;

  const ctx = await getBureauMandatContext(userId);
  if (!ctx || !ctx.posteIds.includes(content.auteurPosteId)) return false;

  return (
    content.statutWorkflow === 'BROUILLON' ||
    content.statutWorkflow === 'SOUMIS' ||
    content.statutWorkflow === 'REJETE'
  );
}

/**
 * Vérifie si un utilisateur peut créer un projet
 */
export async function canCreateProjet(userId: string): Promise<boolean> {
  return await isBureauActif(userId);
}

/**
 * Vérifie si un utilisateur peut créer un événement
 */
export async function canCreateEvent(userId: string): Promise<boolean> {
  return await isBureauActif(userId);
}

/**
 * ============================================
 * 👤 MEMBRE SIMPLE
 * ============================================
 */

/**
 * Membre peut commenter (dans le salon bureau uniquement)
 */
export async function canComment(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  return user.isActive;
}

/**
 * ============================================
 * 🏛️ GOUVERNANCE - Super Admin uniquement
 * ============================================
 */

export async function canManagePostesMandats(user: User): Promise<boolean> {
  return isSuperAdmin(user);
}

export async function canManageAffectations(user: User): Promise<boolean> {
  return isSuperAdmin(user);
}

export async function canManageUsers(user: User): Promise<boolean> {
  return isSuperAdmin(user);
}

export async function canPublishDirectly(user: User): Promise<boolean> {
  return isSuperAdmin(user);
}

export async function canViewArchivedContent(user: User): Promise<boolean> {
  return isAdmin(user);
}

export async function canViewAllAuditLogs(user: User): Promise<boolean> {
  return isSuperAdmin(user);
}

/**
 * Admin/SuperAdmin peut créer des votes
 */
export function canCreateVote(user: User): boolean {
  return isAdmin(user);
}

/**
 * Super Admin uniquement peut voir les détails des votes
 */
export function canViewDetailedVotes(user: User): boolean {
  return isSuperAdmin(user);
}
