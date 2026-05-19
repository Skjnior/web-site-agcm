import 'dotenv/config';

/**
 * Réinitialise le mot de passe des 9 comptes bureau (emails seed).
 *
 * Local : définir BUREAU_PASSWORD dans `.env`, puis :
 *   npm run db:reset-bureau-passwords
 *
 * Production (base Vercel / Neon) :
 *   DATABASE_URL="postgresql://..." BUREAU_PASSWORD='...' npm run db:reset-bureau-passwords
 *
 * Sans BUREAU_PASSWORD : utilise BUREAU_SEED_PASSWORD de bureau-reglement-seed.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  BUREAU_SEED_ACCOUNTS,
  BUREAU_SEED_DOMAIN,
  BUREAU_SEED_PASSWORD,
} from './bureau-reglement-seed';

const prisma = new PrismaClient();

async function main() {
  const plain =
    process.env.BUREAU_PASSWORD?.trim() ||
    process.env.AGCM_BUREAU_PASSWORD?.trim() ||
    BUREAU_SEED_PASSWORD;

  if (plain.length < 8) {
    console.error('❌ Le mot de passe doit faire au moins 8 caractères.');
    process.exit(1);
  }

  if (
    process.env.BUREAU_PASSWORD &&
    (process.env.BUREAU_PASSWORD.includes('#') || process.env.BUREAU_PASSWORD.includes('!')) &&
    !process.env.BUREAU_PASSWORD.startsWith('"')
  ) {
    console.warn(
      '⚠️  Dans .env, mettez le mot de passe entre guillemets si il contient # ou ! : BUREAU_PASSWORD="Mon#MotDePasse!"',
    );
  }

  const hash = await bcrypt.hash(plain, 10);
  const emails = BUREAU_SEED_ACCOUNTS.map((a) => `${a.localPart}@${BUREAU_SEED_DOMAIN}`);

  console.log('🔐 Réinitialisation des mots de passe bureau\n');
  console.log(`   Cible : ${emails.length} emails @${BUREAU_SEED_DOMAIN}`);
  console.log(`   Mot de passe : ${process.env.BUREAU_PASSWORD || process.env.AGCM_BUREAU_PASSWORD ? '(fourni via variable d\'environnement)' : BUREAU_SEED_PASSWORD}\n`);

  let updated = 0;
  let missing = 0;

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`   ⚠️  Absent : ${email}`);
      missing++;
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hash, isActive: true },
    });
    console.log(`   ✓ ${email}`);
    updated++;
  }

  console.log(`\n✅ ${updated} compte(s) mis à jour.`);
  if (missing > 0) {
    console.log(`   ${missing} compte(s) introuvable(s) — lancez seed:fresh ou créez-les en admin.`);
  }
  console.log('\nCommuniquez le mot de passe aux titulaires par un canal sécurisé (pas par email public).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
