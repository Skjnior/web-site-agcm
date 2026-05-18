// src/app/api/public/stats/route.ts
// Statistiques publiques de l'association

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const [membresActifs, evenementsAnnee, projetsActifs] = await Promise.all([
      prisma.member.count({
        where: { statutMembre: 'ACTIF' },
      }),
      prisma.event.count({
        where: {
          dateDebut: { gte: yearStart, lte: yearEnd },
        },
      }),
      prisma.projet.count({
        where: { statut: 'EN_COURS' },
      }),
    ]);

    return NextResponse.json({
      stats: [
        { label: 'Membres', value: `+${membresActifs}` },
        { label: 'Événements / an', value: `+${evenementsAnnee}` },
        { label: 'Projets actifs', value: `${projetsActifs}+` },
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


