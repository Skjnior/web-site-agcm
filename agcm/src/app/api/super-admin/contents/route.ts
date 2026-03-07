// src/app/api/super-admin/contents/route.ts
// Gestion des contenus (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const { page, limit, offset } = parsePagination(request);

  try {
    const where: any = {};

    if (status && status !== 'ALL') {
      where.statutWorkflow = status;
    }

    // Recherche par titre ou contenu
    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { contenu: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, contents] = await Promise.all([
      prisma.content.count({ where }),
      prisma.content.findMany({
        where,
        include: {
          auteurPoste: {
            select: {
              id: true,
              nom: true,
              description: true,
            },
          },
          mandat: {
            select: {
              id: true,
              titre: true,
              dateDebut: true,
              dateFin: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              email: true,
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
    console.error('Erreur lors de la récupération des contenus:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


