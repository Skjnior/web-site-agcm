// src/lib/require-auth.ts
// Helpers pour vérifier l'authentification dans les API routes

import { auth } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import type { RoleSysteme } from '@prisma/client';

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



