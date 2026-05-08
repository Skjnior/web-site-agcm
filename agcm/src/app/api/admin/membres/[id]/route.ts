// src/app/api/admin/membres/[id]/route.ts
// Modifier et supprimer un membre (Admin/Président)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { canActOnMemberRecord } from '@/lib/permissions';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const updateMemberSchema = z.object({
  prenom: z.string().min(1).optional(),
  nom: z.string().min(1).optional(),
  genre: z.enum(['FEMME', 'HOMME', 'AUTRE', 'NE_PAS_DIRE']).nullable().optional(),
  /** Format YYYY-MM-DD ou ISO */
  dateNaissance: z.string().nullable().optional(),
  profession: z.string().nullable().optional(),
  adresse: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
  ville: z.string().nullable().optional(),
  pays: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  statutMembre: z.enum(['ACTIF', 'SUSPENDU', 'RADIE']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    // Récupérer le membre et son rôle
    const memberBefore = await prisma.member.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            roleSysteme: true,
          },
        },
      },
    });

    if (!memberBefore) {
      return NextResponse.json(
        { error: 'Membre introuvable' },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    const userRole = (session!.user as any).roleSysteme || session!.user.role;
    if (!canActOnMemberRecord(userRole, memberBefore)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de modifier ce membre' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateMemberSchema.parse(body);

    const data: Prisma.MemberUpdateInput = { ...parsed };
    if (parsed.dateNaissance !== undefined) {
      if (parsed.dateNaissance === null || parsed.dateNaissance === '') {
        data.dateNaissance = null;
      } else {
        const d = new Date(parsed.dateNaissance);
        data.dateNaissance = Number.isNaN(d.getTime()) ? null : d;
      }
    }
    if (parsed.photoUrl !== undefined) {
      data.photoUrl =
        parsed.photoUrl === null || parsed.photoUrl === '' ? null : parsed.photoUrl;
    }

    const member = await prisma.member.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            roleSysteme: true,
          },
        },
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'Member',
      entityId: id,
      beforeData: memberBefore,
      afterData: member,
    });

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la modification du membre:', error);
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
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    // Récupérer le membre et son rôle
    const memberBefore = await prisma.member.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            roleSysteme: true,
          },
        },
      },
    });

    if (!memberBefore) {
      return NextResponse.json(
        { error: 'Membre introuvable' },
        { status: 404 }
      );
    }

    // Empêcher la suppression de soi-même
    if (memberBefore.user?.id === session!.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    // Vérifier les permissions
    const userRole = (session!.user as any).roleSysteme || session!.user.role;
    if (!canActOnMemberRecord(userRole, memberBefore)) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de supprimer ce membre' },
        { status: 403 }
      );
    }

    // Logger l'action avant suppression
    await logAction({
      userId: session!.user.id,
      action: 'DELETE',
      entityType: 'Member',
      entityId: id,
      beforeData: memberBefore,
    });

    // Supprimer la fiche membre (et l'utilisateur associé s'il existe, via cascade Prisma)
    if (memberBefore.userId) {
      await prisma.user.delete({
        where: { id: memberBefore.userId },
      });
    } else {
      await prisma.member.delete({
        where: { id },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Membre supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

