// src/app/api/admin/membres/route.ts
// Gestion des membres (Admin/Président)

import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import type { StatutMembre } from '@prisma/client';
import { requireAdmin } from '@/lib/require-auth';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { listMembersForAdmin } from '@/lib/membres-admin-list';

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const statusFilter = searchParams.get('status');
  const search = searchParams.get('q') || '';
  const bureauOnly = searchParams.get('bureau') === '1';
  const { page, limit, offset } = parsePagination(request);

  try {
    const baseWhere: Prisma.MemberWhereInput = {};

    if (statusFilter && statusFilter !== 'all') {
      baseWhere.statutMembre = statusFilter as StatutMembre;
    }

    if (search) {
      baseWhere.OR = [
        { prenom: { contains: search, mode: 'insensitive' } },
        { nom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { telephone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const { total, members } = await listMembersForAdmin({
      baseWhere,
      skip: offset,
      take: limit,
      bureauOnly,
    });

    return NextResponse.json(createPaginatedResponse(members, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
