// src/app/api/super-admin/users/[id]/route.ts
// Gestion d'un utilisateur spécifique (SuperAdmin)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  roleSysteme: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEMBER']).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        member: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
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
    const data = userUpdateSchema.parse(body);

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

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.roleSysteme) updateData.roleSysteme = data.roleSysteme;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { member: true },
    });

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'User',
      entityId: id,
      beforeData: userBefore,
      afterData: user,
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
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
    // Empêcher la suppression de soi-même
    if (id === session!.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
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

    // Supprimer l'utilisateur (cascade supprime le membre)
    await prisma.user.delete({
      where: { id },
    });

    await logAction({
      userId: session!.user.id,
      action: 'DELETE',
      entityType: 'User',
      entityId: id,
      beforeData: userBefore,
    });

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

