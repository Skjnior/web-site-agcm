// src/app/api/public/adhesion/route.ts
// Formulaire d'adhésion (visiteur)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';


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
    try {
      await sendEmail({
        to: 'diouldekader@gmail.com',
        subject: `Nouvelle demande d'adhésion : ${data.prenom} ${data.nom}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4b5563;">Nouvelle demande d'adhésion</h2>
            <p><strong>Candidat :</strong> ${data.prenom} ${data.nom}</p>
            <p><strong>Email :</strong> ${data.email}</p>
            <p><strong>Téléphone :</strong> ${data.telephone || 'Non fourni'}</p>
            <p><strong>Localisation :</strong> ${data.ville || '?'}, ${data.pays || '?'}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p><strong>Message / Motivation :</strong></p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
              ${data.message ? data.message.replace(/\n/g, '<br>') : 'Aucun message fourni.'}
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              Cette demande a été envoyée depuis le formulaire d'adhésion du site AGCM.
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de notification (adhesion):', emailError);
    }

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

