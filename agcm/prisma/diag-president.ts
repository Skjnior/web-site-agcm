import 'dotenv/config';

/**
 * Diagnostic du compte président : vérifie que les conditions pour créer
 * un projet via /api/bureau/projets sont réunies.
 *
 * Usage :
 *   DATABASE_URL='postgres://...' npm run db:diag-president
 *   ou en passant un autre email :
 *   PRESIDENT_EMAIL='autre@exemple' DATABASE_URL='...' npm run db:diag-president
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.PRESIDENT_EMAIL?.trim() || 'president@seed.agcm.local';

  console.log(`\n🔎 Diagnostic du compte « ${email} »\n`);

  const mandatActif = await prisma.mandat.findFirst({
    where: { statut: 'ACTIF' },
    orderBy: { dateDebut: 'desc' },
  });
  console.log(
    `Mandat ACTIF : ${
      mandatActif ? `${mandatActif.titre} (${mandatActif.id})` : '❌ AUCUN MANDAT ACTIF'
    }`,
  );

  const tousMandats = await prisma.mandat.findMany({
    select: { id: true, titre: true, statut: true, dateDebut: true, dateFin: true },
    orderBy: { dateDebut: 'desc' },
  });
  console.log(`Tous les mandats en base : ${tousMandats.length}`);
  for (const m of tousMandats) {
    console.log(`   - ${m.titre} | statut=${m.statut} | ${m.dateDebut.toISOString().slice(0, 10)} → ${m.dateFin.toISOString().slice(0, 10)}`);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      member: {
        include: {
          affectations: {
            where: { statut: 'ACTIF' },
            include: { poste: true, mandat: true },
          },
        },
      },
    },
  });

  if (!user) {
    console.log(`\n❌ Aucun utilisateur trouvé avec l'email ${email}`);
    await prisma.$disconnect();
    return;
  }

  console.log(`\nUtilisateur :`);
  console.log(`   id           : ${user.id}`);
  console.log(`   email        : ${user.email}`);
  console.log(`   roleSysteme  : ${user.roleSysteme}`);
  console.log(`   isActive     : ${user.isActive}`);
  console.log(`   deletedAt    : ${user.deletedAt ?? '(null)'}`);

  if (!user.member) {
    console.log(`\n❌ Pas de fiche Member liée à ce User → getBureauMandatContext renverra null.`);
    await prisma.$disconnect();
    return;
  }

  console.log(`\nFiche Member :`);
  console.log(`   id           : ${user.member.id}`);
  console.log(`   prénom/nom   : ${user.member.prenom} ${user.member.nom}`);
  console.log(`   statutMembre : ${user.member.statutMembre}`);

  const affectsActives = user.member.affectations;
  console.log(`\nAffectations ACTIF du Member : ${affectsActives.length}`);
  for (const a of affectsActives) {
    console.log(
      `   - poste="${a.poste.nom}" (estBureau=${a.poste.estBureau}) | mandat="${a.mandat.titre}" (statut=${a.mandat.statut})`,
    );
  }

  if (!mandatActif) {
    console.log(`\n❌ Pas de mandat ACTIF → création projet impossible.`);
    await prisma.$disconnect();
    return;
  }

  const affectSurMandatActif = affectsActives.filter(
    (a) => a.mandat.id === mandatActif.id,
  );
  console.log(
    `\nAffectations ACTIF sur le mandat ACTIF (« ${mandatActif.titre} ») : ${affectSurMandatActif.length}`,
  );

  if (affectSurMandatActif.length === 0) {
    console.log(
      `❌ Aucune affectation active sur le mandat actif → getBureauMandatContext renverra null → API renverra 403.`,
    );
  } else {
    console.log(
      `✅ Le président peut accéder à getBureauMandatContext avec primaryAffectation = "${affectSurMandatActif[0].poste.nom}".`,
    );
  }

  console.log(`\nPostes en base (estBureau=true) :`);
  const postesBureau = await prisma.poste.findMany({
    where: { estBureau: true },
    select: { id: true, nom: true, estActif: true },
    orderBy: { nom: 'asc' },
  });
  for (const p of postesBureau) {
    console.log(`   - ${p.nom} | estActif=${p.estActif} | id=${p.id}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  void prisma.$disconnect();
  process.exit(1);
});
