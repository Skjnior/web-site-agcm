import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? undefined;
    const type = searchParams.get('type') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const publishedParam = searchParams.get('published');
    const published = publishedParam === null ? true : publishedParam === 'true';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12', 10)));
    const skip = (page - 1) * pageSize;

    const where: Prisma.EvenementWhereInput = {
      ...(published !== undefined ? { published } : {}),
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { titre: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.evenement.count({ where }),
      prisma.evenement.findMany({
        where,
        orderBy: { dateEvenement: 'asc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          titre: true,
          slug: true,
          description: true,
          dateEvenement: true,
          lieu: true,
          type: true,
          imageUrl: true,
          published: true,
          status: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error('Events list error:', error);
    return NextResponse.json({ success: false, error: 'Unable to fetch events' }, { status: 500 });
  }
}
