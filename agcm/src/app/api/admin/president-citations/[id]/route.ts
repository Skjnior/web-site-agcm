import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/require-auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const existing = await prisma.presidentCitation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Citation introuvable' }, { status: 404 });
    }

    const body = (await req.json()) as {
      nom?: string;
      message?: string;
      debutMandat?: string;
      finMandat?: string | null;
      photoUrl?: string | null;
    };

    const nom = typeof body.nom === 'string' ? body.nom.trim() : existing.nom;
    const message = typeof body.message === 'string' ? body.message.trim() : existing.message;
    if (!nom || !message) {
      return NextResponse.json({ error: 'Nom et message sont requis' }, { status: 400 });
    }

    let debutMandat = existing.debutMandat;
    if (body.debutMandat !== undefined) {
      const d = new Date(body.debutMandat);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: 'Date de début de mandat invalide' }, { status: 400 });
      }
      debutMandat = d;
    }

    let finMandat: Date | null = existing.finMandat;
    if (body.finMandat === null || body.finMandat === '') {
      finMandat = null;
    } else if (body.finMandat !== undefined) {
      const f = new Date(body.finMandat);
      if (Number.isNaN(f.getTime())) {
        return NextResponse.json({ error: 'Date de fin de mandat invalide' }, { status: 400 });
      }
      finMandat = f;
    }

    let photoUrl = existing.photoUrl;
    if (body.photoUrl !== undefined) {
      photoUrl =
        typeof body.photoUrl === 'string' && body.photoUrl.trim() !== ''
          ? body.photoUrl.trim()
          : null;
    }

    const updated = await prisma.presidentCitation.update({
      where: { id },
      data: { nom, message, debutMandat, finMandat, photoUrl },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error('[president-citations PATCH]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    await prisma.presidentCitation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Citation introuvable ou suppression impossible' }, { status: 404 });
  }
}
