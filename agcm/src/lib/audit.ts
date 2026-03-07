// src/lib/audit.ts
// Système d'audit logging

import { prisma } from './prisma';
import type { AuditAction } from '@prisma/client';

type AuditData = {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  beforeData?: any;
  afterData?: any;
};

/**
 * Log une action dans l'audit
 */
export async function logAction(data: AuditData) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        beforeData: data.beforeData ? JSON.parse(JSON.stringify(data.beforeData)) : null,
        afterData: data.afterData ? JSON.parse(JSON.stringify(data.afterData)) : null,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'audit:', error);
    // Ne pas faire échouer l'opération principale si l'audit échoue
  }
}

/**
 * Récupère les logs d'audit pour une entité
 */
export async function getAuditLogs(entityType: string, entityId: string) {
  return await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Récupère les logs d'audit pour un utilisateur
 */
export async function getUserAuditLogs(userId: string, limit = 50) {
  return await prisma.auditLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}



