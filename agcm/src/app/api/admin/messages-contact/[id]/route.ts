import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { z } from 'zod';

const updateSchema = z.object({
  statut: z.enum(['NOUVEAU', 'EN_COURS', 'TRAITE', 'ARCHIVE']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const before = await prisma.messageContact.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Message introuvable' }, { status: 404 });
    }

    const updated = await prisma.messageContact.update({
      where: { id },
      data: { statut: data.statut },
    });

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'MessageContact',
      entityId: id,
      beforeData: before,
      afterData: updated,
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: e.issues }, { status: 400 });
    }
    console.error('Erreur MAJ message contact:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
