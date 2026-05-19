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

    // Aligné sur le statut choisi dans l’admin (onglets À venir / En cours / Passés)
    const passes = events.filter((e) => e.statut === 'PASSE');
    const enCours = events.filter((e) => e.statut === 'EN_COURS');
    const aVenir = events.filter((e) => e.statut === 'A_VENIR');

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