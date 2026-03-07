// src/app/api/app/chat/route.ts
// Chat bureau privé uniquement (PRIVE_BUREAU)

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { canAccessSalonBureau } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { z } from 'zod';

const chatMessageSchema = z.object({
  texte: z.string().min(1).max(2000),
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

    const where = {
      deletedAt: null,
      ...(mandatActif ? { mandatId: mandatActif.id } : {}),
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
    const { texte } = chatMessageSchema.parse(body);

    const mandatActif = await getMandatActif();

    const message = await prisma.bureauMessage.create({
      data: {
        auteurUserId: session!.user.id,
        texte,
        mandatId: mandatActif?.id ?? null,
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
