// src/app/api/admin/membres/route.ts
// Gestion des membres (Admin/Président)

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { parsePagination, createPaginatedResponse } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const statusFilter = searchParams.get('status');
  const typeFilter = searchParams.get('type');
  const search = searchParams.get('q') || '';
  const { page, limit, offset } = parsePagination(request);

  try {
    const where: any = {};

    // Filtre par statut
    if (statusFilter && statusFilter !== 'all') {
      where.statutMembre = statusFilter;
    }

    // Filtre par recherche (nom, prénom, email, téléphone)
    if (search) {
      where.OR = [
        { prenom: { contains: search, mode: 'insensitive' } },
        { nom: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { telephone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, members] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              roleSysteme: true,
            },
          },
        },
        orderBy: {
          dateAdhesion: 'desc',
        },
        skip: offset,
        take: limit,
      }),
    ]);

    // Mapper les données pour correspondre à l'interface attendue
    const mappedMembers = members.map((member) => ({
      id: member.id,
      prenom: member.prenom,
      nom: member.nom,
      email: member.user.email,
      telephone: member.telephone,
      ville: member.ville,
      pays: member.pays,
      statutMembre: member.statutMembre,
      dateAdhesion: member.dateAdhesion,
      user: {
        id: member.user.id,
        email: member.user.email,
        role: member.user.roleSysteme,
      },
    }));

    return NextResponse.json(createPaginatedResponse(mappedMembers, total, page, limit));
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


