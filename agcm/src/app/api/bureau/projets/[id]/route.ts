// src/app/api/bureau/projets/[id]/route.ts
// Lecture / mise à jour / suppression d’un projet dont le poste responsable est le vôtre (mandat actif)

import { NextRequest, NextResponse } from 'next/server';
import { requireBureauModule } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { projetUpdateSchema } from '@/lib/validators/projet';
import { getBureauMandatContext } from '@/lib/rbac';
import { logAction } from '@/lib/audit';
import { z } from 'zod';

async function findOwnedProjet(id: string, userId: string) {
  const ctx = await getBureauMandatContext(userId);
  if (!ctx) return null;
  const projet = await prisma.projet.findFirst({
    where: {
      id,
      responsablePosteId: { in: ctx.posteIds },
      mandatId: ctx.mandatId,
    },
  });
  return projet;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireBureauModule('projets');
  if (error) return error;

  const { id } = await params;
  const projetRow = await findOwnedProjet(id, session!.user.id);
  if (!projetRow) {
    return NextResponse.json({ error: 'Projet introuvable ou non autorisé' }, { status: 404 });
  }

  const full = await prisma.projet.findUnique({
    where: { id },
    include: {
      responsablePoste: { select: { id: true, nom: true } },
      mandat: { select: { id: true, titre: true } },
      medias: true,
      partenaires: { include: { partner: true } },
    },
  });

  return NextResponse.json({ projet: full });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireBureauModule('projets');
  if (error) return error;

  const { id } = await params;
  const existing = await findOwnedProjet(id, session!.user.id);
  if (!existing) {
    return NextResponse.json({ error: 'Projet introuvable ou non autorisé' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = projetUpdateSchema.parse(body);
    const definedKeys = Object.keys(data).filter(
      (key) => data[key as keyof typeof data] !== undefined
    );
    if (definedKeys.length === 0) {
      return NextResponse.json({ error: 'Aucun champ à modifier' }, { status: 400 });
    }

    const updateData: Prisma.ProjetUpdateInput = {};
    if (data.titre !== undefined) updateData.titre = data.titre;
    if (data.objectif !== undefined) updateData.objectif = data.objectif;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.actions !== undefined) updateData.actions = data.actions === '' ? null : data.actions;
    if (data.statut !== undefined) updateData.statut = data.statut;
    if (data.visibiliteSite !== undefined) updateData.visibiliteSite = data.visibiliteSite;

    await prisma.$transaction(async (tx) => {
      if (data.medias !== undefined) {
        await tx.projetMedia.deleteMany({ where: { projetId: id } });
        if (data.medias.length > 0) {
          await tx.projetMedia.createMany({
            data: data.medias.map((m, i) => ({
              projetId: id,
              url: m.url,
              type: m.type,
              ordre: m.ordre ?? i,
            })),
          });
        }
      }
      if (Object.keys(updateData).length > 0) {
        await tx.projet.update({
          where: { id },
          data: updateData,
        });
      }
    });

    const updated = await prisma.projet.findUnique({
      where: { id },
      include: {
        responsablePoste: { select: { id: true, nom: true } },
        mandat: { select: { id: true, titre: true } },
        medias: true,
        partenaires: { include: { partner: true } },
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'Projet',
      entityId: id,
      beforeData: existing,
      afterData: updated,
    });

    return NextResponse.json({ success: true, projet: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: err.issues }, { status: 400 });
    }
    console.error('PATCH projet bureau:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireBureauModule('projets');
  if (error) return error;

  const { id } = await params;
  const existing = await findOwnedProjet(id, session!.user.id);
  if (!existing) {
    return NextResponse.json({ error: 'Projet introuvable ou non autorisé' }, { status: 404 });
  }

  await prisma.projet.delete({ where: { id } });

  await logAction({
    userId: session!.user.id,
    action: 'DELETE',
    entityType: 'Projet',
    entityId: id,
    beforeData: existing,
  });

  return NextResponse.json({ success: true });
}
