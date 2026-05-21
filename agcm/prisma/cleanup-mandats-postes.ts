import 'dotenv/config';

/**
 * Nettoyage des mandats / postes en doublon en production.
 *
 * Stratégie :
 *  - On choisit UN seul mandat « ancrage » : c'est le mandat ACTIF qui a le plus
 *    d'affectations actives sur des postes du bureau.
 *  - Tous les autres mandats ACTIF passent en ARCHIVE.
 *  - Tous les postes du bureau qui n'ont AUCUNE affectation active sur le mandat
 *    ancrage sont passés à estActif=false (ils ne sont pas supprimés, pour
 *    préserver l'historique des affectations / projets / contenus passés).
 *
 * Mode dry-run par défaut — n'écrit rien.
 *
 * Usage :
 *   DATABASE_URL='postgres://...' npm run db:cleanup-mandats-postes
 *
 *   # pour exécuter réellement les modifications :
 *   DATABASE_URL='postgres://...' CLEANUP_EXECUTE=1 npm run db:cleanup-mandats-postes
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXECUTE = process.env.CLEANUP_EXECUTE === '1';

function log(msg: string) {
  console.log(msg);
}

async function main() {
  log('');
  log('==============================================================');
  log(`  Nettoyage mandats / postes  (mode = ${EXECUTE ? 'EXECUTE' : 'DRY-RUN'})`);
  log('==============================================================');
  log('');

  // ---------------------------------------------------------------------------
  // 1) Choix du mandat « ancrage »
  // ---------------------------------------------------------------------------
  const mandatsActifs = await prisma.mandat.findMany({
    where: { statut: 'ACTIF' },
    include: {
      _count: {
        select: {
          affectations: {
            where: {
              statut: 'ACTIF',
              poste: { estBureau: true },
            },
          },
        },
      },
    },
    orderBy: { dateDebut: 'desc' },
  });

  log(`Mandats ACTIF en base : ${mandatsActifs.length}`);
  for (const m of mandatsActifs) {
    log(
      `   - ${m.titre} | ${m.dateDebut.toISOString().slice(0, 10)} → ${m.dateFin
        .toISOString()
        .slice(0, 10)} | id=${m.id} | affectationsBureauACTIF=${m._count.affectations}`,
    );
  }
  log('');

  if (mandatsActifs.length === 0) {
    log('❌ Aucun mandat ACTIF en base. Annulé.');
    await prisma.$disconnect();
    return;
  }

  // Mandat ancrage = celui avec le plus d'affectations bureau ACTIF.
  // En cas d'égalité on garde celui dont la dateDebut est la plus ancienne (le
  // plus « stable »). À défaut de toute affectation, on prend simplement le
  // premier de la liste (le plus récent par dateDebut).
  let ancrage = mandatsActifs[0];
  for (const m of mandatsActifs) {
    if (m._count.affectations > ancrage._count.affectations) {
      ancrage = m;
    } else if (
      m._count.affectations === ancrage._count.affectations &&
      m.dateDebut < ancrage.dateDebut
    ) {
      ancrage = m;
    }
  }

  log(`✅ Mandat ANCRAGE retenu :`);
  log(`     ${ancrage.titre} | id=${ancrage.id}`);
  log(
    `     dateDebut=${ancrage.dateDebut.toISOString().slice(0, 10)} | dateFin=${ancrage.dateFin
      .toISOString()
      .slice(0, 10)}`,
  );
  log(`     affectationsBureauACTIF = ${ancrage._count.affectations}`);
  log('');

  const aArchiver = mandatsActifs.filter((m) => m.id !== ancrage.id);
  log(`Mandats ACTIF à passer en ARCHIVE : ${aArchiver.length}`);
  for (const m of aArchiver) {
    log(`   → ${m.titre} | id=${m.id} | affBureauACTIF=${m._count.affectations}`);
  }
  log('');

  // ---------------------------------------------------------------------------
  // 2) Postes du bureau actuellement utilisés sur le mandat ancrage
  // ---------------------------------------------------------------------------
  const affectationsAncrage = await prisma.affectationPoste.findMany({
    where: {
      mandatId: ancrage.id,
      statut: 'ACTIF',
      poste: { estBureau: true },
    },
    include: { poste: true, member: true },
  });

  const postesUtilisesIds = new Set<string>();
  log(`Affectations ACTIF sur le mandat ancrage : ${affectationsAncrage.length}`);
  for (const a of affectationsAncrage) {
    postesUtilisesIds.add(a.posteId);
    log(`   - "${a.poste.nom}" → ${a.member.prenom} ${a.member.nom} | posteId=${a.posteId}`);
  }
  log('');

  // Postes bureau actuellement actifs en base
  const postesBureauActifs = await prisma.poste.findMany({
    where: { estBureau: true, estActif: true },
    select: { id: true, nom: true },
    orderBy: { nom: 'asc' },
  });

  const postesAMasquer = postesBureauActifs.filter((p) => !postesUtilisesIds.has(p.id));
  log(`Postes bureau estActif=true en base : ${postesBureauActifs.length}`);
  log(`   → conservés actifs (utilisés sur ancrage) : ${postesUtilisesIds.size}`);
  log(`   → à masquer (estActif=false) : ${postesAMasquer.length}`);
  log('');

  if (postesAMasquer.length > 0 && postesAMasquer.length <= 20) {
    log('Liste des postes à masquer :');
    for (const p of postesAMasquer.slice(0, 20)) {
      log(`   - ${p.nom} | id=${p.id}`);
    }
    log('');
  } else if (postesAMasquer.length > 20) {
    log(`Aperçu des 10 premiers postes à masquer :`);
    for (const p of postesAMasquer.slice(0, 10)) {
      log(`   - ${p.nom} | id=${p.id}`);
    }
    log(`   ... + ${postesAMasquer.length - 10} autres`);
    log('');
  }

  // ---------------------------------------------------------------------------
  // 3) Exécution (si CLEANUP_EXECUTE=1)
  // ---------------------------------------------------------------------------
  if (!EXECUTE) {
    log('==============================================================');
    log('  DRY-RUN : aucune écriture en base.');
    log('  Pour exécuter réellement, relance avec CLEANUP_EXECUTE=1');
    log('==============================================================');
    log('');
    await prisma.$disconnect();
    return;
  }

  log('==============================================================');
  log('  Exécution des modifications…');
  log('==============================================================');
  log('');

  await prisma.$transaction(
    async (tx) => {
      if (aArchiver.length > 0) {
        const upd = await tx.mandat.updateMany({
          where: { id: { in: aArchiver.map((m) => m.id) } },
          data: { statut: 'ARCHIVE' },
        });
        log(`  • Mandats passés en ARCHIVE : ${upd.count}`);
      } else {
        log(`  • Aucun mandat à archiver.`);
      }

      if (postesAMasquer.length > 0) {
        const upd = await tx.poste.updateMany({
          where: { id: { in: postesAMasquer.map((p) => p.id) } },
          data: { estActif: false },
        });
        log(`  • Postes masqués (estActif=false) : ${upd.count}`);
      } else {
        log(`  • Aucun poste à masquer.`);
      }
    },
    { timeout: 120_000, maxWait: 15_000 },
  );

  log('');
  log('✅ Nettoyage terminé.');
  log('');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
