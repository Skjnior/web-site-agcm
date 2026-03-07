// app/api/evenements/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    console.log('GET /api/evenements/[slug] - Event slug:', decodedSlug);
    
    const evenement = await prisma.event.findUnique({
      where: { slug: decodedSlug },
      include: {
        medias: true,
      },
    });

    if (!evenement) {
      console.log('Event not found for slug:', decodedSlug);
      return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
    }
    
    console.log('Event found:', evenement.titre);

    const placesDisponibles = null;

    return NextResponse.json({
      ...evenement,
      placesDisponibles,
    });
  } catch (error) {
    console.error('Error fetching evenement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'événement' },
      { status: 500 }
    );
  }
}

