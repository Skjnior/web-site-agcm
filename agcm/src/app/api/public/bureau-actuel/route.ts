// src/app/api/public/bureau-actuel/route.ts
// Bureau exécutif actuel (mandat en cours)

import { NextRequest, NextResponse } from 'next/server';
import { prisma, prismaRetry } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    return await prismaRetry(async () => {
    // Trouver le mandat actif
    const mandatActif = await prisma.mandat.findFirst({
      where: {
        statut: 'ACTIF',
      },
      orderBy: {
        dateDebut: 'desc',
      },
    });

    if (!mandatActif) {
      return NextResponse.json({
        bureau: [],
        mandat: null,
      });
    }

    // Récupérer les affectations actives du mandat
    const affectations = await prisma.affectationPoste.findMany({
      where: {
        mandatId: mandatActif.id,
        statut: 'ACTIF',
      },
      include: {
        poste: {
          select: {
            id: true,
            nom: true,
            description: true,
          },
        },
        member: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        poste: {
          nom: 'asc',
        },
      },
    });

    const bureau = affectations.map((aff) => ({
      nom: `${aff.member.prenom} ${aff.member.nom}`,
      role: aff.poste.nom,
      mandat: `${new Date(mandatActif.dateDebut).getFullYear()} - ${new Date(mandatActif.dateFin).getFullYear()}`,
      photoUrl: aff.member.photoUrl,
    }));

    return NextResponse.json({
      bureau,
      mandat: {
        titre: mandatActif.titre,
        dateDebut: mandatActif.dateDebut.toISOString(),
        dateFin: mandatActif.dateFin.toISOString(),
      },
    });
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du bureau:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
