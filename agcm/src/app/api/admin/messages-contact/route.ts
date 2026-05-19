import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

const statutsValides = ['NOUVEAU', 'EN_COURS', 'TRAITE', 'ARCHIVE'] as const;

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const search = (searchParams.get('search') || '').trim();
  const rawStatut = searchParams.get('statut');
  const { page, limit, offset } = parsePagination(request);

  try {
    const where: Prisma.MessageContactWhereInput = {};

    if (rawStatut === 'ALL') {
      // pas de filtre
    } else if (
      rawStatut &&
      statutsValides.includes(rawStatut as (typeof statutsValides)[number])
    ) {
      where.statut = rawStatut as (typeof statutsValides)[number];
    } else {
      where.statut = 'NOUVEAU';
    }

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { sujet: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, messages] = await Promise.all([
      prisma.messageContact.count({ where }),
      prisma.messageContact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(messages, total, page, limit));
  } catch (err) {
    console.error('Erreur liste messages contact:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
