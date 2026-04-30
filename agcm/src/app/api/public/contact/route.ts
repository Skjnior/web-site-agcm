// src/app/api/public/contact/route.ts
// Formulaire de contact (visiteur)

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/validators/demandes';
import { sendEmail } from '@/lib/email';


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
    try {
      await sendEmail({
        to: 'diouldekader@gmail.com',
        subject: `Nouveau message de contact : ${data.sujet}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Nouveau message de contact</h2>
            <p><strong>De :</strong> ${data.nom} (${data.email})</p>
            <p><strong>Sujet :</strong> ${data.sujet}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p><strong>Message :</strong></p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              Ce message a été envoyé depuis le formulaire de contact du site AGCM.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', emailError);
      // On ne bloque pas la réponse car le message est déjà en base
    }

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

