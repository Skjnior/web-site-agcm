import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireGalerieManage } from '@/lib/require-auth';
import { galerieImageCreateSchema } from '@/lib/validators/galerie';
import { logAction } from '@/lib/audit';

export async function GET() {
  const { error, session } = await requireGalerieManage();
  if (error) return error;

  try {
    const images = await prisma.galerieImage.findMany({
      orderBy: [{ ordre: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ images });
  } catch (e) {
    console.error('GET /api/bureau/galerie:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireGalerieManage();
  if (error) return error;

  try {
    const body = await request.json();
    const data = galerieImageCreateSchema.parse(body);

    const maxOrdre = await prisma.galerieImage.aggregate({ _max: { ordre: true } });
    const ordre = data.ordre ?? (maxOrdre._max.ordre ?? 0) + 1;

    const image = await prisma.galerieImage.create({
      data: {
        url: data.url,
        alt: data.alt ?? '',
        visibleSite: data.visibleSite ?? false,
        ordre,
        createdByUserId: session!.user!.id!,
      },
    });

    await logAction({
      userId: session!.user!.id!,
      action: 'CREATE',
      entityType: 'GalerieImage',
      entityId: image.id,
      afterData: image,
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.name === 'ZodError') {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    console.error('POST /api/bureau/galerie:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
