// src/app/api/super-admin/users/[id]/suspend/route.ts
// Suspendre/Réactiver un utilisateur et son membre (Super Admin)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { z } from 'zod';

const suspendSchema = z.object({
  suspend: z.boolean(), // true = suspendre, false = réactiver
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
    const { suspend } = suspendSchema.parse(body);

    // Empêcher la suspension de soi-même
    if (id === session!.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas suspendre votre propre compte' },
        { status: 400 }
      );
    }

    const userBefore = await prisma.user.findUnique({
      where: { id },
      include: { member: true },
    });

    if (!userBefore) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Mettre à jour l'utilisateur et le membre en transaction
    const result = await prisma.$transaction(async (tx) => {
      // Désactiver/Activer le compte utilisateur
      const user = await tx.user.update({
        where: { id },
        data: {
          isActive: !suspend,
        },
        include: { member: true },
      });

      // Si l'utilisateur a un membre, mettre à jour son statut
      if (user.member) {
        await tx.member.update({
          where: { id: user.member.id },
          data: {
            statutMembre: suspend ? 'SUSPENDU' : 'ACTIF',
          },
        });
      }

      return user;
    });

    // Récupérer le membre mis à jour
    const userAfter = await prisma.user.findUnique({
      where: { id },
      include: { member: true },
    });

    await logAction({
      userId: session!.user.id,
      action: suspend ? 'INACTIVATE' : 'UPDATE',
      entityType: 'User',
      entityId: id,
      beforeData: userBefore,
      afterData: userAfter,
    });

    return NextResponse.json({
      success: true,
      message: suspend ? 'Utilisateur suspendu' : 'Utilisateur réactivé',
      user: userAfter,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la suspension/réactivation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


