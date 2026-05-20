// src/app/api/admin/projets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
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

const adminProjetCreateSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200),
  objectif: z.string().min(1, 'L\'objectif est requis'),
  description: z.string().min(1, 'La description est requise'),
  actions: z.string().nullable().optional(),
  statut: z.enum(['BROUILLON', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE']).optional().default('BROUILLON'),
  visibiliteSite: z.boolean().optional().default(false),
  responsablePosteId: z.string().min(1, 'Le responsable est requis'),
  mandatId: z.string().min(1, 'Le mandat est requis'),
  medias: z.array(z.object({
    url: z.string(),
    type: z.enum(['IMAGE', 'DOCUMENT']),
    ordre: z.number().int().optional(),
  })).optional().default([]),
});

export async function GET(request: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { page, limit, offset } = parsePagination(request);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || '';
  const visibilite = searchParams.get('visibilite') || '';

  try {
    const where: any = {};
    if (q) {
      where.OR = [
        { titre: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (status && status !== 'all') {
      where.statut = status;
    }
    if (visibilite === 'true') {
      where.visibiliteSite = true;
    } else if (visibilite === 'false') {
      where.visibiliteSite = false;
    }

    const [total, projets] = await Promise.all([
      prisma.projet.count({ where }),
      prisma.projet.findMany({
        where,
        include: {
          responsablePoste: true,
          mandat: true,
          medias: true,
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
    console.error('Erreur lors de la récupération des projets admin:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const data = adminProjetCreateSchema.parse(body);
    const medias = data.medias ?? [];

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
        actions: data.actions ?? null,
        statut: data.statut,
        visibiliteSite: data.visibiliteSite,
        responsablePosteId: data.responsablePosteId,
        mandatId: data.mandatId,
        ...(medias.length > 0 && {
          medias: {
            create: medias.map((m, i) => ({
              url: m.url,
              type: m.type,
              ordre: m.ordre ?? i,
            })),
          },
        }),
      },
      include: { medias: true },
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

    console.error('Erreur lors de la création du projet admin:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
