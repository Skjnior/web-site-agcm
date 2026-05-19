// src/app/api/admin/demandes/dons/route.ts
// Gestion des intentions de don (Admin)

import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
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
  const search = (searchParams.get('search') || '').trim();
  const rawStatut = searchParams.get('statut');
  const rawType = searchParams.get('type');
  const { page, limit, offset } = parsePagination(request);

  const statutsValides = [
    'NOUVEAU',
    'CONTACTE',
    'CONFIRME',
    'CLASSE_SANS_SUITE',
  ] as const;
  const typesValides = ['FINANCIER', 'MATERIEL', 'AUTRE'] as const;

  try {
    const where: Prisma.DonationIntentWhereInput = {};

    if (rawStatut === 'ALL') {
      // pas de filtre statut
    } else if (
      rawStatut &&
      statutsValides.includes(rawStatut as (typeof statutsValides)[number])
    ) {
      where.statut = rawStatut as (typeof statutsValides)[number];
    } else {
      where.statut = 'NOUVEAU';
    }

    if (rawType && typesValides.includes(rawType as (typeof typesValides)[number])) {
      where.type = rawType as (typeof typesValides)[number];
    }

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telephone: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

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

