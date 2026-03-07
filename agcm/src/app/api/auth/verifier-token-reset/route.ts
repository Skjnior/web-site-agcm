import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { valid: false, error: 'Token ou email manquant' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'Utilisateur introuvable' },
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
        { valid: false, error: 'Token introuvable ou expiré' },
        { status: 404 }
      );
    }

    const tokenRecord = tokens[0];

    // Vérifier le token
    const isValid = await bcrypt.compare(token, tokenRecord.token_hash);

    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: 'Token invalide' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return NextResponse.json(
      { valid: false, error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}



