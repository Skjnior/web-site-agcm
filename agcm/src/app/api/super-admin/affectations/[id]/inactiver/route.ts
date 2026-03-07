// src/app/api/super-admin/affectations/[id]/inactiver/route.ts
// Inactiver une affectation (SuperAdmin)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';

import { z } from 'zod';

const inactiverSchema = z.object({
  raisonInactivation: z.string().min(1, 'La raison est obligatoire'),
  dateFin: z.string().transform((str) => new Date(str)).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const { raisonInactivation, dateFin } = inactiverSchema.parse(body);

    // Récupérer l'affectation avant modification
    const affectationBefore = await prisma.affectationPoste.findUnique({
      where: { id },
      include: {
        poste: true,
        member: true,
      },
    });

    if (!affectationBefore) {
      return NextResponse.json(
        { error: 'Affectation introuvable' },
        { status: 404 }
      );
    }

    // Inactiver l'affectation
    const affectation = await prisma.affectationPoste.update({
      where: { id },
      data: {
        statut: 'INACTIF',
        raisonInactivation,
        dateFin: dateFin || new Date(),
      },
    });

    // Archiver automatiquement les contenus de ce poste dans ce mandat
    await prisma.content.updateMany({
      where: {
        auteurPosteId: affectationBefore.posteId,
        mandatId: affectationBefore.mandatId,
        statutWorkflow: {
          not: 'ARCHIVE',
        },
      },
      data: {
        statutWorkflow: 'ARCHIVE',
      },
    });

    // Log l'action
    await logAction({
      userId: session!.user.id,
      action: 'INACTIVATE',
      entityType: 'AffectationPoste',
      entityId: id,
      beforeData: affectationBefore,
      afterData: affectation,
    });

    // Note : les notifications sont gérées par email (Resend)

    return NextResponse.json({
      success: true,
      message: 'Affectation inactivée et contenus archivés',
      affectation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      );
    }

    console.error('Erreur lors de l\'inactivation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

