// src/app/api/public/stats/route.ts
// Statistiques publiques de l'association

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Compter les membres actifs
    const membresActifs = await prisma.member.count({
      where: {
        statutMembre: 'ACTIF',
      },
    });

    // Compter les événements de l'année en cours (affichés sur le site)
    const currentYear = new Date().getFullYear();
    const evenementsCount = await prisma.event.count({
      where: {
        afficheSite: true,
        dateDebut: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31),
        },
      },
    });

    // Compter les projets actifs (visibles sur le site et non brouillons)
    const projetsCount = await prisma.projet.count({
      where: {
        visibiliteSite: true,
        statut: {
          in: ['EN_COURS', 'TERMINE'],
        },
      },
    });

    // Compter les contenus publiés
    const actualitesCount = await prisma.content.count({
      where: {
        statutWorkflow: 'PUBLIE',
        visibiliteCible: 'PUBLIC_SITE',
      },
    });

    return NextResponse.json({
      stats: [
        { label: 'Membres', value: `+${membresActifs}` },
        { label: 'Événements / an', value: `+${evenementsCount}` },
        { label: 'Projets actifs', value: `${projetsCount}+` },
        { label: 'Actualités', value: `${actualitesCount}+` },
      ],
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


