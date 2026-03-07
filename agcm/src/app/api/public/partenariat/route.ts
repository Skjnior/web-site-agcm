// src/app/api/public/partenariat/route.ts
// Formulaire de partenariat (visiteur)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { partenariatSchema } from '@/lib/validators/demandes';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = partenariatSchema.parse(body);

    const demande = await prisma.demandePartenariat.create({
      data: {
        organisation: data.organisation,
        contactNom: data.contactNom,
        email: data.email,
        telephone: data.telephone,
        typePartenariat: data.typePartenariat,
        message: data.message,
        statut: 'EN_ATTENTE',
      },
    });

    // Notifier les admins

    return NextResponse.json(
      {
        success: true,
        message: 'Votre demande de partenariat a été envoyée avec succès. Nous vous contacterons bientôt.',
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

    console.error('Erreur lors de la création de la demande de partenariat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la demande' },
      { status: 500 }
    );
  }
}

