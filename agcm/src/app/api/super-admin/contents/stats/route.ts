// src/app/api/super-admin/contents/stats/route.ts
// Statistiques des contenus (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const [brouillon, soumis, approuve, publie, rejete, archive] = await Promise.all([
      prisma.content.count({
        where: { statutWorkflow: 'BROUILLON' },
      }),
      prisma.content.count({
        where: { statutWorkflow: 'SOUMIS' },
      }),
      prisma.content.count({
        where: { statutWorkflow: 'APPROUVE' },
      }),
      prisma.content.count({
        where: { statutWorkflow: 'PUBLIE' },
      }),
      prisma.content.count({
        where: { statutWorkflow: 'REJETE' },
      }),
      prisma.content.count({
        where: { statutWorkflow: 'ARCHIVE' },
      }),
    ]);

    return NextResponse.json({
      brouillon,
      soumis,
      approuve,
      publie,
      rejete,
      archive,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


