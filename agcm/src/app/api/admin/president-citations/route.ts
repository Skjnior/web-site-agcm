import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/require-auth';

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const items = await prisma.presidentCitation.findMany({
      orderBy: { debutMandat: 'desc' },
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error('[president-citations GET]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const body = (await req.json()) as {
      nom?: string;
      message?: string;
      debutMandat?: string;
      finMandat?: string | null;
      photoUrl?: string | null;
    };

    const nom = typeof body.nom === 'string' ? body.nom.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!nom || !message) {
      return NextResponse.json({ error: 'Nom et message sont requis' }, { status: 400 });
    }

    const debut = body.debutMandat ? new Date(body.debutMandat) : null;
    if (!debut || Number.isNaN(debut.getTime())) {
      return NextResponse.json({ error: 'Date de début de mandat invalide' }, { status: 400 });
    }

    let fin: Date | null = null;
    if (body.finMandat != null && String(body.finMandat).trim() !== '') {
      fin = new Date(body.finMandat);
      if (Number.isNaN(fin.getTime())) {
        return NextResponse.json({ error: 'Date de fin de mandat invalide' }, { status: 400 });
      }
    }

    const photoUrl =
      typeof body.photoUrl === 'string' && body.photoUrl.trim() !== ''
        ? body.photoUrl.trim()
        : null;

    const created = await prisma.presidentCitation.create({
      data: {
        nom,
        message,
        debutMandat: debut,
        finMandat: fin,
        photoUrl,
      },
    });
    return NextResponse.json(created);
  } catch (e) {
    console.error('[president-citations POST]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
