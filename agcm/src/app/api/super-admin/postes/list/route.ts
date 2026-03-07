// src/app/api/super-admin/postes/list/route.ts
// Liste simple des postes du bureau (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const postes = await prisma.poste.findMany({
      where: {
        estBureau: true,
        estActif: true,
      },
      select: {
        id: true,
        nom: true,
        description: true,
      },
      orderBy: {
        nom: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      postes,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des postes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


