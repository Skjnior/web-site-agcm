// src/app/api/bureau/contents/[contentId]/submit/route.ts
// Soumettre un contenu au Président (BROUILLON -> SOUMIS)

import { NextRequest, NextResponse } from 'next/server';
import { requireBureauModule } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { canSubmitContent } from '@/lib/rbac';

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  const { error, session } = await requireBureauModule('contents');
  if (error) return error;

  const { contentId } = await context.params;

  try {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json({ error: 'Contenu introuvable' }, { status: 404 });
    }

    if (content.statutWorkflow !== 'BROUILLON' && content.statutWorkflow !== 'REJETE') {
      return NextResponse.json(
        { error: 'Seuls les brouillons ou contenus rejetés peuvent être soumis' },
        { status: 400 }
      );
    }

    if (content.visibiliteCible === 'PRIVE_BUREAU') {
      return NextResponse.json(
        { error: 'Les contenus privés bureau ne nécessitent pas de soumission' },
        { status: 400 }
      );
    }

    const canSubmit = await canSubmitContent(session!.user!.id!, content.auteurPosteId);
    if (!canSubmit) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas soumettre ce contenu' },
        { status: 403 }
      );
    }

    await prisma.content.update({
      where: { id: contentId },
      data: {
        statutWorkflow: 'SOUMIS',
        rejectionReason: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur soumission contenu:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
