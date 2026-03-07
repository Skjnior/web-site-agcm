// src/app/api/admin/evenements/[id]/approve-afficheSite/route.ts
// Approuver l'affichage d'un événement sur le site (Président)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = params;

  try {
    const eventBefore = await prisma.event.findUnique({
      where: { id },
    });

    if (!eventBefore) {
      return NextResponse.json(
        { error: 'Événement introuvable' },
        { status: 404 }
      );
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        afficheSite: true,
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'APPROVE',
      entityType: 'Event',
      entityId: id,
      beforeData: eventBefore,
      afterData: event,
    });

    return NextResponse.json({
      success: true,
      message: 'Affichage de l\'événement approuvé',
      event,
    });
  } catch (error) {
    console.error('Erreur lors de l\'approbation de l\'affichage:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



