import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** Partenaires affichés sur le site public. */
export async function GET() {
  try {
    const partenaires = await prisma.partner.findMany({
      where: {
        visibiliteSite: true,
        statut: 'ACTIF',
      },
      orderBy: [{ nom: 'asc' }],
      select: {
        id: true,
        nom: true,
        logo: true,
        description: true,
        siteUrl: true,
        type: true,
      },
    });

    return NextResponse.json({ partenaires });
  } catch (error) {
    console.error('GET /api/public/partenaires:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
