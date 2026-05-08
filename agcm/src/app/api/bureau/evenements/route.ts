// src/app/api/bureau/evenements/route.ts
// CRUD des événements (bureau)

import { NextRequest, NextResponse } from 'next/server';
import { requireBureauModule } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { eventCreateSchema } from '@/lib/validators/event';
import { getBureauMandatContext } from '@/lib/rbac';
import { logAction } from '@/lib/audit';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { z } from 'zod';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireBureauModule('evenements');
  if (error) return error;

  try {
    const ctx = await getBureauMandatContext(session!.user.id);
    if (!ctx) {
      return NextResponse.json(
        { error: 'Vous devez avoir un poste actif sur le mandat en cours pour créer un événement' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = eventCreateSchema.parse(body);

    // Déterminer le statut selon la date
    let statut: 'PASSE' | 'EN_COURS' | 'A_VENIR' = 'A_VENIR';
    const now = new Date();
    if (data.dateDebut < now) {
      statut = data.dateFin && data.dateFin > now ? 'EN_COURS' : 'PASSE';
    }

    // Générer le slug
    const slug = slugify(data.titre);
    const existing = await prisma.event.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const event = await prisma.event.create({
      data: {
        titre: data.titre,
        slug: finalSlug,
        description: data.description,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        lieu: data.lieu,
        statut,
        afficheSite: data.afficheSite,
        createdByPosteId: ctx.primaryAffectation.posteId,
        mandatId: ctx.mandatId,
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'CREATE',
      entityType: 'Event',
      entityId: event.id,
      afterData: event,
    });

    return NextResponse.json(
      { success: true, event },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création de l\'événement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { error, session } = await requireBureauModule('evenements');
  if (error) return error;

  const { page, limit, offset } = parsePagination(request);

  try {
    const ctx = await getBureauMandatContext(session!.user.id);
    if (!ctx) {
      return NextResponse.json(
        { error: 'Vous devez avoir un poste actif sur le mandat en cours' },
        { status: 403 }
      );
    }

    const where = {
      createdByPosteId: { in: ctx.posteIds },
      mandatId: ctx.mandatId,
    };

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        include: {
          createdByPoste: true,
          mandat: true,
          medias: true,
        },
        orderBy: {
          dateDebut: 'desc',
        },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(events, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

