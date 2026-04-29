// src/app/api/super-admin/page-views/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const view = await prisma.pageView.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            roleSysteme: true,
            member: {
              select: {
                prenom: true,
                nom: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!view) {
      return NextResponse.json({ error: 'Visite introuvable' }, { status: 404 });
    }

    // Récupérer l'historique récent de ce visiteur (même IP ou même utilisateur)
    const history = await prisma.pageView.findMany({
      where: {
        OR: [
          view.userId ? { userId: view.userId } : { ipAddress: view.ipAddress },
        ].filter(Boolean) as any,
        NOT: { id: view.id },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ view, history });
  } catch (error: any) {
    console.error('[page-view-detail] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur', message: error.message }, { status: 500 });
  }
}
