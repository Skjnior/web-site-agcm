// src/app/api/super-admin/contents/[id]/route.ts
// Gestion des contenus (SuperAdmin uniquement) - GET, PATCH, DELETE

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { notifyContentAuthor } from '@/lib/notifications';
import { z } from 'zod';

const contentUpdateSchema = z.object({
  type: z.enum(['ACTIVITE', 'ACTUALITE', 'PARTAGE', 'ANNONCE']).optional(),
  titre: z.string().min(1).max(200).optional(),
  contenu: z.string().optional().nullable(),
  lienExterne: z.string().url().optional().nullable().or(z.literal('')),
  // Accepte URLs (http/https) ou chemins locaux (/uploads/images/...)
  imagePrincipale: z.string().refine(
    (val) => !val || val === '' || val.startsWith('http') || val.startsWith('/uploads/'),
    { message: 'Doit être une URL valide ou un chemin local' }
  ).optional().nullable().or(z.literal('')),
  visibiliteCible: z.enum(['PRIVE_BUREAU', 'PUBLIC_SITE']).optional(),
  statutWorkflow: z.enum(['BROUILLON', 'SOUMIS', 'APPROUVE', 'PUBLIE', 'REJETE', 'ARCHIVE']).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        auteurPoste: {
          select: {
            id: true,
            nom: true,
            description: true,
          },
        },
        mandat: {
          select: {
            id: true,
            titre: true,
            dateDebut: true,
            dateFin: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Contenu introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error);
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
    const contentBefore = await prisma.content.findUnique({
      where: { id },
    });

    if (!contentBefore) {
      return NextResponse.json(
        { error: 'Contenu introuvable' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data = contentUpdateSchema.parse(body);

    // Super Admin peut modifier TOUT, y compris le statut
    const content = await prisma.content.update({
      where: { id },
      data: {
        ...data,
        // Nettoyer les champs vides
        lienExterne: data.lienExterne === '' ? null : data.lienExterne,
        imagePrincipale: data.imagePrincipale === '' ? null : data.imagePrincipale,
      },
    });

    // Notifier l'auteur si approbation ou rejet
    if (data.statutWorkflow && data.statutWorkflow !== contentBefore.statutWorkflow) {
      if (data.statutWorkflow === 'PUBLIE' || data.statutWorkflow === 'APPROUVE') {
        await notifyContentAuthor(
          content.auteurPosteId,
          content.mandatId,
          'CONTENT_APPROVED',
          content.titre,
          content.id
        );
      } else if (data.statutWorkflow === 'REJETE') {
        await notifyContentAuthor(
          content.auteurPosteId,
          content.mandatId,
          'CONTENT_REJECTED',
          content.titre,
          content.id,
          content.rejectionReason ?? undefined
        );
      }
    }

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'Content',
      entityId: id,
      beforeData: contentBefore,
      afterData: content,
    });

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la modification du contenu:', error);
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
    const contentBefore = await prisma.content.findUnique({
      where: { id },
    });

    if (!contentBefore) {
      return NextResponse.json(
        { error: 'Contenu introuvable' },
        { status: 404 }
      );
    }

    await prisma.content.delete({
      where: { id },
    });

    await logAction({
      userId: session!.user.id,
      action: 'DELETE',
      entityType: 'Content',
      entityId: id,
      beforeData: contentBefore,
      afterData: null,
    });

    return NextResponse.json({ success: true, message: 'Contenu supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du contenu:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

