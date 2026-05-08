// Changement de mot de passe (utilisateur connecté : ancien mot de passe requis)

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireIntranetAccess } from '@/lib/require-auth';
import { prisma } from '@/lib/prisma';

const bodySchema = z
  .object({
    currentPassword: z.string().min(1, 'L’ancien mot de passe est requis'),
    newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
    confirmNewPassword: z.string().min(1, 'Confirmez le nouveau mot de passe'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'Les nouveaux mots de passe ne correspondent pas',
    path: ['confirmNewPassword'],
  });

export async function POST(request: NextRequest) {
  const { error, session } = await requireIntranetAccess();
  if (error) return error;

  try {
    const json = await request.json();
    const { currentPassword, newPassword } = bodySchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introvable' }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            'Ce compte n’a pas de mot de passe local (connexion autre méthode). Contactez un administrateur pour définir un mot de passe.',
        },
        { status: 400 },
      );
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'L’ancien mot de passe est incorrect' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      const msg = e.issues[0]?.message ?? 'Données invalides';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error('changer-mot-de-passe:', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
