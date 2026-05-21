// src/app/api/bureau/projets/route.ts
// CRUD des projets (bureau)

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireBureauModule } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { projetCreateSchema } from '@/lib/validators/projet';
import { getBureauMandatContext } from '@/lib/rbac';
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
  const { error, session } = await requireBureauModule('projets');
  if (error) return error;

  try {
    const ctx = await getBureauMandatContext(session!.user.id);
    if (!ctx) {
      return NextResponse.json(
        { error: 'Vous devez avoir un poste actif sur le mandat en cours pour créer un projet' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = projetCreateSchema.parse(body);
    const medias = data.medias ?? [];

    // On ne pré-vérifie plus l'existence du poste/mandat en parallèle :
    // chaque requête supplémentaire consomme une connexion sur le pool
    // Prisma Postgres (très petit en tier gratuit). La contrainte FK du
    // create lèvera P2003 si poste/mandat manquent — géré dans le catch.
    //
    // De même, on ne pré-check pas l'unicité du slug : on tente le create
    // direct, et si P2002 on retry avec un suffixe.
    const baseSlug = slugify(data.titre) || 'projet';
    let finalSlug = baseSlug;

    let projet;
    try {
      projet = await prisma.projet.create({
        data: {
          titre: data.titre,
          slug: finalSlug,
          objectif: data.objectif,
          description: data.description,
          actions: data.actions,
          statut: data.statut,
          visibiliteSite: data.visibiliteSite,
          responsablePosteId: ctx.primaryAffectation.posteId,
          mandatId: ctx.mandatId,
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
    } catch (createErr) {
      // Retry une fois si conflit slug (race-condition entre findUnique et create)
      if (
        createErr instanceof Prisma.PrismaClientKnownRequestError &&
        createErr.code === 'P2002'
      ) {
        finalSlug = `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        projet = await prisma.projet.create({
          data: {
            titre: data.titre,
            slug: finalSlug,
            objectif: data.objectif,
            description: data.description,
            actions: data.actions,
            statut: data.statut,
            visibiliteSite: data.visibiliteSite,
            responsablePosteId: ctx.primaryAffectation.posteId,
            mandatId: ctx.mandatId,
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
      } else {
        throw createErr;
      }
    }

    await logAction({
      userId: session!.user.id,
      action: 'CREATE',
      entityType: 'Projet',
      entityId: projet.id,
      afterData: projet,
    });

    return NextResponse.json({ success: true, projet }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const detail = error.issues
        .map((i) => `${i.path.join('.') || '(racine)'}: ${i.message}`)
        .join(' ; ');
      return NextResponse.json(
        {
          error: `Données invalides — ${detail}`,
          details: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(
        `[POST /api/bureau/projets] Prisma ${error.code} :`,
        error.message,
        error.meta,
      );

      if (error.code === 'P2037') {
        return NextResponse.json(
          {
            error:
              'Le serveur de base de données est saturé (trop de connexions ouvertes). Réessayez dans quelques secondes.',
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          error: `Erreur base de données (${error.code}) : ${
            error.code === 'P2002'
              ? 'doublon détecté sur ' + JSON.stringify(error.meta?.target ?? '?')
              : error.code === 'P2003'
                ? 'contrainte FK violée sur ' + JSON.stringify(error.meta?.constraint ?? '?')
                : error.message
          }`,
        },
        { status: 500 },
      );
    }

    console.error('[POST /api/bureau/projets] Erreur inconnue :', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Erreur serveur : ${error.message}`
            : 'Erreur serveur inconnue',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { error, session } = await requireBureauModule('projets');
  if (error) return error;

  const { page, limit, offset } = parsePagination(request);

  try {
    const ctx = await getBureauMandatContext(session!.user.id);
    if (!ctx) {
      return NextResponse.json(
        { error: 'Vous devez avoir un poste actif sur le mandat en cours' },
        { status: 403 }
      );
    }

    const where = {
      responsablePosteId: { in: ctx.posteIds },
      mandatId: ctx.mandatId,
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

