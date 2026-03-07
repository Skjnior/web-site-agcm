// app/api/admin/actualites/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Log pour déboguer
    console.log('Updating actualite with data:', {
      id,
      titre: data.titre,
      imageUrl: data.imageUrl,
      slug: data.slug,
    });

    // Slug check removed as Content uses ID

    const actualite = await prisma.content.update({
      where: { id },
      data: {
        ...data,
        imagePrincipale: data.imageUrl && data.imageUrl.trim() !== '' ? data.imageUrl : null,
        approvedAt: data.datePublication ? new Date(data.datePublication) : undefined,
        statutWorkflow: data.published ? 'PUBLIE' : 'BROUILLON',
      },
    });

    console.log('Actualite updated with imagePrincipale:', actualite.imagePrincipale);

    return NextResponse.json({ success: true, actualite });
  } catch (error) {
    console.error('Error updating actualite:', error);
    return NextResponse.json({ error: 'Failed to update actualite' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.content.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting actualite:', error);
    return NextResponse.json({ error: 'Failed to delete actualite' }, { status: 500 });
  }
}

