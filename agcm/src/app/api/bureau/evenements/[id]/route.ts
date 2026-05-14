// src/app/api/bureau/evenements/[id]/route.ts
// Lecture / mise à jour / suppression d’un événement créé par votre poste (mandat actif)

import { NextRequest, NextResponse } from 'next/server';
import { requireBureauModule } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { eventUpdateSchema } from '@/lib/validators/event';
import { getBureauMandatContext } from '@/lib/rbac';
import { logAction } from '@/lib/audit';
import { z } from 'zod';
import type { EventStatut } from '@prisma/client';

function computeEvenementStatut(dateDebut: Date, dateFin: Date | null): EventStatut {
  const now = Date.now();
  if (dateDebut.getTime() > now) return 'A_VENIR';
  if (dateFin != null && dateFin.getTime() > now) return 'EN_COURS';
  return 'PASSE';
}

async function findOwnedEvent(id: string, userId: string) {
  const ctx = await getBureauMandatContext(userId);
  if (!ctx) return null;
  return prisma.event.findFirst({
    where: {
      id,
      createdByPosteId: { in: ctx.posteIds },
      mandatId: ctx.mandatId,
    },
  });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireBureauModule('evenements');
  if (error) return error;

  const { id } = await params;
  const row = await findOwnedEvent(id, session!.user.id);
  if (!row) {
    return NextResponse.json({ error: 'Événement introuvable ou non autorisé' }, { status: 404 });
  }

  const full = await prisma.event.findUnique({
    where: { id },
    include: {
      createdByPoste: { select: { id: true, nom: true } },
      mandat: { select: { id: true, titre: true } },
      medias: true,
    },
  });

  return NextResponse.json({ event: full });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireBureauModule('evenements');
  if (error) return error;

  const { id } = await params;
  const existing = await findOwnedEvent(id, session!.user.id);
  if (!existing) {
    return NextResponse.json({ error: 'Événement introuvable ou non autorisé' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = eventUpdateSchema.parse(body);
    const definedKeys = Object.keys(data).filter(
      (key) => data[key as keyof typeof data] !== undefined
    );
    if (definedKeys.length === 0) {
      return NextResponse.json({ error: 'Aucun champ à modifier' }, { status: 400 });
    }

    const updateData: Prisma.EventUpdateInput = {};
    if (data.titre !== undefined) updateData.titre = data.titre;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dateDebut !== undefined) updateData.dateDebut = data.dateDebut;
    if (data.dateFin !== undefined) updateData.dateFin = data.dateFin;
    if (data.lieu !== undefined) updateData.lieu = data.lieu;
    if (data.afficheSite !== undefined) updateData.afficheSite = data.afficheSite;

    const mergedDebut = data.dateDebut ?? existing.dateDebut;
    const mergedFin = data.dateFin !== undefined ? data.dateFin : existing.dateFin;
    updateData.statut = computeEvenementStatut(mergedDebut, mergedFin);

    await prisma.$transaction(async (tx) => {
      if (data.medias !== undefined) {
        await tx.eventMedia.deleteMany({ where: { eventId: id } });
        if (data.medias.length > 0) {
          await tx.eventMedia.createMany({
            data: data.medias.map((m, i) => ({
              eventId: id,
              url: m.url,
              isPrincipale: Boolean(m.isPrincipale),
              ordre: m.ordre ?? i,
            })),
          });
        }
      }
      await tx.event.update({
        where: { id },
        data: updateData,
      });
    });

    const updated = await prisma.event.findUnique({
      where: { id },
      include: {
        createdByPoste: { select: { id: true, nom: true } },
        mandat: { select: { id: true, titre: true } },
        medias: true,
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'Event',
      entityId: id,
      beforeData: existing,
      afterData: updated,
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: err.issues }, { status: 400 });
    }
    console.error('PATCH événement bureau:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireBureauModule('evenements');
  if (error) return error;

  const { id } = await params;
  const existing = await findOwnedEvent(id, session!.user.id);
  if (!existing) {
    return NextResponse.json({ error: 'Événement introuvable ou non autorisé' }, { status: 404 });
  }

  await prisma.event.delete({ where: { id } });

  await logAction({
    userId: session!.user.id,
    action: 'DELETE',
    entityType: 'Event',
    entityId: id,
    beforeData: existing,
  });

  return NextResponse.json({ success: true });
}
