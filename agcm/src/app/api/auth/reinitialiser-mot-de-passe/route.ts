import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Chercher le token dans la base de données
    const tokens = await prisma.$queryRawUnsafe<Array<{
      id: string;
      user_id: string;
      token_hash: string;
      expires_at: Date;
    }>>(`
      SELECT * FROM reset_tokens 
      WHERE user_id = $1 
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, user.id);

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        { error: 'Token introuvable ou expiré' },
        { status: 400 }
      );
    }

    const tokenRecord = tokens[0];

    // Vérifier le token
    const isValid = await bcrypt.compare(token, tokenRecord.token_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    // Supprimer le token utilisé
    await prisma.$executeRawUnsafe(`
      DELETE FROM reset_tokens 
      WHERE id = $1
    `, tokenRecord.id);

    return NextResponse.json({
      message: 'Mot de passe réinitialisé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer plus tard.' },
      { status: 500 }
    );
  }
}



