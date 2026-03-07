// src/app/api/super-admin/affectations/route.ts
// Gestion des affectations de postes (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { z } from 'zod';

const affectationSchema = z.object({
  mandatId: z.string(),
  posteId: z.string(),
  memberId: z.string(),
  dateDebut: z.string().transform((str) => new Date(str)),
  dateFin: z.string().transform((str) => new Date(str)).optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const mandatId = searchParams.get('mandatId');
  const statut = searchParams.get('statut');
  const search = searchParams.get('search') || '';
  const { page, limit, offset } = parsePagination(request);

  try {
    const where: any = {};
    if (mandatId) where.mandatId = mandatId;
    if (statut) where.statut = statut;

    // Filtre par recherche (nom ou prénom du membre)
    if (search) {
      where.member = {
        OR: [
          { prenom: { contains: search, mode: 'insensitive' } },
          { nom: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, affectations] = await Promise.all([
      prisma.affectationPoste.count({ where }),
      prisma.affectationPoste.findMany({
        where,
        include: {
          mandat: true,
          poste: true,
          member: {
            include: {
              user: {
                select: {
                  email: true,
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

    return NextResponse.json(createPaginatedResponse(affectations, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des affectations:', error);
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
    const data = affectationSchema.parse(body);

    // Vérifier que le membre existe
    const member = await prisma.member.findUnique({
      where: { id: data.memberId },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Membre introuvable' },
        { status: 404 }
      );
    }

    // Créer l'affectation
    const affectation = await prisma.affectationPoste.create({
      data: {
        mandatId: data.mandatId,
        posteId: data.posteId,
        memberId: data.memberId,
        dateDebut: data.dateDebut,
        dateFin: data.dateFin,
        statut: 'ACTIF',
      },
    });

    // Log l'action
    await logAction({
      userId: session!.user.id,
      action: 'ASSIGN',
      entityType: 'AffectationPoste',
      entityId: affectation.id,
      afterData: affectation,
    });

    return NextResponse.json(
      { success: true, affectation },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création de l\'affectation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

