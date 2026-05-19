import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireGalerieManage } from '@/lib/require-auth';
import { galerieImageUpdateSchema } from '@/lib/validators/galerie';
import { logAction } from '@/lib/audit';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { error, session } = await requireGalerieManage();
  if (error) return error;

  const { id } = await params;

  try {
    const existing = await prisma.galerieImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Image introuvable' }, { status: 404 });
    }

    const body = await request.json();
    const data = galerieImageUpdateSchema.parse(body);

    const image = await prisma.galerieImage.update({
      where: { id },
      data,
    });

    await logAction({
      userId: session!.user!.id!,
      action: 'UPDATE',
      entityType: 'GalerieImage',
      entityId: id,
      beforeData: existing,
      afterData: image,
    });

    return NextResponse.json({ image });
  } catch (e) {
    if (e instanceof Error && e.name === 'ZodError') {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    console.error('PATCH /api/bureau/galerie/[id]:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { error, session } = await requireGalerieManage();
  if (error) return error;

  const { id } = await params;

  try {
    const existing = await prisma.galerieImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Image introuvable' }, { status: 404 });
    }

    await prisma.galerieImage.delete({ where: { id } });

    await logAction({
      userId: session!.user!.id!,
      action: 'DELETE',
      entityType: 'GalerieImage',
      entityId: id,
      beforeData: existing,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/bureau/galerie/[id]:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
