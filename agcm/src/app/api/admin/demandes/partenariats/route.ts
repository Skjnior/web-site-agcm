// src/app/api/admin/demandes/partenariats/route.ts
// Gestion des demandes de partenariat (Admin)

import { NextRequest, NextResponse } from 'next/server';
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
  const statut = searchParams.get('statut') || 'EN_ATTENTE';
  const { page, limit, offset } = parsePagination(request);

  try {
    const where = {
      statut: statut as any,
    };

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

