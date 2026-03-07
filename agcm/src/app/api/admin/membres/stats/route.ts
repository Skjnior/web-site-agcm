// src/app/api/admin/membres/stats/route.ts
// Statistiques des membres (Admin/Président)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const stats = {
      total: await prisma.member.count(),
      actifs: await prisma.member.count({ where: { statutMembre: 'ACTIF' } }),
      suspendus: await prisma.member.count({ where: { statutMembre: 'SUSPENDU' } }),
      radies: await prisma.member.count({ where: { statutMembre: 'RADIE' } }),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


