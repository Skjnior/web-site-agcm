// src/app/api/super-admin/bureau-actuel/route.ts
// Bureau exécutif actuel avec détails complets (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  try {
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

    // Récupérer les affectations actives du mandat avec postes du bureau uniquement
    const affectations = await prisma.affectationPoste.findMany({
      where: {
        mandatId: mandatActif.id,
        statut: 'ACTIF',
        poste: {
          estBureau: true,
        },
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
      id: aff.member.id,
      prenom: aff.member.prenom,
      nom: aff.member.nom,
      poste: {
        id: aff.poste.id,
        nom: aff.poste.nom,
      },
    }));

    return NextResponse.json({
      bureau,
      mandat: {
        id: mandatActif.id,
        titre: mandatActif.titre,
        dateDebut: mandatActif.dateDebut.toISOString(),
        dateFin: mandatActif.dateFin.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du bureau:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


