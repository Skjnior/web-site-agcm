// src/app/api/admin/demandes/adhesions/[id]/route.ts
// Traiter une demande d'adhésion spécifique

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { z } from 'zod';

const updateDemandeSchema = z.object({
  statut: z.enum(['APPROUVEE', 'REFUSEE']),
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
    const { statut } = updateDemandeSchema.parse(body);

    const demandeBefore = await prisma.demandeAdhesion.findUnique({
      where: { id },
    });

    if (!demandeBefore) {
      return NextResponse.json(
        { error: 'Demande introuvable' },
        { status: 404 }
      );
    }

    const demande = await prisma.demandeAdhesion.update({
      where: { id },
      data: {
        statut,
        processedById: session!.user.id,
        processedAt: new Date(),
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'DemandeAdhesion',
      entityId: id,
      beforeData: demandeBefore,
      afterData: demande,
    });

    // Si APPROUVEE, notifier le SuperAdmin pour créer le compte
    // (le SuperAdmin devra créer le compte manuellement via /api/super-admin/users)

    return NextResponse.json({
      success: true,
      message: statut === 'APPROUVEE' 
        ? 'Demande approuvée. Le SuperAdmin doit créer le compte.'
        : 'Demande refusée.',
      demande,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour de la demande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



