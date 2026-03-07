// app/api/admin/evenements/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.roleSysteme || session?.user?.role;

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(userRole as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await props.params;
    const data = await req.json();

    if (data.slug) {
      const existing = await prisma.event.findUnique({
        where: { slug: data.slug },
      });

      if (existing && existing.id !== resolvedParams.id) {
        return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (data.dateEvenement) {
      updateData.dateDebut = new Date(`${data.dateEvenement}T${data.heureDebut || '00:00'}:00`);
      updateData.dateFin = data.heureFin ? new Date(`${data.dateEvenement}T${data.heureFin}:00`) : updateData.dateDebut;
    }

    if (data.titre) updateData.titre = data.titre;
    if (data.slug) updateData.slug = data.slug;
    if (data.description) updateData.description = data.description;
    if (data.lieu) updateData.lieu = data.lieu;
    if (data.status) updateData.statut = data.status;
    if (data.published !== undefined) updateData.afficheSite = data.published;

    const evenement = await prisma.event.update({
      where: { id: resolvedParams.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, evenement });
  } catch (error) {
    console.error('Error updating evenement:', error);
    return NextResponse.json({ error: 'Failed to update evenement' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.roleSysteme || session?.user?.role;

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(userRole as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await props.params;

    await prisma.event.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting evenement:', error);
    return NextResponse.json({ error: 'Failed to delete evenement' }, { status: 500 });
  }
}

