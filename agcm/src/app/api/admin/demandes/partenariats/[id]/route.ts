// src/app/api/admin/demandes/partenariats/[id]/route.ts
// Traiter une demande de partenariat

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

    const demandeBefore = await prisma.demandePartenariat.findUnique({
      where: { id },
    });

    if (!demandeBefore) {
      return NextResponse.json(
        { error: 'Demande introuvable' },
        { status: 404 }
      );
    }

    // Transaction pour garantir la cohérence : mise à jour + création partenaire
    const result = await prisma.$transaction(async (tx) => {
      const demande = await tx.demandePartenariat.update({
        where: { id },
        data: {
          statut,
          processedById: session!.user.id,
          processedAt: new Date(),
        },
      });

      // Si APPROUVEE, créer le Partner dans la même transaction
      let partner = null;
      if (statut === 'APPROUVEE') {
        partner = await tx.partner.create({
          data: {
            nom: demandeBefore.organisation,
            description: demandeBefore.message || null,
            siteUrl: null, // À compléter manuellement
            type: demandeBefore.typePartenariat || null,
            statut: 'ACTIF',
            visibiliteSite: true,
          },
        });
      }

      return { demande, partner };
    });

    const { demande, partner } = result;

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'DemandePartenariat',
      entityId: id,
      beforeData: demandeBefore,
      afterData: demande,
    });

    return NextResponse.json({
      success: true,
      message: statut === 'APPROUVEE' 
        ? 'Demande approuvée et partenaire créé'
        : 'Demande refusée.',
      demande,
      partner,
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

