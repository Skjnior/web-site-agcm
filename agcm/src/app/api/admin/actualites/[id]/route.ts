// app/api/admin/actualites/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getAdminSessionRole,
  isAdminRole,
  mapBodyToContentFields,
} from '@/lib/admin/actualite-map';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const role = getAdminSessionRole(session?.user);

    if (!session?.user || !isAdminRole(role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const raw = await req.json();
    const fields = mapBodyToContentFields(raw);

    if (!fields.titre) {
      return NextResponse.json({ error: 'Le titre est obligatoire.' }, { status: 400 });
    }

    const data: Prisma.ContentUpdateInput = {
      titre: fields.titre,
      contenu: fields.contenu,
      type: fields.type,
      tags: fields.tags,
      imagePrincipale: fields.imagePrincipale,
      statutWorkflow: fields.statutWorkflow,
    };
    if (fields.approvedAt !== undefined) {
      data.approvedAt = fields.approvedAt;
    }

    const actualite = await prisma.content.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, actualite });
  } catch (error) {
    console.error('Error updating actualite:', error);
    return NextResponse.json(
      {
        error:
          'Impossible d’enregistrer les modifications. Vérifiez les champs et réessayez. Si le problème persiste, consultez les journaux serveur ou contactez un administrateur.',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const userRole =
      (session?.user as { roleSysteme?: string; role?: string })?.roleSysteme ||
      session?.user?.role;

    if (!session?.user || userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Seul le super administrateur peut supprimer une actualité' },
        { status: 403 },
      );
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
