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

    if (statut === 'APPROUVEE') {
      const emailNorm = demande.email.trim().toLowerCase();
      const existingUser = await prisma.user.findUnique({
        where: { email: emailNorm },
      });
      if (existingUser) {
        return NextResponse.json(
          {
            error:
              'Un compte existe déjà pour cet e-mail. Utilisez la gestion des membres ou des utilisateurs.',
          },
          { status: 409 }
        );
      }
      const existingMember = await prisma.member.findFirst({
        where: {
          OR: [{ email: { equals: emailNorm, mode: 'insensitive' } }, { user: { email: { equals: emailNorm, mode: 'insensitive' } } }],
        },
      });
      if (existingMember) {
        return NextResponse.json(
          { error: 'Cette personne est déjà enregistrée comme adhérent·e ou membre avec compte.' },
          { status: 409 }
        );
      }

      await prisma.member.create({
        data: {
          userId: null,
          email: emailNorm,
          prenom: demande.prenom.trim(),
          nom: demande.nom.trim(),
          telephone: demande.telephone?.trim() || null,
          ville: demande.ville?.trim() || null,
          pays: demande.pays?.trim() || null,
          bio: demande.message?.trim() || null,
          statutMembre: 'ACTIF',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        statut === 'APPROUVEE'
          ? "Demande approuvée. La fiche adhérent·e a été ajoutée (sans compte de connexion)."
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



