// src/app/api/app/profil/route.ts
// Mise à jour du profil membre (+ e-mail de connexion pour comptes liés)

import { NextRequest, NextResponse } from 'next/server';
import { requireIntranetAccess } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/** Photo : URL absolue ou chemin public (/uploads/...) */
const photoUrlSchema = z
  .string()
  .optional()
  .refine(
    (val) =>
      val === undefined ||
      val === '' ||
      /^https?:\/\//i.test(val) ||
      (val.startsWith('/') && !val.includes('..')),
    { message: 'URL ou chemin de photo invalide' },
  );

const profilUpdateSchema = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  pays: z.string().optional(),
  bio: z.string().optional(),
  photoUrl: photoUrlSchema,
  /** Nouvel e-mail de connexion (compte lié uniquement), optionnel */
  email: z.string().email().optional().or(z.literal('')),
});

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function PATCH(request: NextRequest) {
  const { error, session } = await requireIntranetAccess();
  if (error) return error;

  try {
    const body = await request.json();
    const data = profilUpdateSchema.parse(body);

    const userRow = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { id: true, email: true },
    });

    if (!userRow) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const member = await prisma.member.findUnique({
      where: { userId: session!.user.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
    }

    let loginEmail = userRow.email;

    const rawEmail =
      typeof data.email === 'string' && data.email.trim() !== '' ? data.email : null;
    const requestedEmail = rawEmail ? normalizeEmail(rawEmail) : null;

    if (requestedEmail && requestedEmail !== loginEmail.toLowerCase()) {
      const userConflict = await prisma.user.findFirst({
        where: { email: requestedEmail, NOT: { id: userRow.id } },
      });
      if (userConflict) {
        return NextResponse.json(
          { error: 'Cette adresse e-mail est déjà utilisée pour un autre compte de connexion.' },
          { status: 400 },
        );
      }

      const memberConflict = await prisma.member.findFirst({
        where: { email: requestedEmail, NOT: { id: member.id } },
      });
      if (memberConflict) {
        return NextResponse.json(
          { error: 'Cette adresse e-mail est déjà associée à une autre fiche membre.' },
          { status: 400 },
        );
      }

      await prisma.user.update({
        where: { id: userRow.id },
        data: { email: requestedEmail },
      });
      loginEmail = requestedEmail;
    }

    const memberEmailValue = member.userId ? loginEmail : member.email;

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
        ...(member.userId ? { email: memberEmailValue } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      member: updatedMember,
      emailChanged: Boolean(requestedEmail && requestedEmail !== userRow.email.toLowerCase()),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 },
      );
    }

    console.error('Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
