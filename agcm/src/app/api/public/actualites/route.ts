// src/app/api/public/actualites/route.ts
// Actualités publiques (contenus approuvés et publiés)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  try {
    const { page, limit, offset } = parsePagination(request);

    const where = {
      statutWorkflow: 'PUBLIE' as const,
      visibiliteCible: 'PUBLIC_SITE' as const,
    };

    const [total, contents] = await Promise.all([
      prisma.content.count({ where }),
      prisma.content.findMany({
        where,
        select: {
          id: true,
          type: true,
          titre: true,
          contenu: true,
          imagePrincipale: true,
          lienExterne: true,
          tags: true,
          createdAt: true,
          facebookPostId: true,
          auteurPoste: {
            select: {
              id: true,
              nom: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(contents, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des actualités:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
