import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pickFirstImageMediaUrl } from '@/lib/media-display-url';
import type { Event, EventMedia } from '@prisma/client';

type EventWithMedias = Event & { medias: EventMedia[] };

function stripHtml(html: string): string {
  if (!html || !html.includes('<')) return html;
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function serializePublicEvent(event: EventWithMedias) {
  return {
    id: event.id,
    titre: event.titre,
    slug: event.slug,
    description: stripHtml(event.description),
    dateDebut: event.dateDebut.toISOString(),
    dateFin: event.dateFin?.toISOString() ?? null,
    lieu: event.lieu,
    statut: event.statut,
    image: pickFirstImageMediaUrl(event.medias) ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const afficheSite = searchParams.get('afficheSite');

    const events = await prisma.event.findMany({
      where: {
        afficheSite: afficheSite === 'true' ? true : undefined,
      },
      include: {
        createdByPoste: {
          select: {
            id: true,
            nom: true,
          },
        },
        medias: {
          orderBy: [{ isPrincipale: 'desc' }, { ordre: 'asc' }],
          take: 20,
        },
      },
      orderBy: {
        dateDebut: 'asc',
      },
    });

    const serialized = events.map(serializePublicEvent);

    // Aligné sur le statut admin ; « À venir » = tout sauf passé (comme sur /evenements)
    const passes = serialized.filter((e) => e.statut === 'PASSE');
    const enCours = serialized.filter((e) => e.statut === 'EN_COURS');
    const aVenir = serialized.filter((e) => e.statut === 'A_VENIR' || e.statut === 'EN_COURS');

    return NextResponse.json({
      data: {
        passes,
        enCours,
        aVenir,
      },
    });
  } catch (error) {
    console.error('API ERROR EVENTS:', error);

    return NextResponse.json(
      { error: 'Erreur serveur', details: String(error) },
      { status: 500 }
    );
  }
}
