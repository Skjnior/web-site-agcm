import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** Images visibles sur le site public uniquement. */
export async function GET() {
  try {
    const images = await prisma.galerieImage.findMany({
      where: { visibleSite: true },
      orderBy: [{ ordre: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        url: true,
        alt: true,
      },
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error('GET /api/public/galerie:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
