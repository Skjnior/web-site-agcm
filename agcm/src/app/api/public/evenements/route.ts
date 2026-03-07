// src/app/api/public/evenements/route.ts
// Événements publics (site public)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const afficheSite = searchParams.get('afficheSite') === 'true';
    const { page, limit, offset } = parsePagination(request);

    const where = {
      afficheSite: afficheSite ? true : undefined,
    };

    // Récupérer tous les événements affichés sur le site (sans pagination pour la page d'accueil)
    const events = await prisma.event.findMany({
      where: {
        afficheSite: true,
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

    // Grouper par statut
    const now = new Date();
    const passes = events.filter(e => {
      const dateFin = e.dateFin || e.dateDebut;
      return dateFin < now;
    }).sort((a, b) => {
      // Trier par date de fin décroissante (les plus récents en premier)
      const dateFinA = a.dateFin || a.dateDebut;
      const dateFinB = b.dateFin || b.dateDebut;
      return dateFinB.getTime() - dateFinA.getTime();
    }).slice(0, 5); // Limiter à 5 plus récents

    const enCours = events.filter(e => {
      return e.dateDebut <= now && e.dateFin && e.dateFin >= now;
    }).sort((a, b) => {
      // Trier par date de début croissante (les plus proches en premier)
      return a.dateDebut.getTime() - b.dateDebut.getTime();
    }).slice(0, 5); // Limiter à 5

    const aVenir = events.filter(e => e.dateDebut > now).sort((a, b) => {
      // Trier par date de début croissante (les plus proches en premier)
      return a.dateDebut.getTime() - b.dateDebut.getTime();
    }).slice(0, 5); // Limiter à 5 plus proches

    return NextResponse.json({
      data: {
        passes: passes.map(e => ({
          id: e.id,
          titre: e.titre,
          slug: e.slug,
          description: e.description,
          dateDebut: e.dateDebut.toISOString(),
          dateFin: e.dateFin?.toISOString() || null,
          lieu: e.lieu,
          statut: e.statut,
          image: e.medias[0]?.url || null,
        })),
        enCours: enCours.map(e => ({
          id: e.id,
          titre: e.titre,
          slug: e.slug,
          description: e.description,
          dateDebut: e.dateDebut.toISOString(),
          dateFin: e.dateFin?.toISOString() || null,
          lieu: e.lieu,
          statut: e.statut,
          image: e.medias[0]?.url || null,
        })),
        aVenir: aVenir.map(e => ({
          id: e.id,
          titre: e.titre,
          slug: e.slug,
          description: e.description,
          dateDebut: e.dateDebut.toISOString(),
          dateFin: e.dateFin?.toISOString() || null,
          lieu: e.lieu,
          statut: e.statut,
          image: e.medias[0]?.url || null,
        })),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

