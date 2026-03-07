// src/app/api/app/profil/route.ts
// Mise à jour du profil membre

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const profilUpdateSchema = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal('')),
});

export async function PATCH(request: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const data = profilUpdateSchema.parse(body);

    // Récupérer le membre
    const member = await prisma.member.findUnique({
      where: { userId: session!.user.id },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Membre introuvable' },
        { status: 404 }
      );
    }

    // Mettre à jour
    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: {
        prenom: data.prenom,
        nom: data.nom,
        telephone: data.telephone || null,
        ville: data.ville || null,
        pays: data.pays || null,
        bio: data.bio || null,
        photoUrl: data.photoUrl || null,
      },
    });

    return NextResponse.json({
      success: true,
      member: updatedMember,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}



