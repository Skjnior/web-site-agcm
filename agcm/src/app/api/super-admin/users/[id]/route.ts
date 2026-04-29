// src/app/api/super-admin/users/[id]/route.ts
// Gestion d'un utilisateur spécifique (SuperAdmin)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/** Si la migration `actor_email` n’est pas appliquée (colonne absente), on retombe sur l’ancien comportement. */
function isMissingAuditActorEmailColumn(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== 'P2010') return false;
  const meta = error.meta as { message?: string } | undefined;
  const msg = `${error.message} ${meta?.message ?? ''}`;
  return /actor_email|42703/i.test(msg);
}

async function deleteUserAndRelatedData(
  tx: Prisma.TransactionClient,
  id: string
) {
  /** Avant Member/User : les affectations référencent members.id en RESTRICT */
  await tx.affectationPoste.deleteMany({
    where: { member: { userId: id } },
  });

  await tx.comment.deleteMany({ where: { auteurUserId: id } });
  await tx.bureauMessage.deleteMany({ where: { auteurUserId: id } });
  await tx.content.updateMany({
    where: { approvedById: id },
    data: { approvedById: null, approvedAt: null },
  });
  await tx.demandeAdhesion.updateMany({
    where: { processedById: id },
    data: { processedById: null },
  });
  await tx.demandePartenariat.updateMany({
    where: { processedById: id },
    data: { processedById: null },
  });
  await tx.user.delete({ where: { id } });
}

const memberUpdateSchema = z.object({
  prenom: z.string().optional(),
  nom: z.string().optional(),
  telephone: z.string().optional().nullable(),
  ville: z.string().optional().nullable(),
  pays: z.string().optional().nullable(),
  statutMembre: z.enum(['ACTIF', 'INACTIF', 'SUSPENDU', 'RADIE']).optional(),
  genre: z.enum(['FEMME', 'HOMME', 'AUTRE', 'NE_PAS_DIRE']).optional().nullable(),
  dateNaissance: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  adresse: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
});

const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  roleSysteme: z.enum(['SUPER_ADMIN', 'ADMIN', 'MEMBER']).optional(),
  isActive: z.boolean().optional(),
  member: memberUpdateSchema.optional(),
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

    if (body.lifecycle === 'soft_delete') {
      if (id === session!.user.id) {
        return NextResponse.json(
          { error: 'Vous ne pouvez pas archiver votre propre compte' },
          { status: 400 }
        );
      }
      if (userBefore.deletedAt) {
        return NextResponse.json(
          { error: 'Ce compte est déjà archivé' },
          { status: 400 }
        );
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
        include: { member: true },
      });

      await logAction({
        userId: session!.user.id,
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        beforeData: userBefore,
        afterData: {
          ...user,
          lifecycle: 'soft_delete',
          message: 'Compte archivé (soft delete) — accès désactivé, données conservées en base.',
        },
      });

      return NextResponse.json({
        success: true,
        user,
      });
    }

    if (body.lifecycle === 'restore') {
      if (id === session!.user.id) {
        return NextResponse.json(
          { error: 'Opération invalide' },
          { status: 400 }
        );
      }
      if (!userBefore.deletedAt) {
        return NextResponse.json(
          { error: 'Ce compte n\'est pas archivé' },
          { status: 400 }
        );
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          deletedAt: null,
          isActive: true,
        },
        include: { member: true },
      });

      await logAction({
        userId: session!.user.id,
        action: 'UPDATE',
        entityType: 'User',
        entityId: id,
        beforeData: userBefore,
        afterData: {
          ...user,
          lifecycle: 'restore',
          message: 'Compte restauré après archivage.',
        },
      });

      return NextResponse.json({
        success: true,
        user,
      });
    }

    const data = userUpdateSchema.parse(body);

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.roleSysteme) updateData.roleSysteme = data.roleSysteme;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.member) {
      const memberData = { ...data.member };
      if (memberData.dateNaissance) {
        memberData.dateNaissance = new Date(memberData.dateNaissance) as any;
      }
      
      updateData.member = {
        upsert: {
          create: memberData,
          update: memberData,
        },
      };
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
        { error: 'Données invalides', details: error.issues },
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

    // Conserver les traces d’audit : détacher l’acteur (actor_email + user_id NULL) si la migration est appliquée
    try {
      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE "audit_logs"
          SET "actor_email" = COALESCE("actor_email", ${userBefore.email}),
              "user_id" = NULL
          WHERE "user_id" = ${id}
        `;
        await deleteUserAndRelatedData(tx, id);
      });
    } catch (error) {
      if (!isMissingAuditActorEmailColumn(error)) {
        throw error;
      }
      console.warn(
        '[users DELETE] Colonne audit_logs.actor_email absente — suppression des logs d’audit de cet acteur. Exécutez: npx prisma migrate deploy'
      );
      await prisma.$transaction(async (tx) => {
        await tx.auditLog.deleteMany({ where: { userId: id } });
        await deleteUserAndRelatedData(tx, id);
      });
    }

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

