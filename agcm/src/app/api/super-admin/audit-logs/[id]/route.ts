// src/app/api/super-admin/audit-logs/[id]/route.ts
// Supprimer un log d'audit (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireSuperAdmin();
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
