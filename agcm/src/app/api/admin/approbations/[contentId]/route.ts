// src/app/api/admin/approbations/[contentId]/route.ts
// Supprimer un contenu (Président/Admin - uniquement SOUMIS ou REJETE)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { contentId } = await context.params;

  try {
    const contentBefore = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!contentBefore) {
      return NextResponse.json({ error: 'Contenu introuvable' }, { status: 404 });
    }

    if (!['SOUMIS', 'REJETE', 'BROUILLON'].includes(contentBefore.statutWorkflow)) {
      return NextResponse.json(
        { error: 'Seuls les contenus soumis, rejetés ou brouillons peuvent être supprimés par l\'admin' },
        { status: 400 }
      );
    }

    await prisma.content.delete({
      where: { id: contentId },
    });

    await logAction({
      userId: session!.user!.id!,
      action: 'DELETE',
      entityType: 'Content',
      entityId: contentId,
      beforeData: contentBefore,
      afterData: null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur suppression:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
