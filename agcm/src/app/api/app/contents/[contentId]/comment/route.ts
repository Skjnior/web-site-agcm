// src/app/api/app/contents/[contentId]/comment/route.ts
// Ajouter un commentaire sur un contenu (membres)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireIntranetAccess } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { commentCreateSchema } from '@/lib/validators/comment';
import { logAction } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const { error, session } = await requireIntranetAccess();
  if (error) return error;

  const { contentId } = await params;

  try {
    const body = await request.json();
    const { texte } = commentCreateSchema.parse(body);

    // Vérifier que le contenu existe et est publié
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Contenu introuvable' },
        { status: 404 }
      );
    }

    if (content.statutWorkflow !== 'PUBLIE') {
      return NextResponse.json(
        { error: 'Ce contenu n\'est pas encore publié' },
        { status: 403 }
      );
    }

    // Créer le commentaire
    const comment = await prisma.comment.create({
      data: {
        contentId,
        auteurUserId: session!.user.id,
        texte,
      },
      include: {
        auteur: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Log l'action
    await logAction({
      userId: session!.user.id,
      action: 'CREATE',
      entityType: 'Comment',
      entityId: comment.id,
      afterData: comment,
    });

    return NextResponse.json(
      { success: true, comment },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création du commentaire:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



