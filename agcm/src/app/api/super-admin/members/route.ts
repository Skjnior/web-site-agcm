// src/app/api/super-admin/members/route.ts
// Liste des membres actifs (SuperAdmin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  try {
    const members = await prisma.member.findMany({
      where: {
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            roleSysteme: true,
            isActive: true,
          },
        },
      },
      orderBy: [
        { nom: 'asc' },
        { prenom: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      members: members.map(m => ({
        id: m.id,
        prenom: m.prenom,
        nom: m.nom,
        email: m.user.email,
        fullName: `${m.prenom} ${m.nom}`,
      })),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
