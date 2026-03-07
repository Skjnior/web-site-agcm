// src/app/api/admin/demandes/dons/route.ts
// Gestion des intentions de don (Admin)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { z } from 'zod';

const updateDonSchema = z.object({
  statut: z.enum(['CONTACTE', 'CONFIRME', 'CLASSE_SANS_SUITE']),
  handledByPosteId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const statut = searchParams.get('statut') || 'NOUVEAU';
  const { page, limit, offset } = parsePagination(request);

  try {
    const where = {
      statut: statut as any,
    };

    const [total, dons] = await Promise.all([
      prisma.donationIntent.count({ where }),
      prisma.donationIntent.findMany({
        where,
        include: {
          handledByPoste: {
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

    return NextResponse.json(createPaginatedResponse(dons, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des dons:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

