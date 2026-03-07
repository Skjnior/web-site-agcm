// src/app/api/admin/approbations/[contentId]/approve/route.ts
// Approuver un contenu (Président/Admin)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { canApprove } from '@/lib/rbac';
import { logAction } from '@/lib/audit';
import { notifyContentAuthor } from '@/lib/notifications';
import { z } from 'zod';

const bodySchema = z.object({
  publishToFacebook: z.boolean().optional().default(false),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { contentId } = await context.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session!.user!.id! },
    });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 403 });
    }
    const canApproveContent = await canApprove(user, contentId);
    if (!canApproveContent) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas approuver ce contenu (peut-être votre propre contenu)' },
        { status: 403 }
      );
    }

    const contentBefore = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!contentBefore) {
      return NextResponse.json({ error: 'Contenu introuvable' }, { status: 404 });
    }

    if (contentBefore.statutWorkflow !== 'SOUMIS') {
      return NextResponse.json(
        { error: 'Seuls les contenus soumis peuvent être approuvés' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { publishToFacebook } = bodySchema.parse(body);

    const content = await prisma.content.update({
      where: { id: contentId },
      data: {
        statutWorkflow: 'PUBLIE',
        approvedById: session!.user!.id!,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });

    await logAction({
      userId: session!.user!.id!,
      action: 'APPROVE',
      entityType: 'Content',
      entityId: contentId,
      beforeData: contentBefore,
      afterData: content,
    });

    await notifyContentAuthor(
      content.auteurPosteId,
      content.mandatId,
      'CONTENT_APPROVED',
      content.titre,
      content.id
    );

    return NextResponse.json({
      success: true,
      content,
      facebook: publishToFacebook ? { success: false, error: 'Publication Facebook non implémentée' } : undefined,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: err.issues }, { status: 400 });
    }
    console.error('Erreur approbation:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
