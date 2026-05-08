import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { canAccessSalonBureau } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import { softDeleteBureauMessage } from '@/lib/bureau-chat-server';

const patchSchema = z.object({
  texte: z.string().min(1).max(4000),
});

const messageInclude = {
  auteur: {
    select: {
      id: true,
      email: true,
      member: {
        select: { id: true, prenom: true, nom: true, photoUrl: true },
      },
    },
  },
  attachments: true,
  deletedByUser: {
    select: {
      id: true,
      email: true,
      member: { select: { prenom: true, nom: true } },
    },
  },
} as const;

async function getMessageForViewer(messageId: string, viewerId: string) {
  const mandat = await getMandatActif();
  if (!mandat) {
    return { error: NextResponse.json({ error: 'Aucun mandat actif' }, { status: 400 }) };
  }

  const msg = await prisma.bureauMessage.findFirst({
    where: { id: messageId, mandatId: mandat.id },
    include: messageInclude,
  });

  if (!msg) {
    return { error: NextResponse.json({ error: 'Message introuvable' }, { status: 404 }) };
  }

  const bureauOk = await canAccessSalonBureau(viewerId);
  if (!bureauOk) {
    return { error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) };
  }

  if (msg.threadKind === 'DIRECT') {
    if (msg.dmPeerUserId !== viewerId && msg.auteurUserId !== viewerId) {
      return { error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }) };
    }
  }

  return { message: msg, mandat };
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ messageId: string }> },
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const userId = session!.user!.id!;
  const { messageId } = await ctx.params;

  const result = await getMessageForViewer(messageId, userId);
  if ('error' in result) return result.error;

  const { message: msg } = result;

  if (msg.deletedAt) {
    return NextResponse.json({ error: 'Message déjà supprimé' }, { status: 400 });
  }
  if (msg.messageKind !== 'USER') {
    return NextResponse.json({ error: 'Ce message ne peut pas être modifié' }, { status: 400 });
  }
  if (msg.auteurUserId !== userId) {
    return NextResponse.json({ error: 'Vous ne pouvez modifier que vos propres messages' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { texte } = patchSchema.parse(body);

    const updated = await prisma.bureauMessage.update({
      where: { id: messageId },
      data: {
        texte: texte.trim(),
        editedAt: new Date(),
      },
      include: messageInclude,
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: err.issues }, { status: 400 });
    }
    console.error('Erreur chat PATCH:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ messageId: string }> },
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const userId = session!.user!.id!;
  const { messageId } = await ctx.params;

  const result = await getMessageForViewer(messageId, userId);
  if ('error' in result) return result.error;

  const { message: msg } = result;

  if (msg.deletedAt) {
    return NextResponse.json({ error: 'Message déjà supprimé' }, { status: 400 });
  }

  const actor = await prisma.user.findUnique({ where: { id: userId } });
  const isSuperAdmin = actor?.roleSysteme === 'SUPER_ADMIN';
  const isAuthor = msg.auteurUserId === userId;

  if (!isAuthor && !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Vous ne pouvez supprimer que vos messages (ou être super administrateur)' },
      { status: 403 },
    );
  }

  try {
    await softDeleteBureauMessage(messageId, userId);

    const updated = await prisma.bureauMessage.findFirst({
      where: { id: messageId },
      include: messageInclude,
    });

    return NextResponse.json({ success: true, message: updated });
  } catch (err) {
    console.error('Erreur chat DELETE:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
