// src/app/api/app/chat/route.ts
// Chat bureau privé uniquement (PRIVE_BUREAU)

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { canAccessSalonBureau } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { z } from 'zod';

const attachmentSchema = z.object({
  url: z.string().min(1),
  type: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
});

const chatMessageSchema = z.object({
  texte: z.string().max(2000).default(''),
  attachments: z.array(attachmentSchema).optional().default([]),
}).refine((d) => d.texte.trim().length > 0 || (d.attachments && d.attachments.length > 0), {
  message: 'Le message ou au moins une pièce jointe est requis',
});

export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  // Seul le bureau privé est autorisé
  const canAccess = await canAccessSalonBureau(session!.user.id);
  if (!canAccess) {
    return NextResponse.json(
      { error: 'Accès refusé : vous devez être membre actif du bureau' },
      { status: 403 }
    );
  }

  const { page, limit, offset } = parsePagination(request);

  try {
    const mandatActif = await getMandatActif();

    // SÉCURITÉ : Un mandat actif est OBLIGATOIRE. Sans mandat, aucun message.
    // Les messages des anciens mandats ne sont JAMAIS visibles (archivés par mandatId).
    if (!mandatActif) {
      return NextResponse.json(
        { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
        { status: 200 }
      );
    }

    const where = {
      deletedAt: null,
      mandatId: mandatActif.id, // Toujours filtrer par mandat actif uniquement
    };

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

  // Seul le bureau privé est autorisé
  const canAccess = await canAccessSalonBureau(session!.user.id);
  if (!canAccess) {
    return NextResponse.json(
      { error: 'Accès refusé : vous devez être membre actif du bureau' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { texte, attachments } = chatMessageSchema.parse(body);

    const mandatActif = await getMandatActif();

    // SÉCURITÉ : Impossible de poster sans mandat actif (chaque mandat = salon isolé)
    if (!mandatActif) {
      return NextResponse.json(
        { error: 'Aucun mandat actif. Le salon privé bureau n\'est pas disponible.' },
        { status: 400 }
      );
    }

    const texteToStore = texte.trim() || '(pièce jointe)';

    const message = await prisma.bureauMessage.create({
      data: {
        auteurUserId: session!.user.id,
        texte: texteToStore,
        mandatId: mandatActif.id,
        attachments: attachments?.length
          ? {
              create: attachments.map((a) => ({
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
      },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Données invalides', details: err.errors }, { status: 400 });
    }
    console.error('Erreur chat POST:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
