// src/app/api/super-admin/mandats/route.ts
// Gestion des mandats (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { z } from 'zod';

const mandatCreateSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis'),
  dateDebut: z.string().transform((str) => new Date(str)),
  dateFin: z.string().transform((str) => new Date(str)),
  pvDocumentUrl: z.string().optional().or(z.literal('')),
  affectations: z.array(z.object({
    memberId: z.string().min(1, 'Membre requis'),
    posteId: z.string().min(1, 'Poste requis'),
  })).optional(),
});

const mandatUpdateSchema = z.object({
  titre: z.string().min(1).optional(),
  dateDebut: z.string().transform((str) => new Date(str)).optional(),
  dateFin: z.string().transform((str) => new Date(str)).optional(),
  statut: z.enum(['ACTIF', 'EXPIRE', 'ARCHIVE']).optional(),
  pvDocumentUrl: z.string().url().optional().or(z.literal('')),
});

export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { page, limit, offset } = parsePagination(request);
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';
  const statut = searchParams.get('statut') || '';

  try {
    // Construire le filtre
    const where: any = {};
    
    if (search) {
      where.titre = {
        contains: search,
        mode: 'insensitive' as const,
      };
    }
    
    if (statut) {
      where.statut = statut;
    }

    const [total, mandats] = await Promise.all([
      prisma.mandat.count({ where }),
      prisma.mandat.findMany({
        where,
        orderBy: {
          dateDebut: 'desc',
        },
        include: {
          _count: {
            select: {
              affectations: true,
              contents: true,
              projets: true,
              events: true,
            },
          },
        },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(mandats, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des mandats:', error);
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
    const data = mandatCreateSchema.parse(body);

    // Si on crée un mandat ACTIF, désactiver les autres
    const statut: 'ACTIF' | 'EXPIRE' | 'ARCHIVE' = 'ACTIF';
    
    if (statut === 'ACTIF') {
      await prisma.mandat.updateMany({
        where: {
          statut: 'ACTIF',
        },
        data: {
          statut: 'EXPIRE',
        },
      });
    }

    // Vérifier qu'aucun membre n'a deux postes dans le même mandat
    if (data.affectations && data.affectations.length > 0) {
      const memberIds = data.affectations.map((aff) => aff.memberId);
      const uniqueMemberIds = new Set(memberIds);
      
      // Vérifier les doublons dans les affectations à créer
      if (memberIds.length !== uniqueMemberIds.size) {
        return NextResponse.json(
          { error: 'Un membre ne peut avoir qu\'un seul poste dans le même mandat' },
          { status: 400 }
        );
      }

      // Vérifier que tous les membres et postes existent
      const [existingMembers, existingPostes] = await Promise.all([
        prisma.member.findMany({
          where: { id: { in: memberIds } },
          select: { id: true },
        }),
        prisma.poste.findMany({
          where: { id: { in: data.affectations.map((aff) => aff.posteId) } },
          select: { id: true },
        }),
      ]);

      if (existingMembers.length !== memberIds.length) {
        return NextResponse.json(
          { error: 'Un ou plusieurs membres sélectionnés n\'existent pas' },
          { status: 400 }
        );
      }

      if (existingPostes.length !== data.affectations.length) {
        return NextResponse.json(
          { error: 'Un ou plusieurs postes sélectionnés n\'existent pas' },
          { status: 400 }
        );
      }
    }

    // Créer le mandat et les affectations en transaction
    const result = await prisma.$transaction(async (tx) => {
      const mandat = await tx.mandat.create({
        data: {
          titre: data.titre,
          dateDebut: data.dateDebut,
          dateFin: data.dateFin,
          statut,
          pvDocumentUrl: data.pvDocumentUrl || null,
        },
      });

      // Créer les affectations si fournies
      if (data.affectations && data.affectations.length > 0) {
        await Promise.all(
          data.affectations.map((aff) =>
            tx.affectationPoste.create({
              data: {
                mandatId: mandat.id,
                posteId: aff.posteId,
                memberId: aff.memberId,
                dateDebut: data.dateDebut,
                dateFin: data.dateFin,
                statut: 'ACTIF',
              },
            })
          )
        );
      }

      return mandat;
    });

    await logAction({
      userId: session!.user.id,
      action: 'CREATE',
      entityType: 'Mandat',
      entityId: result.id,
      afterData: result,
    });

    return NextResponse.json(
      { success: true, mandat: result },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création du mandat:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

