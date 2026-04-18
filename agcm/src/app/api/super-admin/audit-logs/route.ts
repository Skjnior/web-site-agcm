// src/app/api/super-admin/audit-logs/route.ts
// Logs d'audit (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  const userId = searchParams.get('userId');
  const action = searchParams.get('action');
  const search = searchParams.get('search') || '';
  const { page, limit, offset } = parsePagination(request);

  try {
    const baseWhere: Record<string, unknown> = {
      ...(entityType && entityType !== 'all' ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
      ...(userId ? { userId } : {}),
      ...(action && action !== 'all' ? { action } : {}),
    };

    const searchWhere = {
      OR: [
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
        { actorEmail: { contains: search, mode: 'insensitive' as const } },
      ],
    };

    const hasSearch = search.trim().length > 0;
    const hasBase = Object.keys(baseWhere).length > 0;

    const where: Record<string, unknown> =
      hasSearch && hasBase
        ? { AND: [baseWhere, searchWhere] }
        : hasSearch
          ? searchWhere
          : baseWhere;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
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

    return NextResponse.json(createPaginatedResponse(logs, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

