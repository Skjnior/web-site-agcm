// src/app/api/super-admin/audit-logs/[id]/route.ts
// Détail et suppression d’un log d’audit (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            roleSysteme: true,
            member: {
              select: { prenom: true, nom: true },
            },
          },
        },
      },
    });

    if (!log) {
      return NextResponse.json({ error: 'Log introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      log: {
        id: log.id,
        userId: log.userId,
        actorEmail: log.actorEmail,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        beforeData: log.beforeData ?? null,
        afterData: log.afterData ?? null,
        createdAt: log.createdAt,
        user: log.user,
      },
    });
  } catch (e) {
    console.error('Erreur lors de la récupération du log:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    // Vérifier que le log existe
    const log = await prisma.auditLog.findUnique({
      where: { id },
    });

    if (!log) {
      return NextResponse.json(
        { error: 'Log d\'audit introuvable' },
        { status: 404 }
      );
    }

    // Supprimer le log
    await prisma.auditLog.delete({
      where: { id },
    });

    // Logger l'action de suppression (sans créer une boucle infinie)
    // On ne log pas la suppression des logs pour éviter la récursion

    return NextResponse.json({
      success: true,
      message: 'Log d\'audit supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du log:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
