// src/lib/require-auth.ts
// Helpers pour vérifier l'authentification dans les API routes

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { RoleSysteme } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getBureauMandatContext } from '@/lib/rbac';
import { bureauMemberHasModule, type BureauModule } from '@/lib/bureau-poste-perimetre';

/**
 * Vérifie que l'utilisateur est authentifié
 * @returns La session utilisateur ou une réponse 401
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      ),
      session: null,
    };
  }

  return {
    error: null,
    session,
  };
}

/**
 * Vérifie que l'utilisateur a un rôle spécifique
 * @param roles - Rôles autorisés
 * @returns La session utilisateur ou une réponse 403
 */
export async function requireRole(...roles: RoleSysteme[]) {
  const { error, session } = await requireAuth();
  
  if (error) {
    return { error, session: null };
  }

  if (!session?.user?.role || !roles.includes(session.user.role as RoleSysteme)) {
    return {
      error: NextResponse.json(
        { error: 'Accès refusé : permissions insuffisantes' },
        { status: 403 }
      ),
      session: null,
    };
  }

  return {
    error: null,
    session,
  };
}

/**
 * Vérifie que l'utilisateur est SuperAdmin
 */
export async function requireSuperAdmin() {
  return await requireRole('SUPER_ADMIN');
}

/**
 * Vérifie que l'utilisateur est Admin ou SuperAdmin
 */
export async function requireAdmin() {
  return await requireRole('ADMIN', 'SUPER_ADMIN');
}

/**
 * Vérifie que l'utilisateur est membre actif du bureau (poste bureau dans mandat actif)
 */
export async function requireBureau() {
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };

  const { isBureauActif } = await import('@/lib/rbac');
  const bureau = await isBureauActif(session!.user!.id!);
  if (!bureau) {
    return {
      error: NextResponse.json(
        { error: 'Accès refusé : réservé aux membres du bureau' },
        { status: 403 }
      ),
      session: null,
    };
  }
  return { error: null, session };
}

/**
 * Bureau + module fonctionnel autorisé pour le(s) poste(s) (hors ADMIN / SUPER_ADMIN = tout).
 */
export async function requireBureauModule(module: BureauModule) {
  const { error, session } = await requireBureau();
  if (error) return { error, session: null };

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id! },
  });
  if (!user) {
    return {
      error: NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 401 }),
      session: null,
    };
  }

  const ctx = await getBureauMandatContext(session!.user!.id!);
  const posteNoms = ctx?.affectations.map((a) => a.poste.nom) ?? [];
  if (!bureauMemberHasModule(user.roleSysteme, posteNoms, module)) {
    return {
      error: NextResponse.json(
        { error: 'Accès refusé : cette fonction n’est pas dans le périmètre de votre poste' },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { error: null, session };
}

/**
 * Registre cotisations / absences : bureau avec module `paiements`, ou ADMIN / SUPER_ADMIN.
 */
export async function requireRegistreCotisationsAccess() {
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id! },
  });
  if (!user) {
    return {
      error: NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 401 }),
      session: null,
    };
  }

  if (user.roleSysteme === 'ADMIN' || user.roleSysteme === 'SUPER_ADMIN') {
    return { error: null, session };
  }

  return requireBureauModule('paiements');
}

/**
 * Admin, Super-admin ou membre du bureau (mandat actif). Les adhérents simples n'ont plus d'intranet sur le site.
 */
export async function requireIntranetAccess() {
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };

  const role = session!.user!.role as RoleSysteme;
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    return { error: null, session };
  }

  const { isBureauActif } = await import('@/lib/rbac');
  const bureau = await isBureauActif(session!.user!.id!);
  if (!bureau) {
    return {
      error: NextResponse.json(
        { error: 'Accès refusé : espace réservé au bureau et à l\'administration' },
        { status: 403 }
      ),
      session: null,
    };
  }
  return { error: null, session };
}



