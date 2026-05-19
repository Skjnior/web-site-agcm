import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function userIsBureauOnMandat(userId: string, mandatId: string): Promise<boolean> {
  const member = await prisma.member.findUnique({ where: { userId } });
  if (!member) return false;
  const n = await prisma.affectationPoste.count({
    where: {
      mandatId,
      memberId: member.id,
      statut: 'ACTIF',
      poste: { estBureau: true },
    },
  });
  return n > 0;
}

export async function assertDirectMessageAllowed(
  fromUserId: string,
  toUserId: string,
  mandatId: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (fromUserId === toUserId) {
    return { ok: false, status: 400, error: 'Impossible de dialoguer avec soi-même sur ce fil.' };
  }
  const [fromOk, toOk] = await Promise.all([
    userIsBureauOnMandat(fromUserId, mandatId),
    userIsBureauOnMandat(toUserId, mandatId),
  ]);
  if (!fromOk) return { ok: false, status: 403, error: 'Accès réservé au bureau exécutif.' };
  if (!toOk) {
    return {
      ok: false,
      status: 400,
      error: 'Ce membre ne fait pas partie du bureau exécutif sur le mandat actuel.',
    };
  }
  return { ok: true };
}

export function salonThreadWhere(mandatId: string): Prisma.BureauMessageWhereInput {
  return { mandatId, threadKind: 'SALON' };
}

export function directThreadWhere(
  mandatId: string,
  viewerUserId: string,
  peerUserId: string,
): Prisma.BureauMessageWhereInput {
  return {
    mandatId,
    threadKind: 'DIRECT',
    OR: [
      { auteurUserId: viewerUserId, dmPeerUserId: peerUserId },
      { auteurUserId: peerUserId, dmPeerUserId: viewerUserId },
    ],
  };
}

/** Suppression logique : contenu effacé, ligne conservée pour traçabilité (tombstone UI). */
export async function softDeleteBureauMessage(messageId: string, actorUserId: string): Promise<void> {
  await prisma.$transaction([
    prisma.bureauMessageAttachment.deleteMany({ where: { messageId } }),
    prisma.bureauMessage.update({
      where: { id: messageId },
      data: {
        texte: '',
        deletedAt: new Date(),
        deletedBy: actorUserId,
        editedAt: null,
      },
    }),
  ]);
}
