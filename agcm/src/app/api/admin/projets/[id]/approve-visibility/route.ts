// src/app/api/admin/projets/[id]/approve-visibility/route.ts
// Approuver la visibilité d'un projet sur le site (Président)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const projetBefore = await prisma.projet.findUnique({
      where: { id },
    });

    if (!projetBefore) {
      return NextResponse.json(
        { error: 'Projet introuvable' },
        { status: 404 }
      );
    }

    const projet = await prisma.projet.update({
      where: { id },
      data: {
        visibiliteSite: true,
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'APPROVE',
      entityType: 'Projet',
      entityId: id,
      beforeData: projetBefore,
      afterData: projet,
    });

    return NextResponse.json({
      success: true,
      message: 'Visibilité du projet approuvée',
      projet,
    });
  } catch (error) {
    console.error('Erreur lors de l\'approbation de la visibilité:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



