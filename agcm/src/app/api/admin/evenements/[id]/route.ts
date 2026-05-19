// app/api/admin/evenements/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeEventStatut } from '@/lib/admin/event-map';

function parseLocalDateTime(dateStr: string, timeStr?: string): Date {
  const t =
    typeof timeStr === 'string' && timeStr.length >= 5
      ? timeStr.length === 5
        ? `${timeStr}:00`
        : timeStr
      : '00:00:00';
  return new Date(`${dateStr}T${t}`);
}

async function syncPrincipalMedia(eventId: string, imageUrl: unknown) {
  const trimmed = typeof imageUrl === 'string' ? imageUrl.trim() : '';
  const principals = await prisma.eventMedia.findMany({
    where: { eventId, isPrincipale: true },
    orderBy: { ordre: 'asc' },
  });

  if (!trimmed) {
    await prisma.eventMedia.deleteMany({ where: { eventId, isPrincipale: true } });
    return;
  }

  const first = principals[0];
  if (first) {
    await prisma.eventMedia.update({
      where: { id: first.id },
      data: { url: trimmed },
    });
    const extras = principals.slice(1).map((p) => p.id);
    if (extras.length) {
      await prisma.eventMedia.deleteMany({ where: { id: { in: extras } } });
    }
  } else {
    await prisma.eventMedia.create({
      data: {
        eventId,
        url: trimmed,
        isPrincipale: true,
        ordre: 0,
      },
    });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole = (session?.user as { roleSysteme?: string; role?: string })?.roleSysteme ||
      session?.user?.role;

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(userRole as string)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const resolvedParams = await props.params;
    const id = resolvedParams.id;
    const data = await req.json();

    if (typeof data.slug === 'string' && data.slug.trim()) {
      const existing = await prisma.event.findUnique({
        where: { slug: data.slug.trim() },
      });

      if (existing && existing.id !== id) {
        return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 400 });
      }
    }

    const updateData: Parameters<typeof prisma.event.update>[0]['data'] = {};

    if (typeof data.titre === 'string') updateData.titre = data.titre.trim();
    if (typeof data.slug === 'string') updateData.slug = data.slug.trim();
    if (typeof data.description === 'string') updateData.description = data.description;

    if (typeof data.lieu === 'string') {
      const l = data.lieu.trim();
      updateData.lieu = l === '' ? null : l;
    }

    if (typeof data.dateEvenement === 'string' && data.dateEvenement) {
      updateData.dateDebut = parseLocalDateTime(data.dateEvenement, data.heureDebut as string | undefined);
      updateData.dateFin =
        typeof data.heureFin === 'string' && data.heureFin.length >= 5
          ? parseLocalDateTime(data.dateEvenement, data.heureFin)
          : updateData.dateDebut;
    }

    if (data.status !== undefined && data.status !== null) {
      updateData.statut = normalizeEventStatut(data.status);
    }

    if (typeof data.published === 'boolean') {
      updateData.afficheSite = data.published;
    }

    const evenement = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    if (Object.prototype.hasOwnProperty.call(data, 'imageUrl')) {
      await syncPrincipalMedia(id, data.imageUrl);
    }

    return NextResponse.json({ success: true, evenement });
  } catch (error) {
    console.error('Error updating evenement:', error);
    return NextResponse.json(
      { error: 'Impossible de mettre à jour l’événement.' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userRole =
      (session?.user as { roleSysteme?: string; role?: string })?.roleSysteme ||
      session?.user?.role;

    if (!session?.user || userRole !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Seul le super administrateur peut supprimer un événement' },
        { status: 403 },
      );
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
