// src/app/api/public/stats/route.ts
// Statistiques publiques de l'association — chiffres issus de la même base PostgreSQL que l’app (DATABASE_URL).
//
// Sens des compteurs :
// - Membres : nombre de lignes dans la table `members` avec `statutMembre = ACTIF` — **y compris**
//   les adhérents issus uniquement de l’import registre PDF (emails `registre-pdf-*@import.agcm.local`)
//   tant qu’ils sont ACTIF ; aligné avec un `COUNT(*)` côté base sur cette condition.
// - Événements / an : événements avec `affiche_site = true` dont la date de début tombe dans l’année civile
//   courante du serveur (calendrier) — évite de compter des événements non exposés au site public.
// - Projets actifs : projet en statut `EN_COURS` (non filtré par une visibilité « site » côté schéma).

import { NextResponse } from 'next/server';
import { prisma, prismaRetry } from '@/lib/prisma';

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const [membresActifs, evenementsAnnee, projetsActifs] = await prismaRetry(() =>
      Promise.all([
        prisma.member.count({
          where: { statutMembre: 'ACTIF' },
        }),
        prisma.event.count({
          where: {
            dateDebut: { gte: yearStart, lte: yearEnd },
            afficheSite: true,
          },
        }),
        prisma.projet.count({
          where: { statut: 'EN_COURS' },
        }),
      ]),
    );

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
