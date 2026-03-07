// src/app/api/bureau/contents/route.ts
// Gestion des contenus du bureau (membres bureau uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireBureau } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { getAffectationActive } from '@/lib/rbac';
import { getMandatActif } from '@/lib/mandat';
import { contentCreateSchema } from '@/lib/validators/content';

export async function GET(request: NextRequest) {
  const { error, session } = await requireBureau();
  if (error) return error;

  const affectation = await getAffectationActive(session!.user!.id!);
  const mandatActif = await getMandatActif();
  if (!affectation || !mandatActif) {
    return NextResponse.json(
      { error: 'Aucun poste bureau actif' },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const { page, limit, offset } = parsePagination(request);

  try {
    const where: Record<string, unknown> = {
      auteurPosteId: affectation.posteId,
      mandatId: mandatActif.id,
    };

    if (status && status !== 'ALL') {
      where.statutWorkflow = status;
    }

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
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(contents, total, page, limit));
  } catch (err) {
    console.error('Erreur récupération contenus bureau:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireBureau();
  if (error) return error;

  const affectation = await getAffectationActive(session!.user!.id!);
  const mandatActif = await getMandatActif();
  if (!affectation || !mandatActif) {
    return NextResponse.json(
      { error: 'Aucun poste bureau actif' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = contentCreateSchema.parse(body);

    const content = await prisma.content.create({
      data: {
        type: data.type,
        titre: data.titre,
        contenu: data.contenu || null,
        lienExterne: data.lienExterne || null,
        imagePrincipale: data.imagePrincipale || null,
        tags: data.tags || [],
        visibiliteCible: data.visibiliteCible,
        statutWorkflow: 'BROUILLON',
        auteurPosteId: affectation.posteId,
        mandatId: mandatActif.id,
      },
      include: {
        auteurPoste: { select: { id: true, nom: true } },
        mandat: { select: { id: true, titre: true } },
      },
    });

    return NextResponse.json({ content });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json(
        { error: 'Données invalides', details: (err as { issues: unknown }).issues },
        { status: 400 }
      );
    }
    console.error('Erreur création contenu bureau:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
