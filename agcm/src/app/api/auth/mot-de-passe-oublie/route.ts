import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { member: true },
    });

    // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
    // On retourne toujours un succès même si l'utilisateur n'existe pas
    if (!user) {
      // Attendre un peu pour éviter les attaques de timing
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Stocker le token hashé dans la base de données
    // On utilise une table simple créée via SQL brut si elle n'existe pas
    try {
      // Créer la table si elle n'existe pas
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS reset_tokens (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token_hash TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Supprimer les anciens tokens expirés pour cet utilisateur
      await prisma.$executeRawUnsafe(`
        DELETE FROM reset_tokens 
        WHERE user_id = $1 OR expires_at < NOW()
      `, user.id);

      // Insérer le nouveau token
      const tokenId = crypto.randomBytes(16).toString('hex');
      await prisma.$executeRawUnsafe(`
        INSERT INTO reset_tokens (id, user_id, token_hash, expires_at)
        VALUES ($1, $2, $3, $4)
      `, tokenId, user.id, resetTokenHash, resetTokenExpiry);
    } catch (error) {
      // Si la table existe déjà ou autre erreur, continuer quand même
      console.error('Erreur lors de la création du token:', error);
    }

    // Générer l'URL de réinitialisation
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reinitialiser-mot-de-passe?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Envoyer l'email
    await sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - AGCM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #DC143C, #FFD700, #228B22); padding: 20px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #DC143C; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>AGCM</h1>
              <p style="color: white; margin: 5px 0;">Association des Guinéens de La Charente-Maritime</p>
            </div>
            <div class="content">
              <h2>Réinitialisation de votre mot de passe</h2>
              <p>Bonjour${user.member ? ` ${user.member.prenom}` : ''},</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              <p>Ou copiez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #666; font-size: 12px;">${resetUrl}</p>
              <p><strong>Ce lien est valide pendant 1 heure.</strong></p>
              <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} AGCM - Association des Guinéens de La Charente-Maritime</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer plus tard.' },
      { status: 500 }
    );
  }
}

