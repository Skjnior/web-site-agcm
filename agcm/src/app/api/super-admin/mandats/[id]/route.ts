// src/app/api/super-admin/mandats/[id]/route.ts
// Gestion d'un mandat spécifique (SuperAdmin)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { z } from 'zod';

const mandatUpdateSchema = z.object({
  titre: z.string().min(1).optional(),
  dateDebut: z.string().transform((str) => new Date(str)).optional(),
  dateFin: z.string().transform((str) => new Date(str)).optional(),
  statut: z.enum(['ACTIF', 'EXPIRE', 'ARCHIVE']).optional(),
  pvDocumentUrl: z.string().optional().or(z.literal('')),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const mandat = await prisma.mandat.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            affectations: true,
            contents: true,
            projets: true,
            events: true,
            votes: true,
          },
        },
        affectations: {
          where: {
            statut: 'ACTIF',
          },
          include: {
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
            poste: {
              select: {
                id: true,
                nom: true,
                description: true,
                estBureau: true,
                estActif: true,
              },
            },
          },
          orderBy: {
            poste: {
              nom: 'asc',
            },
          },
        },
      },
    });

    if (!mandat) {
      return NextResponse.json(
        { error: 'Mandat introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      mandat,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du mandat:', error);
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
    const data = mandatUpdateSchema.parse(body);

    const mandatBefore = await prisma.mandat.findUnique({
      where: { id },
    });

    if (!mandatBefore) {
      return NextResponse.json(
        { error: 'Mandat introuvable' },
        { status: 404 }
      );
    }

    // Vérifier si le mandat est passé (date de fin < aujourd'hui)
    const isMandatPasse = mandatBefore.dateFin < new Date();
    if (isMandatPasse) {
      return NextResponse.json(
        { error: 'Impossible de modifier un mandat terminé. Seuls les mandats présents ou futurs peuvent être modifiés.' },
        { status: 400 }
      );
    }

    // Si on active ce mandat, désactiver les autres
    if (data.statut === 'ACTIF') {
      await prisma.mandat.updateMany({
        where: {
          statut: 'ACTIF',
          id: { not: id },
        },
        data: {
          statut: 'EXPIRE',
        },
      });
    }

    const updateData: any = {};
    if (data.titre) updateData.titre = data.titre;
    if (data.dateDebut) updateData.dateDebut = data.dateDebut;
    if (data.dateFin) updateData.dateFin = data.dateFin;
    if (data.statut) updateData.statut = data.statut;
    if (data.pvDocumentUrl !== undefined) {
      updateData.pvDocumentUrl = data.pvDocumentUrl || null;
    }

    const mandat = await prisma.mandat.update({
      where: { id },
      data: updateData,
    });

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'Mandat',
      entityId: id,
      beforeData: mandatBefore,
      afterData: mandat,
    });

    return NextResponse.json({
      success: true,
      mandat,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour du mandat:', error);
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
    const mandat = await prisma.mandat.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            affectations: true,
            contents: true,
            projets: true,
            events: true,
          },
        },
      },
    });

    if (!mandat) {
      return NextResponse.json(
        { error: 'Mandat introuvable' },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des données liées
    const hasRelatedData = 
      (mandat._count?.affectations || 0) > 0 ||
      (mandat._count?.contents || 0) > 0 ||
      (mandat._count?.projets || 0) > 0 ||
      (mandat._count?.events || 0) > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        { 
          error: 'Impossible de supprimer ce mandat car il contient des données liées (affectations, contenus, projets, événements). Veuillez d\'abord archiver le mandat.',
        },
        { status: 400 }
      );
    }

    await prisma.mandat.delete({
      where: { id },
    });

    await logAction({
      userId: session!.user.id,
      action: 'DELETE',
      entityType: 'Mandat',
      entityId: id,
      beforeData: mandat,
    });

    return NextResponse.json({
      success: true,
      message: 'Mandat supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du mandat:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

