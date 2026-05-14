// src/app/api/bureau/contents/route.ts
// Gestion des contenus du bureau (membres bureau uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireBureauModule } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { canDeleteContent, getBureauMandatContext } from '@/lib/rbac';
import { contentCreateSchema } from '@/lib/validators/content';

export async function GET(request: NextRequest) {
  const { error, session } = await requireBureauModule('contents');
  if (error) return error;

  const ctx = await getBureauMandatContext(session!.user!.id!);
  if (!ctx) {
    return NextResponse.json(
      { error: 'Aucun poste actif sur le mandat en cours' },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const { page, limit, offset } = parsePagination(request);

  try {
    const where: Record<string, unknown> = {
      auteurPosteId: { in: ctx.posteIds },
      mandatId: ctx.mandatId,
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

    const userId = session!.user!.id!;
    const data = await Promise.all(
      contents.map(async (c) => ({
        ...c,
        canDelete: await canDeleteContent(userId, c.id),
      })),
    );

    return NextResponse.json(createPaginatedResponse(data, total, page, limit));
  } catch (err) {
    console.error('Erreur récupération contenus bureau:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireBureauModule('contents');
  if (error) return error;

  const ctx = await getBureauMandatContext(session!.user!.id!);
  if (!ctx) {
    return NextResponse.json(
      { error: 'Aucun poste actif sur le mandat en cours' },
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
        attachments: data.attachments?.length ? data.attachments : [],
        tags: data.tags || [],
        visibiliteCible: data.visibiliteCible,
        statutWorkflow: 'BROUILLON',
        auteurPosteId: ctx.primaryAffectation.posteId,
        mandatId: ctx.mandatId,
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
