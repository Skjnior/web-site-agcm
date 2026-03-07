// src/app/api/public/adhesion/route.ts
// Formulaire d'adhésion (visiteur)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


const adhesionSchema = z.object({
  prenom: z.string().min(1, 'Le prénom est requis'),
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = adhesionSchema.parse(body);

    // Créer la demande d'adhésion
    const demande = await prisma.demandeAdhesion.create({
      data: {
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        ville: data.ville,
        pays: data.pays,
        message: data.message,
        statut: 'EN_ATTENTE',
      },
    });

    // Notifier les admins

    return NextResponse.json(
      {
        success: true,
        message: 'Votre demande d\'adhésion a été envoyée avec succès. Nous vous contacterons bientôt.',
        id: demande.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création de la demande d\'adhésion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la demande' },
      { status: 500 }
    );
  }
}

