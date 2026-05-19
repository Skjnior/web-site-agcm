// src/app/api/app/chat/route.ts
// Salon général + messages directs (même mandat, membres bureau uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { canAccessSalonBureau } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { z } from 'zod';
import {
  assertDirectMessageAllowed,
  directThreadWhere,
  salonThreadWhere,
} from '@/lib/bureau-chat-server';
import { buildDirectJitsiRoom, buildSalonJitsiRoom } from '@/lib/bureau-jitsi-rooms';

const attachmentSchema = z.object({
  url: z.string().min(1),
  type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
});

const jitsiSessionSchema = z.object({
  mode: z.enum(['video', 'audio']),
  scope: z.enum(['salon', 'direct']),
});

const chatPostBase = z.object({
  texte: z.string().max(4000).default(''),
  attachments: z.array(attachmentSchema).optional().default([]),
  threadKind: z.enum(['SALON', 'DIRECT']).default('SALON'),
  dmPeerUserId: z.string().optional(),
  jitsiSession: jitsiSessionSchema.optional(),
});

const chatPostSchema = chatPostBase.superRefine((data, ctx) => {
  if (data.jitsiSession) {
    if (data.jitsiSession.scope === 'direct' && !data.dmPeerUserId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Destinataire requis pour annoncer un appel en message direct',
        path: ['dmPeerUserId'],
      });
    }
    if (data.jitsiSession.scope === 'salon' && data.threadKind !== 'SALON') {
      ctx.addIssue({
        code: 'custom',
        message: 'Annonce salon incohérente avec le fil',
        path: ['threadKind'],
      });
    }
    if (data.jitsiSession.scope === 'direct' && data.threadKind !== 'DIRECT') {
      ctx.addIssue({
        code: 'custom',
        message: 'Annonce directe incohérente avec le fil',
        path: ['threadKind'],
      });
    }
    return;
  }
  if (data.texte.trim().length === 0 && (!data.attachments || data.attachments.length === 0)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Le message ou au moins une pièce jointe est requis',
      path: ['texte'],
    });
  }
  if (data.threadKind === 'DIRECT') {
    if (!data.dmPeerUserId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Destinataire requis pour un message direct',
        path: ['dmPeerUserId'],
      });
    }
  }
});

export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const userId = session!.user!.id!;

  const canAccess = await canAccessSalonBureau(userId);
  if (!canAccess) {
    return NextResponse.json(
      { error: 'Accès refusé : vous devez être membre actif du bureau' },
      { status: 403 },
    );
  }

  const { page, limit, offset } = parsePagination(request);
  const thread = request.nextUrl.searchParams.get('thread') || 'salon';
  const peerUserId = request.nextUrl.searchParams.get('peerUserId');

  try {
    const mandatActif = await getMandatActif();

    if (!mandatActif) {
      return NextResponse.json(
        { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
        { status: 200 },
      );
    }

    let where: ReturnType<typeof salonThreadWhere> | ReturnType<typeof directThreadWhere>;

    if (thread === 'direct') {
      if (!peerUserId) {
        return NextResponse.json({ error: 'peerUserId requis pour le fil direct' }, { status: 400 });
      }
      const allowed = await assertDirectMessageAllowed(userId, peerUserId, mandatActif.id);
      if (!allowed.ok) {
        return NextResponse.json({ error: allowed.error }, { status: allowed.status });
      }
      where = directThreadWhere(mandatActif.id, userId, peerUserId);
    } else {
      where = salonThreadWhere(mandatActif.id);
    }

    const [total, messages] = await Promise.all([
      prisma.bureauMessage.count({ where }),
      prisma.bureauMessage.findMany({
        where,
        include: {
          auteur: {
            select: {
              id: true,
              email: true,
              member: {
                select: {
                  id: true,
                  prenom: true,
                  nom: true,
                  photoUrl: true,
                },
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
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(messages.reverse(), total, page, limit));
  } catch (err) {
    console.error('Erreur chat GET:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const userId = session!.user!.id!;

  const canAccess = await canAccessSalonBureau(userId);
  if (!canAccess) {
    return NextResponse.json(
      { error: 'Accès refusé : vous devez être membre actif du bureau' },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const data = chatPostSchema.parse(body);

    const mandatActif = await getMandatActif();

    if (!mandatActif) {
      return NextResponse.json(
        { error: 'Aucun mandat actif. Le salon privé bureau n\'est pas disponible.' },
        { status: 400 },
      );
    }

    let texteToStore: string;
    let messageKind: 'USER' | 'SYSTEM' = 'USER';
    let threadKind: 'SALON' | 'DIRECT' = data.threadKind;
    let dmPeerUserId: string | null =
      data.threadKind === 'DIRECT' && data.dmPeerUserId ? data.dmPeerUserId : null;

    if (data.jitsiSession) {
      messageKind = 'SYSTEM';
      threadKind = data.jitsiSession.scope === 'salon' ? 'SALON' : 'DIRECT';
      dmPeerUserId = data.jitsiSession.scope === 'direct' ? data.dmPeerUserId ?? null : null;

      if (threadKind === 'DIRECT' && dmPeerUserId) {
        const allowed = await assertDirectMessageAllowed(userId, dmPeerUserId, mandatActif.id);
        if (!allowed.ok) {
          return NextResponse.json({ error: allowed.error }, { status: allowed.status });
        }
      }

      const { roomName, roomUrl } =
        threadKind === 'SALON'
          ? buildSalonJitsiRoom(mandatActif.id)
          : buildDirectJitsiRoom(mandatActif.id, userId, dmPeerUserId!);

      const modeLabel = data.jitsiSession.mode === 'audio' ? 'Appel audio' : 'Visioconférence';
      texteToStore =
        threadKind === 'SALON'
          ? `📎 ${modeLabel} salon bureau — rejoindre : ${roomUrl}\n(Salle : ${roomName})`
          : `📎 ${modeLabel} (conversation directe) — rejoindre : ${roomUrl}\n(Salle : ${roomName})`;
    } else {
      if (threadKind === 'DIRECT' && dmPeerUserId) {
        const allowed = await assertDirectMessageAllowed(userId, dmPeerUserId, mandatActif.id);
        if (!allowed.ok) {
          return NextResponse.json({ error: allowed.error }, { status: allowed.status });
        }
      }

      texteToStore = data.texte.trim() || '(pièce jointe)';
    }

    if (threadKind === 'SALON' && dmPeerUserId) {
      return NextResponse.json({ error: 'Fil salon : ne pas fournir de destinataire direct' }, { status: 400 });
    }
    if (threadKind === 'DIRECT' && !dmPeerUserId) {
      return NextResponse.json({ error: 'Destinataire requis' }, { status: 400 });
    }

    const message = await prisma.bureauMessage.create({
      data: {
        auteurUserId: userId,
        texte: texteToStore,
        mandatId: mandatActif.id,
        threadKind,
        messageKind,
        dmPeerUserId,
        attachments:
          !data.jitsiSession && data.attachments?.length
            ? {
                create: data.attachments.map((a) => ({
                  url: a.url,
                  type: a.type,
                  fileName: a.fileName,
                  fileSize: a.fileSize,
                  mimeType: a.mimeType,
                })),
              }
            : undefined,
      },
      include: {
        auteur: {
          select: {
            id: true,
            email: true,
            member: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                photoUrl: true,
              },
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
      },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: err.issues }, { status: 400 });
    }
    console.error('Erreur chat POST:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
