// src/app/api/admin/demandes/adhesions/route.ts
// Gestion des demandes d'adhésion (Admin/Président)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';
import { logAction } from '@/lib/audit';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const statut = searchParams.get('statut') || 'EN_ATTENTE';
  const search = searchParams.get('search') || '';
  const { page, limit, offset } = parsePagination(request);

  try {
    const where: any = {
      statut: statut as any,
    };

    // Filtre par recherche (nom, prénom, email, ville, pays, téléphone)
    if (search) {
      where.OR = [
        { prenom: { contains: search, mode: 'insensitive' } },
        { nom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telephone: { contains: search, mode: 'insensitive' } },
        { ville: { contains: search, mode: 'insensitive' } },
        { pays: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, demandes] = await Promise.all([
      prisma.demandeAdhesion.count({ where }),
      prisma.demandeAdhesion.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json(createPaginatedResponse(demandes, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, statut } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID manquant' },
        { status: 400 }
      );
    }

    if (!statut) {
      return NextResponse.json(
        { error: 'Statut manquant' },
        { status: 400 }
      );
    }

    const demandeBefore = await prisma.demandeAdhesion.findUnique({
      where: { id },
    });

    if (!demandeBefore) {
      return NextResponse.json(
        { error: 'Demande introuvable' },
        { status: 404 }
      );
    }

    const demande = await prisma.demandeAdhesion.update({
      where: { id },
      data: {
        statut,
        processedById: session!.user.id,
        processedAt: new Date(),
      },
    });

    await logAction({
      userId: session!.user.id,
      action: 'UPDATE',
      entityType: 'DemandeAdhesion',
      entityId: id,
      beforeData: demandeBefore,
      afterData: demande,
    });

    // Si APPROUVEE, notifier le SuperAdmin pour créer le compte
    // (le SuperAdmin devra créer le compte manuellement via /api/super-admin/users)

    return NextResponse.json({
      success: true,
      message: statut === 'APPROUVEE' 
        ? 'Demande approuvée. Le SuperAdmin doit créer le compte.'
        : 'Demande refusée.',
      demande,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour de la demande:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

