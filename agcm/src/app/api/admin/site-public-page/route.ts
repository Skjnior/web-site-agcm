import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/require-auth';
import { getSitePublicPayload } from '@/lib/site-public-server';
import { mergeSitePublicPayload, pickSitePublicPatch } from '@/lib/site-public-merge';

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const payload = await getSitePublicPayload();
    return NextResponse.json(payload);
  } catch (e) {
    console.error('[admin site-public-page GET]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const patch = pickSitePublicPatch(body);
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Aucune donnée valide à enregistrer' }, { status: 400 });
    }

    const current = await getSitePublicPayload();
    const next = mergeSitePublicPayload(current, patch);

    await prisma.sitePublicPage.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        payload: next as unknown as Prisma.InputJsonValue,
      },
      update: {
        payload: next as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(next);
  } catch (e) {
    console.error('[admin site-public-page PATCH]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
