import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
          orderBy: {
            isPrincipale: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        dateDebut: 'asc',
      },
    });

    const now = new Date();

    const passes = events.filter(e => {
      const dateFin = e.dateFin || e.dateDebut;
      return dateFin < now;
    });

    const enCours = events.filter(e => {
      return e.dateDebut <= now && e.dateFin && e.dateFin >= now;
    });

    const aVenir = events.filter(e => e.dateDebut > now);

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