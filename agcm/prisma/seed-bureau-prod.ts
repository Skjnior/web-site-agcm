import 'dotenv/config';

/**
 * Crée les 9 comptes bureau officiels (@seed.agcm.local) sur une base existante,
 * sans effacer les données (adhérents, contenus, etc.).
 *
 *   DATABASE_URL="postgresql://..." BUREAU_PASSWORD='...' npm run db:seed-bureau-prod
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  BUREAU_EXECUTIF_POSTES,
  BUREAU_SEED_ACCOUNTS,
  BUREAU_SEED_DOMAIN,
  BUREAU_SEED_PASSWORD,
} from './bureau-reglement-seed';

const prisma = new PrismaClient();

const bureauIdentites: [string, string][] = [
  ['Amadou', 'Barry'],
  ['Fatoumata', 'Camara'],
  ['Ibrahim', 'Diallo'],
  ['Alpha', 'Bah'],
  ['Mamadou', 'Sylla'],
  ['Aissatou', 'Diallo'],
  ['Kadiatou', 'Keita'],
  ['Ousmane', 'Touré'],
  ['Mariama', 'Sow'],
];

async function main() {
  const plain =
    process.env.BUREAU_PASSWORD?.trim() ||
    process.env.AGCM_BUREAU_PASSWORD?.trim() ||
    BUREAU_SEED_PASSWORD;
  const hash = await bcrypt.hash(plain, 10);

  const mandatActif = await prisma.mandat.findFirst({
    where: { statut: 'ACTIF' },
    orderBy: { dateDebut: 'desc' },
  });
  if (!mandatActif) {
    console.error('❌ Aucun mandat ACTIF. Créez-en un en admin avant de lancer ce script.');
    process.exit(1);
  }
  console.log(`📅 Mandat actif : ${mandatActif.titre} (${mandatActif.id})\n`);

  let usersCreated = 0;
  let membersCreated = 0;
  let postesCreated = 0;
  let affectationsCreated = 0;

  for (let i = 0; i < BUREAU_SEED_ACCOUNTS.length; i++) {
    const acc = BUREAU_SEED_ACCOUNTS[i];
    const posteDef = BUREAU_EXECUTIF_POSTES[i];
    const email = `${acc.localPart}@${BUREAU_SEED_DOMAIN}`;
    const [prenom, nom] = bureauIdentites[i];

    let poste = await prisma.poste.findFirst({
      where: { nom: posteDef.nom, estBureau: true },
    });
    if (!poste) {
      poste = await prisma.poste.create({
        data: {
          nom: posteDef.nom,
          description: posteDef.description,
          estBureau: true,
          estActif: true,
        },
      });
      postesCreated++;
      console.log(`   + Poste créé : ${posteDef.nom}`);
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: hash,
          roleSysteme: acc.roleSysteme,
          isActive: true,
        },
      });
      usersCreated++;
      console.log(`   + Utilisateur : ${email} (${acc.roleSysteme})`);
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hash, isActive: true, roleSysteme: acc.roleSysteme },
      });
      console.log(`   ↻ Utilisateur mis à jour : ${email}`);
    }

    let member = await prisma.member.findFirst({ where: { userId: user.id } });
    if (!member) {
      member = await prisma.member.create({
        data: {
          userId: user.id,
          prenom,
          nom,
          telephone: `+33 6 12 34 56 8${i}`,
          ville: 'La Rochelle',
          pays: 'France',
          statutMembre: 'ACTIF',
          dateAdhesion: new Date(),
        },
      });
      membersCreated++;
      console.log(`   + Membre : ${prenom} ${nom}`);
    }

    const affectationExiste = await prisma.affectationPoste.findFirst({
      where: {
        mandatId: mandatActif.id,
        posteId: poste.id,
        memberId: member.id,
        statut: 'ACTIF',
      },
    });
    if (!affectationExiste) {
      const autreSurPoste = await prisma.affectationPoste.findFirst({
        where: { mandatId: mandatActif.id, posteId: poste.id, statut: 'ACTIF' },
      });
      if (autreSurPoste && autreSurPoste.memberId !== member.id) {
        console.log(
          `   ⚠️  Poste « ${posteDef.nom} » déjà occupé sur ce mandat — affectation non modifiée.`,
        );
      } else {
        await prisma.affectationPoste.create({
          data: {
            mandatId: mandatActif.id,
            posteId: poste.id,
            memberId: member.id,
            statut: 'ACTIF',
            dateDebut: mandatActif.dateDebut,
          },
        });
        affectationsCreated++;
        console.log(`   + Affectation : ${posteDef.nom} → ${prenom} ${nom}`);
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Comptes bureau prêts sur ${mandatActif.titre}`);
  console.log(`   Utilisateurs créés : ${usersCreated}`);
  console.log(`   Membres créés : ${membersCreated}`);
  console.log(`   Postes créés : ${postesCreated}`);
  console.log(`   Affectations créées : ${affectationsCreated}`);
  console.log(`\n   Connexion : president@seed.agcm.local`);
  console.log(`   Mot de passe : (BUREAU_PASSWORD ou défaut seed)\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
