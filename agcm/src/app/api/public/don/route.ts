// src/app/api/public/don/route.ts
// Formulaire d'intention de don (visiteur)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { donationIntentSchema } from '@/lib/validators/demandes';
import { sendEmail } from '@/lib/email';


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

    // Notifier les admins et le trésorier
    try {
      await sendEmail({
        to: 'diouldekader@gmail.com',
        subject: `Nouvelle intention de don : ${data.type}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #059669;">Nouvelle intention de don</h2>
            <p><strong>De :</strong> ${data.nom} (${data.email || 'Non fourni'})</p>
            <p><strong>Téléphone :</strong> ${data.telephone || 'Non fourni'}</p>
            <p><strong>Type de don :</strong> ${data.type}</p>
            ${data.montantEstime ? `<p><strong>Montant estimé :</strong> ${data.montantEstime} €</p>` : ''}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p><strong>Description / Message :</strong></p>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px;">
              ${data.description ? data.description.replace(/\n/g, '<br>') : 'Aucune description fournie.'}
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              Cette intention de don a été envoyée depuis le site AGCM.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de notification (don):', emailError);
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

