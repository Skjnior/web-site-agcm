// src/app/api/admin/projets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { logAction } from '@/lib/audit';
import { z } from 'zod';

const adminProjetUpdateSchema = z.object({
  titre: z.string().min(1).max(200).optional(),
  objectif: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  actions: z.string().nullable().optional(),
  statut: z.enum(['BROUILLON', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE']).optional(),
  visibiliteSite: z.boolean().optional(),
  responsablePosteId: z.string().min(1).optional(),
  mandatId: z.string().min(1).optional(),
  medias: z.array(z.object({
    url: z.string(),
    type: z.enum(['IMAGE', 'DOCUMENT']),
    ordre: z.number().int().optional(),
  })).optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const projet = await prisma.projet.findUnique({
      where: { id },
      include: {
        responsablePoste: { select: { id: true, nom: true } },
        mandat: { select: { id: true, titre: true } },
        medias: true,
      },
    });

    if (!projet) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }

    return NextResponse.json({ projet });
  } catch (err) {
    console.error('GET admin projet:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.projet.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data = adminProjetUpdateSchema.parse(body);

    const updateData: Prisma.ProjetUpdateInput = {};
    if (data.titre !== undefined) updateData.titre = data.titre;
    if (data.objectif !== undefined) updateData.objectif = data.objectif;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.actions !== undefined) updateData.actions = data.actions === '' ? null : data.actions;
    if (data.statut !== undefined) updateData.statut = data.statut;
    if (data.visibiliteSite !== undefined) updateData.visibiliteSite = data.visibiliteSite;
    if (data.responsablePosteId !== undefined) updateData.responsablePosteId = data.responsablePosteId;
    if (data.mandatId !== undefined) updateData.mandatId = data.mandatId;

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
    console.error('PATCH admin projet:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.projet.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
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
