// src/app/api/admin/approbations/[contentId]/reject/route.ts
// Rejeter un contenu (Président/Admin)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { canApprove } from '@/lib/rbac';
import { logAction } from '@/lib/audit';
import { notifyContentAuthor } from '@/lib/notifications';
import { z } from 'zod';

const bodySchema = z.object({
  reason: z.string().max(500).optional(),
  rejectionReason: z.string().max(500).optional(),
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
        { error: 'Vous ne pouvez pas rejeter ce contenu' },
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
        { error: 'Seuls les contenus soumis peuvent être rejetés' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = bodySchema.parse(body);
    const reason = (parsed.reason || parsed.rejectionReason || '').trim() || 'Rejeté par le Président';

    const content = await prisma.content.update({
      where: { id: contentId },
      data: {
        statutWorkflow: 'REJETE',
        rejectionReason: reason,
        approvedById: null,
        approvedAt: null,
      },
    });

    await logAction({
      userId: session!.user!.id!,
      action: 'REJECT',
      entityType: 'Content',
      entityId: contentId,
      beforeData: contentBefore,
      afterData: content,
    });

    await notifyContentAuthor(
      content.auteurPosteId,
      content.mandatId,
      'CONTENT_REJECTED',
      content.titre,
      content.id,
      reason
    );

    return NextResponse.json({ success: true, content });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: err.issues }, { status: 400 });
    }
    console.error('Erreur rejet:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
