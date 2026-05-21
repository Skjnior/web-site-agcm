// src/app/api/public/projets/route.ts
// Projets publics (site public)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const visible = searchParams.get('visible') === 'true';
    const { page, limit, offset } = parsePagination(request);

    const where = {
      visibiliteSite: visible ? true : undefined,
      statut: {
        not: 'BROUILLON' as const,
      },
    };

    const [total, projets] = await Promise.all([
      prisma.projet.count({ where }),
      prisma.projet.findMany({
        where,
        include: {
          responsablePoste: {
            select: {
              id: true,
              nom: true,
            },
          },
          medias: {
            where: {
              type: 'IMAGE',
            },
            orderBy: {
              ordre: 'asc',
            },
            take: 12,
          },
          partenaires: {
            include: {
              partner: {
                select: {
                  id: true,
                  nom: true,
                  logo: true,
                },
              },
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

    return NextResponse.json(createPaginatedResponse(projets, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

