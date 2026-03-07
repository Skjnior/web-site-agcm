// src/app/api/bureau/projets/route.ts
// CRUD des projets (bureau)

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { projetCreateSchema } from '@/lib/validators/projet';
import { getAffectationActive } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import { logAction } from '@/lib/audit';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { z } from 'zod';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const affectation = await getAffectationActive(session!.user.id);
    if (!affectation) {
      return NextResponse.json(
        { error: 'Vous devez avoir un poste actif pour créer un projet' },
        { status: 403 }
      );
    }

    const mandatActif = await getMandatActif();
    if (!mandatActif) {
      return NextResponse.json(
        { error: 'Aucun mandat actif' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = projetCreateSchema.parse(body);

    // Générer le slug
    const slug = slugify(data.titre);
    
    // Vérifier l'unicité du slug
    const existing = await prisma.projet.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const projet = await prisma.projet.create({
      data: {
        titre: data.titre,
        slug: finalSlug,
        objectif: data.objectif,
        description: data.description,
        actions: data.actions,
        statut: data.statut,
        visibiliteSite: data.visibiliteSite,
        responsablePosteId: affectation.posteId,
        mandatId: mandatActif.id,
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'CREATE',
      entityType: 'Projet',
      entityId: projet.id,
      afterData: projet,
    });

    return NextResponse.json(
      { success: true, projet },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création du projet:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { page, limit, offset } = parsePagination(request);

  try {
    const affectation = await getAffectationActive(session!.user.id);
    if (!affectation) {
      return NextResponse.json(
        { error: 'Vous devez avoir un poste actif' },
        { status: 403 }
      );
    }

    const where = {
      responsablePosteId: affectation.posteId,
    };

    const [total, projets] = await Promise.all([
      prisma.projet.count({ where }),
      prisma.projet.findMany({
        where,
        include: {
          responsablePoste: true,
          mandat: true,
          medias: true,
          partenaires: {
            include: {
              partner: true,
            },
          },
          _count: {
            select: {
              medias: true,
              partenaires: true,
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

