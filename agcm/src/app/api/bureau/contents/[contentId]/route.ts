// src/app/api/bureau/contents/[contentId]/route.ts
// GET et PATCH pour un contenu du bureau

import { NextRequest, NextResponse } from 'next/server';
import { requireBureauModule } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { canModifyContent, canDeleteContent } from '@/lib/rbac';
import { logAction } from '@/lib/audit';
import { z } from 'zod';

const updateSchema = z.object({
  type: z.enum(['ACTIVITE', 'ACTUALITE', 'PARTAGE', 'ANNONCE']).optional(),
  titre: z.string().min(1).max(200).optional(),
  contenu: z.string().optional().nullable(),
  lienExterne: z.string().url().optional().nullable().or(z.literal('')),
  imagePrincipale: z.string()
    .refine((val) => !val || val === '' || val.startsWith('http') || val.startsWith('/uploads/'), 'URL ou chemin invalide')
    .optional()
    .nullable()
    .or(z.literal('')),
  visibiliteCible: z.enum(['PRIVE_BUREAU', 'PUBLIC_SITE']).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  const { error, session } = await requireBureauModule('contents');
  if (error) return error;

  const { contentId } = await context.params;

  try {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        auteurPoste: { select: { id: true, nom: true, description: true } },
        mandat: { select: { id: true, titre: true, dateDebut: true, dateFin: true } },
        approvedBy: { select: { id: true, email: true } },
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Contenu introuvable' }, { status: 404 });
    }

    const { canModify } = await canModifyContent(session!.user!.id!, contentId);
    if (!canModify) {
      const { getBureauMandatContext } = await import('@/lib/rbac');
      const ctx = await getBureauMandatContext(session!.user!.id!);
      const ownsByPoste =
        !!content.auteurPosteId &&
        !!ctx?.posteIds.length &&
        ctx.posteIds.includes(content.auteurPosteId);
      if (!ownsByPoste) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error('Erreur récupération contenu:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  const { error, session } = await requireBureauModule('contents');
  if (error) return error;

  const { contentId } = await context.params;

  const check = await canModifyContent(session!.user!.id!, contentId);
  if (!check.canModify) {
    return NextResponse.json(
      { error: check.reason || 'Modification non autorisée' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    const content = await prisma.content.update({
      where: { id: contentId },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.titre && { titre: data.titre }),
        ...(data.contenu !== undefined && { contenu: data.contenu }),
        ...(data.lienExterne !== undefined && { lienExterne: data.lienExterne || null }),
        ...(data.imagePrincipale !== undefined && { imagePrincipale: data.imagePrincipale || null }),
        ...(data.visibiliteCible && { visibiliteCible: data.visibiliteCible }),
        ...(data.tags && { tags: data.tags }),
      },
      include: {
        auteurPoste: { select: { id: true, nom: true } },
        mandat: { select: { id: true, titre: true } },
      },
    });

    return NextResponse.json({ content });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'issues' in err) {
      return NextResponse.json(
        { error: 'Données invalides', details: (err as { issues: unknown }).issues },
        { status: 400 }
      );
    }
    console.error('Erreur modification contenu:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ contentId: string }> }
) {
  const { error, session } = await requireBureauModule('contents');
  if (error) return error;

  const { contentId } = await context.params;

  const allowed = await canDeleteContent(session!.user!.id!, contentId);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Suppression non autorisée (statut ou droits insuffisants)' },
      { status: 403 }
    );
  }

  try {
    const contentBefore = await prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!contentBefore) {
      return NextResponse.json({ error: 'Contenu introuvable' }, { status: 404 });
    }

    await prisma.content.delete({ where: { id: contentId } });

    await logAction({
      userId: session!.user!.id!,
      action: 'DELETE',
      entityType: 'Content',
      entityId: contentId,
      beforeData: contentBefore,
      afterData: null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur suppression contenu bureau:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
