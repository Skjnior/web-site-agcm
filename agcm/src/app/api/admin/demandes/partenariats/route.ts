// src/app/api/admin/demandes/partenariats/route.ts
// Gestion des demandes de partenariat (Admin)

import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { z } from 'zod';

const updateDemandeSchema = z.object({
  statut: z.enum(['APPROUVEE', 'REFUSEE']),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const search = (searchParams.get('search') || '').trim();
  const rawStatut = searchParams.get('statut');
  /** Absent → EN_ATTENTE (comportement historique). ALL → tous les statuts. */
  const { page, limit, offset } = parsePagination(request);

  try {
    const where: Prisma.DemandePartenariatWhereInput = {};

    if (rawStatut === 'ALL') {
      // pas de filtre statut
    } else if (
      rawStatut &&
      ['EN_ATTENTE', 'APPROUVEE', 'REFUSEE'].includes(rawStatut)
    ) {
      where.statut = rawStatut as 'EN_ATTENTE' | 'APPROUVEE' | 'REFUSEE';
    } else {
      where.statut = 'EN_ATTENTE';
    }

    if (search) {
      where.OR = [
        { organisation: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactNom: { contains: search, mode: 'insensitive' } },
        { telephone: { contains: search, mode: 'insensitive' } },
        { typePartenariat: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, demandes] = await Promise.all([
      prisma.demandePartenariat.count({ where }),
      prisma.demandePartenariat.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(demandes, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

