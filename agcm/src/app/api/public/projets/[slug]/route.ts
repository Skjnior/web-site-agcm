// src/app/api/public/projets/[slug]/route.ts
// Détail d'un projet public

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const projet = await prisma.projet.findUnique({
      where: { slug },
      include: {
        responsablePoste: {
          select: {
            id: true,
            nom: true,
          },
        },
        medias: {
          orderBy: {
            ordre: 'asc',
          },
        },
        partenaires: {
          include: {
            partner: {
              select: {
                id: true,
                nom: true,
                logo: true,
                description: true,
                siteUrl: true,
              },
            },
          },
        },
        subventions: {
          where: {
            statut: {
              in: ['ACCORDEE', 'VERSEE'],
            },
          },
          select: {
            organisme: true,
            type: true,
            montant: true,
            statut: true,
          },
        },
      },
    });

    if (!projet) {
      return NextResponse.json(
        { error: 'Projet introuvable' },
        { status: 404 }
      );
    }

    // Vérifier la visibilité
    if (!projet.visibiliteSite && projet.statut === 'BROUILLON') {
      return NextResponse.json(
        { error: 'Projet non disponible' },
        { status: 404 }
      );
    }

    return NextResponse.json({ projet });
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



