// prisma/add-bureau-members.ts
// Script pour ajouter des membres du bureau au mandat actif

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const postesBureau = [
  'Président',
  'Vice-Président',
  'Secrétaire Général',
  'Secrétaire Adjoint',
  'Trésorier',
  'Trésorier Adjoint',
  'Responsable Communication',
  'Responsable Projets',
  'Responsable Événements',
  'Responsable Partenariats',
  'Responsable Formation',
  'Responsable Jeunesse',
  'Responsable Culture',
  'Responsable Social',
  'Responsable Sport',
];

async function main() {
  console.log('🌱 Ajout de membres du bureau au mandat actif...\n');

  // Trouver le mandat actif
  const mandatActif = await prisma.mandat.findFirst({
    where: { statut: 'ACTIF' },
    orderBy: { dateDebut: 'desc' },
  });

  if (!mandatActif) {
    console.error('❌ Aucun mandat actif trouvé. Veuillez d\'abord créer un mandat actif.');
    return;
  }

  console.log(`✅ Mandat actif trouvé: ${mandatActif.titre}\n`);

  // Vérifier les affectations existantes
  const affectationsExistantes = await prisma.affectationPoste.findMany({
    where: {
      mandatId: mandatActif.id,
      statut: 'ACTIF',
    },
    include: {
      poste: { select: { nom: true } },
    },
  });

  console.log(`📊 Affectations existantes: ${affectationsExistantes.length}`);
  affectationsExistantes.forEach((aff) => {
    console.log(`   - ${aff.poste.nom}`);
  });

  // Récupérer les postes du bureau
  const postes = await prisma.poste.findMany({
    where: {
      estBureau: true,
      estActif: true,
      nom: {
        in: postesBureau,
      },
    },
    take: 15,
  });

  if (postes.length === 0) {
    console.error('❌ Aucun poste de bureau trouvé. Veuillez d\'abord exécuter le seed principal.');
    return;
  }

  console.log(`\n📋 Postes de bureau disponibles: ${postes.length}\n`);

  // Récupérer des membres actifs qui ne sont pas déjà affectés
  const membresAffectes = new Set(
    affectationsExistantes.map((aff) => aff.memberId)
  );

  const membresDisponibles = await prisma.member.findMany({
    where: {
      statutMembre: 'ACTIF',
      id: {
        notIn: Array.from(membresAffectes),
      },
    },
    take: postes.length,
  });

  if (membresDisponibles.length === 0) {
    console.log('⚠️  Tous les membres actifs sont déjà affectés ou aucun membre disponible.');
    return;
  }

  console.log(`👥 Membres disponibles: ${membresDisponibles.length}\n`);

  // Créer les affectations manquantes
  let ajoutes = 0;
  for (let i = 0; i < Math.min(postes.length, membresDisponibles.length); i++) {
    const poste = postes[i];
    const member = membresDisponibles[i];

    // Vérifier si cette affectation existe déjà
    const existe = await prisma.affectationPoste.findFirst({
      where: {
        mandatId: mandatActif.id,
        posteId: poste.id,
        memberId: member.id,
      },
    });

    if (existe) {
      console.log(`   ⏭️  ${poste.nom} déjà affecté à ${member.prenom} ${member.nom}`);
      continue;
    }

    await prisma.affectationPoste.create({
      data: {
        mandatId: mandatActif.id,
        posteId: poste.id,
        memberId: member.id,
        statut: 'ACTIF',
        dateDebut: new Date(),
      },
    });

    ajoutes++;
    console.log(`   ✅ ${poste.nom} → ${member.prenom} ${member.nom}`);
  }

  console.log(`\n✅ ${ajoutes} nouvelles affectations créées\n`);

  // Afficher le bureau final
  const bureauFinal = await prisma.affectationPoste.findMany({
    where: {
      mandatId: mandatActif.id,
      statut: 'ACTIF',
    },
    include: {
      poste: { select: { nom: true } },
      member: { select: { prenom: true, nom: true, photoUrl: true } },
    },
    orderBy: {
      poste: { nom: 'asc' },
    },
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Bureau exécutif final: ${bureauFinal.length} membres\n`);
  bureauFinal.forEach((aff, i) => {
    console.log(
      `   ${i + 1}. ${aff.member.prenom} ${aff.member.nom} - ${aff.poste.nom}`
    );
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



