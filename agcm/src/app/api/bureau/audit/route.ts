// src/app/api/bureau/audit/route.ts
// Traces (audit) pour les contenus/projets/événements du membre bureau

import { NextRequest, NextResponse } from 'next/server';
import { requireBureauModule } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { getBureauMandatContext } from '@/lib/rbac';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const { error, session } = await requireBureauModule('traces');
  if (error) return error;

  const ctx = await getBureauMandatContext(session!.user!.id!);
  if (!ctx) {
    return NextResponse.json({ error: 'Aucun poste actif sur le mandat en cours' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const entityType = searchParams.get('entityType'); // Content, Projet, Event
  const entityId = searchParams.get('entityId');
  const { page, limit, offset } = parsePagination(request);

  try {
    // Récupérer les IDs des entités qui appartiennent au membre (ses postes sur le mandat actif)
    let entityIds: string[] = [];

    if (entityId) {
      const [c, p, e] = await Promise.all([
        prisma.content.findFirst({
          where: { id: entityId, auteurPosteId: { in: ctx.posteIds }, mandatId: ctx.mandatId },
          select: { id: true },
        }),
        prisma.projet.findFirst({
          where: { id: entityId, responsablePosteId: { in: ctx.posteIds }, mandatId: ctx.mandatId },
          select: { id: true },
        }),
        prisma.event.findFirst({
          where: { id: entityId, createdByPosteId: { in: ctx.posteIds }, mandatId: ctx.mandatId },
          select: { id: true },
        }),
      ]);
      if (c || p || e) entityIds = [entityId];
    } else {
      const [contents, projets, events] = await Promise.all([
        prisma.content.findMany({
          where: { auteurPosteId: { in: ctx.posteIds }, mandatId: ctx.mandatId },
          select: { id: true },
        }),
        prisma.projet.findMany({
          where: { responsablePosteId: { in: ctx.posteIds }, mandatId: ctx.mandatId },
          select: { id: true },
        }),
        prisma.event.findMany({
          where: { createdByPosteId: { in: ctx.posteIds }, mandatId: ctx.mandatId },
          select: { id: true },
        }),
      ]);
      entityIds = [
        ...contents.map((c) => c.id),
        ...projets.map((p) => p.id),
        ...events.map((e) => e.id),
      ];
    }

    if (entityIds.length === 0) {
      return NextResponse.json(createPaginatedResponse([], 0, page, limit));
    }

    const where: { entityId: { in: string[] }; entityType?: string } = {
      entityId: { in: entityIds },
    };
    if (entityType && entityType !== 'all') {
      where.entityType = entityType;
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              member: {
                select: {
                  prenom: true,
                  nom: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(logs, total, page, limit));
  } catch (err) {
    console.error('Erreur audit bureau:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
