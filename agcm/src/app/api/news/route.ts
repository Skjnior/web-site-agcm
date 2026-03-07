import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? undefined;
    const categorie = searchParams.get('categorie') ?? undefined;
    const publishedParam = searchParams.get('published');
    const published = publishedParam === null ? true : publishedParam === 'true';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12', 10)));
    const skip = (page - 1) * pageSize;

    const where: Prisma.ContentWhereInput = {
      ...(published !== undefined ? { statutWorkflow: published ? 'PUBLIE' : 'BROUILLON' } : {}),
      ...(categorie ? { type: categorie as any } : {}),
      ...(q
        ? {
          OR: [
            { titre: { contains: q, mode: 'insensitive' } },
            { contenu: { contains: q, mode: 'insensitive' } },
          ],
        }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.content.count({ where }),
      prisma.content.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          titre: true,
          type: true,
          imagePrincipale: true,
          createdAt: true,
          statutWorkflow: true,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: items, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    console.error('News list error:', error);
    return NextResponse.json({ success: false, error: 'Unable to fetch news' }, { status: 500 });
  }
}
