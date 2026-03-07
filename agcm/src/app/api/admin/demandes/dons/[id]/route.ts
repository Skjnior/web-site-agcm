// src/app/api/admin/demandes/dons/[id]/route.ts
// Traiter une intention de don

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { z } from 'zod';

const updateDonSchema = z.object({
  statut: z.enum(['CONTACTE', 'CONFIRME', 'CLASSE_SANS_SUITE']),
  handledByPosteId: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateDonSchema.parse(body);

    const donBefore = await prisma.donationIntent.findUnique({
      where: { id },
    });

    if (!donBefore) {
      return NextResponse.json(
        { error: 'Intention de don introuvable' },
        { status: 404 }
      );
    }

    const don = await prisma.donationIntent.update({
      where: { id },
      data: {
        statut: data.statut,
        handledByPosteId: data.handledByPosteId || donBefore.handledByPosteId,
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'DonationIntent',
      entityId: id,
      beforeData: donBefore,
      afterData: don,
    });

    return NextResponse.json({
      success: true,
      don,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour de l\'intention de don:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



