/**
 * Supprime les comptes / fiches créés par le seed legacy (user<number>@agcm.gn).
 * Conserve les adhérents registre PDF (registre-pdf-*@import.agcm.local) et les comptes bureau @seed.agcm.local.
 *
 * Sécurité : dry-run par défaut. Pour exécuter : TRIM_EXECUTE=1
 *
 *   DRY_RUN=1 npm run db:trim-demo-members   (équivalent dry-run défaut)
 *   TRIM_EXECUTE=1 npm run db:trim-demo-members
 */

import 'dotenv/config';

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/** Pattern legacy dans seed.legacy-600-bulk.ts : user123@agcm.gn */
const DEMO_USER_REGEX = '^user[0-9]+@agcm\\.gn$';

function pdfMemberWhere(): Prisma.MemberWhereInput {
  return {
    AND: [{ email: { startsWith: 'registre-pdf-' } }, { email: { endsWith: '@import.agcm.local' } }],
  };
}

async function main() {
  const execute =
    process.env.TRIM_EXECUTE === '1' || process.env.TRIM_EXECUTE === 'true';
  const dryRun = !execute;

  if (dryRun) {
    console.log('🔒 Mode simulation (dry-run). Rien ne sera supprimé.');
    console.log('   Pour exécuter : TRIM_EXECUTE=1 npm run db:trim-demo-members\n');
  } else {
    console.log('⚠️  TRIM_EXECUTE=1 — suppression réelle des comptes démo legacy.\n');
  }

  const demoUsers =
    await prisma.$queryRaw<{ id: string; email: string }[]>(
      Prisma.sql`SELECT id, email FROM users WHERE email ~ ${DEMO_USER_REGEX}`,
    );

  const demoIds = demoUsers.map((u) => u.id);
  console.log(`👤 Utilisateurs démo matchés (${DEMO_USER_REGEX}) : ${demoIds.length}`);
  if (demoUsers.length <= 10) {
    demoUsers.forEach((u) => console.log(`     - ${u.email}`));
  } else if (demoUsers.length > 0) {
    console.log(`     (exemple) ${demoUsers[0]?.email} … ${demoUsers[demoUsers.length - 1]?.email}`);
  }

  const membersBefore = await prisma.member.count();
  const registreRows = await prisma.memberRegistreCotisation.count();
  const pdfMembers = await prisma.member.count({ where: pdfMemberWhere() });
  const bureauUsers =
    (
      await prisma.$queryRaw<{ n: bigint }[]>`
      SELECT COUNT(*)::bigint AS n FROM users WHERE email LIKE '%@seed.agcm.local'
    `
    )[0]?.n ?? 0n;

  console.log(`\n📊 Avant traitement`);
  console.log(`   members : ${membersBefore}`);
  console.log(`   member_registre_cotisations : ${registreRows}`);
  console.log(`   membres registre PDF (email) : ${pdfMembers}`);
  console.log(`   users bureau @seed.agcm.local : ${bureauUsers}\n`);

  if (demoIds.length === 0) {
    console.log('✅ Aucun compte legacy à supprimer.');
    await prisma.$disconnect();
    return;
  }

  const demoMembers = await prisma.member.findMany({
    where: { userId: { in: demoIds } },
    select: { id: true },
  });
  const memberIds = demoMembers.map((m) => m.id);

  if (dryRun) {
    console.log(`   → seraient supprimés : ~${demoIds.length} users + ~${memberIds.length} membres (+ affectations, commentaires, etc.)\n`);
    console.log('✅ Simulation terminée.');
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.affectationPoste.deleteMany({ where: { memberId: { in: memberIds } } });

    await tx.comment.deleteMany({ where: { auteurUserId: { in: demoIds } } });

    await tx.content.updateMany({
      where: { approvedById: { in: demoIds } },
      data: { approvedById: null },
    });

    await tx.demandeAdhesion.updateMany({
      where: { processedById: { in: demoIds } },
      data: { processedById: null },
    });

    await tx.demandePartenariat.updateMany({
      where: { processedById: { in: demoIds } },
      data: { processedById: null },
    });

    await tx.auditLog.deleteMany({ where: { userId: { in: demoIds } } });

    await tx.pageView.deleteMany({ where: { userId: { in: demoIds } } });

    await tx.bureauMessage.deleteMany({
      where: {
        OR: [
          { auteurUserId: { in: demoIds } },
          { dmPeerUserId: { in: demoIds } },
          { deletedBy: { in: demoIds } },
        ],
      },
    });

    const deletedUsers = await tx.user.deleteMany({ where: { id: { in: demoIds } } });
    console.log(`✅ Utilisateurs supprimés : ${deletedUsers.count}`);
  });

  const membersAfter = await prisma.member.count();
  const registreAfter = await prisma.memberRegistreCotisation.count();

  console.log(`\n📊 Après traitement`);
  console.log(`   members : ${membersAfter} (Δ ${membersAfter - membersBefore})`);
  console.log(`   member_registre_cotisations : ${registreAfter} (Δ ${registreAfter - registreRows})`);
  console.log('\n   Relancer si besoin : npm run db:import-registre');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
