// src/app/api/super-admin/postes/route.ts
// Gestion des postes (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { z } from 'zod';

const posteCreateSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  estBureau: z.boolean().optional().default(true),
  estActif: z.boolean().optional().default(true),
});

const posteUpdateSchema = z.object({
  nom: z.string().min(1).optional(),
  description: z.string().optional(),
  estBureau: z.boolean().optional(),
  estActif: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const estBureau = searchParams.get('estBureau');
  const estActif = searchParams.get('estActif');

  const { page, limit, offset } = parsePagination(request);

  try {
    const where: any = {};

    // Filtre par recherche (nom ou description)
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtre par estBureau
    if (estBureau !== null && estBureau !== '') {
      where.estBureau = estBureau === 'true';
    }

    // Filtre par estActif
    if (estActif !== null && estActif !== '') {
      where.estActif = estActif === 'true';
    }

    const [total, postes] = await Promise.all([
      prisma.poste.count({ where }),
      prisma.poste.findMany({
        where,
        orderBy: {
          nom: 'asc',
        },
        include: {
          _count: {
            select: {
              affectations: true,
              authoredContents: true,
            },
          },
        },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(postes, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des postes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireSuperAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const data = posteCreateSchema.parse(body);

    // Vérifier l'unicité du nom
    const existing = await prisma.poste.findUnique({
      where: { nom: data.nom },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un poste avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    const poste = await prisma.poste.create({
      data: {
        nom: data.nom,
        description: data.description,
        estBureau: data.estBureau,
        estActif: data.estActif,
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'CREATE',
      entityType: 'Poste',
      entityId: poste.id,
      afterData: poste,
    });

    return NextResponse.json(
      { success: true, poste },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création du poste:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

