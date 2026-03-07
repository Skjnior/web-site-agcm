// src/app/api/super-admin/affectations/[id]/activer/route.ts
// Activer/Réactiver une affectation (SuperAdmin)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    // Récupérer l'affectation avant modification
    const affectationBefore = await prisma.affectationPoste.findUnique({
      where: { id },
      include: {
        poste: true,
        member: true,
        mandat: true,
      },
    });

    if (!affectationBefore) {
      return NextResponse.json(
        { error: 'Affectation introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que le membre n'a pas déjà ce poste dans ce mandat (si on réactive)
    const existing = await prisma.affectationPoste.findFirst({
      where: {
        id: { not: id },
        mandatId: affectationBefore.mandatId,
        posteId: affectationBefore.posteId,
        memberId: affectationBefore.memberId,
        statut: 'ACTIF',
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ce membre a déjà ce poste actif dans ce mandat' },
        { status: 400 }
      );
    }

    // Activer l'affectation
    const affectation = await prisma.affectationPoste.update({
      where: { id },
      data: {
        statut: 'ACTIF',
        raisonInactivation: null,
        // Si dateFin est passée, on la remet à null pour indiquer que c'est en cours
        dateFin: affectationBefore.dateFin && new Date(affectationBefore.dateFin) < new Date()
          ? null
          : affectationBefore.dateFin,
      },
    });

    // Log l'action
    await logAction({
      userId: session!.user.id,
      action: 'ASSIGN',
      entityType: 'AffectationPoste',
      entityId: id,
      beforeData: affectationBefore,
      afterData: affectation,
    });

    // Note : les notifications sont gérées par email (Resend)

    return NextResponse.json({
      success: true,
      message: 'Affectation activée',
      affectation,
    });
  } catch (error) {
    console.error('Erreur lors de l\'activation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


