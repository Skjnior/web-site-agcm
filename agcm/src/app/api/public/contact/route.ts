// src/app/api/public/contact/route.ts
// Formulaire de contact (visiteur)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/validators/demandes';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    const message = await prisma.messageContact.create({
      data: {
        nom: data.nom,
        email: data.email,
        sujet: data.sujet,
        message: data.message,
        statut: 'NOUVEAU',
        destinatairePosteId: data.destinatairePosteId || null,
      },
    });

    // Notifier les admins

    return NextResponse.json(
      {
        success: true,
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons bientôt.',
        id: message.id,
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

    console.error('Erreur lors de la création du message de contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}

