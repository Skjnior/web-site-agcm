// src/app/api/public/don/route.ts
// Formulaire d'intention de don (visiteur)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { donationIntentSchema } from '@/lib/validators/demandes';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = donationIntentSchema.parse(body);

    // Trouver le poste Trésorier ou Directeur finances (optionnel)
    const tresorierPoste = await prisma.poste.findFirst({
      where: {
        nom: {
          contains: 'Trésorier',
          mode: 'insensitive',
        },
        estActif: true,
      },
    });

    const demande = await prisma.donationIntent.create({
      data: {
        type: data.type,
        montantEstime: data.montantEstime ? data.montantEstime : null,
        description: data.description,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        statut: 'NOUVEAU',
        handledByPosteId: tresorierPoste?.id || null,
      },
    });

    // Notifier les admins et le trésorier si assigné

    return NextResponse.json(
      {
        success: true,
        message: 'Votre intention de don a été enregistrée. Nous vous contacterons bientôt.',
        id: demande.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error('Erreur lors de la création de l\'intention de don:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la demande' },
      { status: 500 }
    );
  }
}

