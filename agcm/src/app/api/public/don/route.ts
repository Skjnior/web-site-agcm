// src/app/api/public/don/route.ts
// Formulaire d'intention de don (visiteur)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { donationIntentSchema } from '@/lib/validators/demandes';
import { notifyPublicDonForm } from '@/lib/emailjs-notify';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = donationIntentSchema.parse(body);

    // Trésorier ou poste « finances » (directeur des finances / poste fusionné formation+finances)
    const tresorierPoste = await prisma.poste.findFirst({
      where: {
        estActif: true,
        OR: [
          { nom: { contains: 'Trésorier', mode: 'insensitive' } },
          { nom: { contains: 'directeur', mode: 'insensitive' } },
          { nom: { contains: 'finances', mode: 'insensitive' } },
        ],
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

    try {
      await notifyPublicDonForm({
        type: data.type,
        montantEstime: data.montantEstime,
        description: data.description,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
      });
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de la notification (EmailJS / Resend):", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Votre intention de don a été enregistrée. Nous vous contacterons bientôt.',
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

    console.error('Erreur lors de la création de l\'intention de don:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la demande' },
      { status: 500 }
    );
  }
}

