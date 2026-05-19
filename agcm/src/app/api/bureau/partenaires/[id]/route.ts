import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePartenairesManage } from '@/lib/require-auth';
import { partnerUpdateSchema } from '@/lib/validators/galerie';
import { logAction } from '@/lib/audit';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { error, session } = await requirePartenairesManage();
  if (error) return error;

  const { id } = await params;

  try {
    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Partenaire introuvable' }, { status: 404 });
    }

    const body = await request.json();
    const data = partnerUpdateSchema.parse(body);

    const partenaire = await prisma.partner.update({
      where: { id },
      data: {
        ...data,
        siteUrl: data.siteUrl === '' ? null : data.siteUrl,
      },
    });

    await logAction({
      userId: session!.user!.id!,
      action: 'UPDATE',
      entityType: 'Partner',
      entityId: id,
      beforeData: existing,
      afterData: partenaire,
    });

    return NextResponse.json({ partenaire });
  } catch (e) {
    if (e instanceof Error && e.name === 'ZodError') {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    console.error('PATCH /api/bureau/partenaires/[id]:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { error, session } = await requirePartenairesManage();
  if (error) return error;

  const { id } = await params;

  try {
    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Partenaire introuvable' }, { status: 404 });
    }

    await prisma.partner.delete({ where: { id } });

    await logAction({
      userId: session!.user!.id!,
      action: 'DELETE',
      entityType: 'Partner',
      entityId: id,
      beforeData: existing,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/bureau/partenaires/[id]:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
