import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePartenairesManage } from '@/lib/require-auth';
import { partnerCreateSchema } from '@/lib/validators/galerie';
import { logAction } from '@/lib/audit';

export async function GET() {
  const { error } = await requirePartenairesManage();
  if (error) return error;

  try {
    const partenaires = await prisma.partner.findMany({
      orderBy: [{ nom: 'asc' }],
    });
    return NextResponse.json({ partenaires });
  } catch (e) {
    console.error('GET /api/bureau/partenaires:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await requirePartenairesManage();
  if (error) return error;

  try {
    const body = await request.json();
    const data = partnerCreateSchema.parse(body);

    const partenaire = await prisma.partner.create({
      data: {
        nom: data.nom,
        logo: data.logo || null,
        description: data.description || null,
        siteUrl: data.siteUrl || null,
        type: data.type || null,
        statut: data.statut ?? 'ACTIF',
        visibiliteSite: data.visibiliteSite ?? true,
      },
    });

    await logAction({
      userId: session!.user!.id!,
      action: 'CREATE',
      entityType: 'Partner',
      entityId: partenaire.id,
      afterData: partenaire,
    });

    return NextResponse.json({ partenaire }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.name === 'ZodError') {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    console.error('POST /api/bureau/partenaires:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
