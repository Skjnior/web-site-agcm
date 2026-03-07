// src/app/api/super-admin/affectations/[id]/route.ts
// Récupérer et modifier une affectation spécifique (Super Admin)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { z } from 'zod';

const affectationUpdateSchema = z.object({
  mandatId: z.string().optional(),
  posteId: z.string().optional(),
  memberId: z.string().optional(),
  dateDebut: z.string().transform((str) => new Date(str)).optional(),
  dateFin: z.string().transform((str) => new Date(str)).optional().nullable(),
  statut: z.enum(['ACTIF', 'INACTIF']).optional(),
  raisonInactivation: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const affectation = await prisma.affectationPoste.findUnique({
      where: { id },
      include: {
        mandat: {
          select: {
            id: true,
            titre: true,
            dateDebut: true,
            dateFin: true,
            statut: true,
          },
        },
        poste: {
          select: {
            id: true,
            nom: true,
            description: true,
            estBureau: true,
            estActif: true,
          },
        },
        member: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                roleSysteme: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!affectation) {
      return NextResponse.json(
        { error: 'Affectation introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      affectation,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'affectation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const data = affectationUpdateSchema.parse(body);

    const affectationBefore = await prisma.affectationPoste.findUnique({
      where: { id },
    });

    if (!affectationBefore) {
      return NextResponse.json(
        { error: 'Affectation introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que le membre n'a pas déjà ce poste dans ce mandat (si changement de poste/mandat)
    if (data.mandatId || data.posteId || data.memberId) {
      const mandatId = data.mandatId || affectationBefore.mandatId;
      const posteId = data.posteId || affectationBefore.posteId;
      const memberId = data.memberId || affectationBefore.memberId;

      const existing = await prisma.affectationPoste.findFirst({
        where: {
          id: { not: id },
          mandatId,
          posteId,
          memberId,
          statut: 'ACTIF',
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Ce membre a déjà ce poste dans ce mandat' },
          { status: 400 }
        );
      }
    }

    const affectation = await prisma.affectationPoste.update({
      where: { id },
      data: {
        ...(data.mandatId && { mandatId: data.mandatId }),
        ...(data.posteId && { posteId: data.posteId }),
        ...(data.memberId && { memberId: data.memberId }),
        ...(data.dateDebut && { dateDebut: data.dateDebut }),
        ...(data.dateFin !== undefined && { dateFin: data.dateFin }),
        ...(data.statut && { statut: data.statut }),
        ...(data.raisonInactivation !== undefined && { raisonInactivation: data.raisonInactivation }),
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'AffectationPoste',
      entityId: id,
      beforeData: affectationBefore,
      afterData: affectation,
    });

    return NextResponse.json({
      success: true,
      affectation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la modification de l\'affectation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const affectationBefore = await prisma.affectationPoste.findUnique({
      where: { id },
      include: {
        mandat: true,
      },
    });

    if (!affectationBefore) {
      return NextResponse.json(
        { error: 'Affectation introuvable' },
        { status: 404 }
      );
    }

    // Vérifier si l'affectation est passée (dateFin < aujourd'hui)
    const isPassee = affectationBefore.dateFin && new Date(affectationBefore.dateFin) < new Date();
    if (isPassee) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une affectation passée. Seules les affectations présentes ou futures peuvent être supprimées.' },
        { status: 400 }
      );
    }

    // Supprimer l'affectation
    await prisma.affectationPoste.delete({
      where: { id },
    });

    await logAction({
      userId: session!.user.id,
      action: 'DELETE',
      entityType: 'AffectationPoste',
      entityId: id,
      beforeData: affectationBefore,
    });

    return NextResponse.json({
      success: true,
      message: 'Affectation supprimée',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'affectation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

