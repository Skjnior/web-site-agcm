// src/app/api/super-admin/postes/[id]/route.ts
// Gestion d'un poste spécifique (SuperAdmin)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { z } from 'zod';

const posteUpdateSchema = z.object({
  nom: z.string().min(1).optional(),
  description: z.string().optional(),
  estBureau: z.boolean().optional(),
  estActif: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const poste = await prisma.poste.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            affectations: true,
            authoredContents: true,
          },
        },
        affectations: {
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
            member: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                telephone: true,
                ville: true,
                user: {
                  select: {
                    email: true,
                    roleSysteme: true,
                    isActive: true,
                  },
                },
              },
            },
          },
          orderBy: {
            dateDebut: 'desc',
          },
        },
      },
    });

    if (!poste) {
      return NextResponse.json(
        { error: 'Poste introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      poste,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du poste:', error);
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
    const data = posteUpdateSchema.parse(body);

    const posteBefore = await prisma.poste.findUnique({
      where: { id },
    });

    if (!posteBefore) {
      return NextResponse.json(
        { error: 'Poste introuvable' },
        { status: 404 }
      );
    }

    // Si changement de nom, vérifier l'unicité
    if (data.nom && data.nom !== posteBefore.nom) {
      const existing = await prisma.poste.findUnique({
        where: { nom: data.nom },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Un poste avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    const poste = await prisma.poste.update({
      where: { id },
      data: data,
    });

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'Poste',
      entityId: id,
      beforeData: posteBefore,
      afterData: poste,
    });

    return NextResponse.json({
      success: true,
      poste,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.flatten() },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour du poste:', error);
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
    const posteBefore = await prisma.poste.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            affectations: true,
            authoredContents: true,
          },
        },
        affectations: {
          include: {
            member: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!posteBefore) {
      return NextResponse.json(
        { error: 'Poste introuvable' },
        { status: 404 }
      );
    }

    // Mettre toutes les affectations actives en INACTIF avant de supprimer le poste
    // Les membres restent mais sans poste
    if (posteBefore._count.affectations > 0) {
      const affectationsActives = posteBefore.affectations.filter(a => a.statut === 'ACTIF');

      if (affectationsActives.length > 0) {
        // Mettre toutes les affectations actives en INACTIF
        await prisma.affectationPoste.updateMany({
          where: {
            posteId: id,
            statut: 'ACTIF',
          },
          data: {
            statut: 'INACTIF',
            raisonInactivation: `Poste "${posteBefore.nom}" supprimé`,
            dateFin: new Date(),
          },
        });

        // Archiver les contenus créés par ce poste
        await prisma.content.updateMany({
          where: {
            auteurPosteId: id,
            statutWorkflow: {
              not: 'ARCHIVE',
            },
          },
          data: {
            statutWorkflow: 'ARCHIVE',
          },
        });

        // Note : les membres concernés peuvent être contactés par email
      }
    }

    // Supprimer le poste
    await prisma.poste.delete({
      where: { id },
    });

    await logAction({
      userId: session!.user.id,
      action: 'DELETE',
      entityType: 'Poste',
      entityId: id,
      beforeData: posteBefore,
    });

    return NextResponse.json({
      success: true,
      message: 'Poste supprimé. Les affectations actives ont été mises en INACTIF et les membres conservent leur compte.',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du poste:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

