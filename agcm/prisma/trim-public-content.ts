/**
 * Réduit le contenu public de démo sans toucher aux membres, comptes, mandats, registre, etc.
 *
 * Conserve :
 * - 10 actualités (Content PUBLIE + PUBLIC_SITE)
 * - 10 événements (les plus récents par dateDebut)
 * - 5 projets (les plus récents par createdAt)
 *
 * Usage : npm run db:trim
 * Option : DRY_RUN=1 npm run db:trim  (affiche sans supprimer)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KEEP_ACTUALITES = 10;
const KEEP_EVENTS = 10;
const KEEP_PROJETS = 5;

const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

async function trimActualites() {
  const where = {
    statutWorkflow: 'PUBLIE' as const,
    visibiliteCible: 'PUBLIC_SITE' as const,
  };

  const all = await prisma.content.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: { id: true, titre: true, createdAt: true },
  });

  const toDelete = all.slice(KEEP_ACTUALITES);
  if (toDelete.length === 0) {
    console.log(`📰 Actualités : ${all.length} (rien à supprimer)`);
    return;
  }

  const ids = toDelete.map((c) => c.id);
  console.log(`📰 Actualités : garde ${Math.min(all.length, KEEP_ACTUALITES)}, supprime ${toDelete.length}`);

  if (!dryRun) {
    await prisma.comment.deleteMany({ where: { contentId: { in: ids } } });
    await prisma.content.deleteMany({ where: { id: { in: ids } } });
  } else {
    toDelete.forEach((c) => console.log(`   [dry] ${c.titre}`));
  }
}

async function trimEvents() {
  const all = await prisma.event.findMany({
    orderBy: { dateDebut: 'desc' },
    select: { id: true, titre: true, dateDebut: true },
  });

  const toDelete = all.slice(KEEP_EVENTS);
  if (toDelete.length === 0) {
    console.log(`📅 Événements : ${all.length} (rien à supprimer)`);
    return;
  }

  const ids = toDelete.map((e) => e.id);
  console.log(`📅 Événements : garde ${Math.min(all.length, KEEP_EVENTS)}, supprime ${toDelete.length}`);

  if (!dryRun) {
    await prisma.eventMedia.deleteMany({ where: { eventId: { in: ids } } });
    await prisma.event.deleteMany({ where: { id: { in: ids } } });
  } else {
    toDelete.forEach((e) => console.log(`   [dry] ${e.titre}`));
  }
}

async function trimProjets() {
  const all = await prisma.projet.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, titre: true },
  });

  const toDelete = all.slice(KEEP_PROJETS);
  if (toDelete.length === 0) {
    console.log(`📁 Projets : ${all.length} (rien à supprimer)`);
    return;
  }

  const ids = toDelete.map((p) => p.id);
  console.log(`📁 Projets : garde ${Math.min(all.length, KEEP_PROJETS)}, supprime ${toDelete.length}`);

  if (!dryRun) {
    await prisma.projetPartner.deleteMany({ where: { projetId: { in: ids } } });
    await prisma.projetMedia.deleteMany({ where: { projetId: { in: ids } } });
    await prisma.projet.deleteMany({ where: { id: { in: ids } } });
  } else {
    toDelete.forEach((p) => console.log(`   [dry] ${p.titre}`));
  }
}

async function main() {
  console.log(dryRun ? '🔍 Mode DRY_RUN (aucune suppression)\n' : '🧹 Nettoyage contenu public (membres/comptes inchangés)\n');

  await trimActualites();
  await trimEvents();
  await trimProjets();

  const counts = {
    actualites: await prisma.content.count({
      where: { statutWorkflow: 'PUBLIE', visibiliteCible: 'PUBLIC_SITE' },
    }),
    events: await prisma.event.count(),
    projets: await prisma.projet.count(),
    members: await prisma.member.count(),
    users: await prisma.user.count(),
  };

  console.log('\n📊 Après nettoyage :');
  console.log(`   actualités (site) : ${counts.actualites}`);
  console.log(`   événements        : ${counts.events}`);
  console.log(`   projets           : ${counts.projets}`);
  console.log(`   membres           : ${counts.members} (conservés)`);
  console.log(`   utilisateurs      : ${counts.users} (conservés)`);
  console.log(dryRun ? '\nRelancez sans DRY_RUN pour appliquer.' : '\n✅ Terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
