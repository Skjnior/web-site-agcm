// src/app/api/admin/approbations/route.ts
// Liste des contenus en attente d'approbation (Président/Admin)

import { NextRequest, NextResponse } from 'next/server';
import { StatutWorkflow } from '@prisma/client';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const status = (searchParams.get('status') || 'SOUMIS') as StatutWorkflow;
  const { page, limit, offset } = parsePagination(request);

  try {
    const where = {
      statutWorkflow: status,
    };

    const [total, contents] = await Promise.all([
      prisma.content.count({ where }),
      prisma.content.findMany({
        where,
        include: {
          auteurPoste: {
            select: {
              id: true,
              nom: true,
              affectations: {
                where: { statut: 'ACTIF' },
                include: {
                  member: {
                    select: {
                      prenom: true,
                      nom: true,
                      user: { select: { email: true } },
                    },
                  },
                },
              },
            },
          },
          mandat: { select: { id: true, titre: true } },
          approvedBy: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(contents, total, page, limit));
  } catch (err) {
    console.error('Erreur approbations:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
