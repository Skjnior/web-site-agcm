// src/app/api/members/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Valider les données
    const validatedData = registerSchema.parse(body);

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Générer le numéro de membre temporaire
    const year = new Date().getFullYear();
    const tempNumber = `TEMP-${year}-${Date.now()}`;

    // Date d'expiration (1 an)
    const dateExpiration = new Date();
    dateExpiration.setFullYear(dateExpiration.getFullYear() + 1);

    // Créer l'utilisateur et le membre en transaction
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
        roleSysteme: 'MEMBER',
        member: {
          create: {
            prenom: validatedData.prenom,
            nom: validatedData.nom,
            telephone: validatedData.telephone,
            ville: validatedData.ville || null,
          },
        },
      },
      include: {
        member: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Demande d\'adhésion envoyée avec succès. Vous recevrez un email une fois votre compte validé par un administrateur.',
        data: {
          email: user.email,
          status: 'EN_ATTENTE',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
}