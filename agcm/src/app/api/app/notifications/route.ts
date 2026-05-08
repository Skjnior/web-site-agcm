// src/app/api/app/notifications/route.ts
// Notifications de l'utilisateur connecté

import { NextRequest, NextResponse } from 'next/server';
import { requireIntranetAccess } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const { error, session } = await requireIntranetAccess();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const isRead = searchParams.get('isRead');
  const { page, limit, offset } = parsePagination(request);

  try {
    const where: { userId: string; isRead?: boolean } = {
      userId: session!.user!.id!,
    };
    if (isRead === 'true') where.isRead = true;
    if (isRead === 'false') where.isRead = false;

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(notifications, total, page, limit));
  } catch (err) {
    console.error('Erreur récupération notifications:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
