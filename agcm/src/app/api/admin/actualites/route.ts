// app/api/admin/actualites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Log pour déboguer
    console.log('Creating actualite with data:', {
      titre: data.titre,
      imageUrl: data.imageUrl,
      slug: data.slug,
    });

    // Slug is no longer used in Content model, we use ID.
    // So we don't need to check for existing slug here.

    const actualite = await prisma.content.create({
      data: {
        ...data,
        imagePrincipale: data.imageUrl && data.imageUrl.trim() !== '' ? data.imageUrl : null,
        approvedAt: data.datePublication ? new Date(data.datePublication) : null,
        statutWorkflow: data.published ? 'PUBLIE' : 'BROUILLON',
        visibiliteCible: 'PUBLIC_SITE',
      },
    });

    console.log('Actualite created with imagePrincipale:', actualite.imagePrincipale);

    return NextResponse.json({ success: true, actualite });
  } catch (error) {
    console.error('Error creating actualite:', error);
    return NextResponse.json({ error: 'Failed to create actualite' }, { status: 500 });
  }
}

