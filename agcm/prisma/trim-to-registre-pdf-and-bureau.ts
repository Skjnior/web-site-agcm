/**
 * Ne conserve que :
 * — les membres créés depuis l’import registre PDF (emails `registre-pdf-*@import.agcm.local`) ;
 * — les utilisateurs ADMIN / SUPER_ADMIN et leurs fiches membres si elles existent ;
 * — les membres qui ont encore une affectation ACTIF sur un poste bureau (estBureau) du mandat ACTIF ;
 * — (optionnel) les comptes @seed.agcm.local pour rester tolérant en dev après seed bureau.
 *
 * Supprime tous les autres `members`, puis enlève les affectations orphelines, puis purge les utilisateurs
 * MEMBER sans fiche membres après coup (sessions « démo » héritées).
 *
 * Par défaut : simulation (dry-run). Exécution réelle :
 *   TRIM_EXECUTE=1 npm run db:trim-to-registre-bureau
 *
 * Production (obligatoire : pointer DATABASE_URL vers la base en ligne, jamais le .env local par erreur) :
 *   DATABASE_URL='postgresql://…' TRIM_EXECUTE=1 npm run db:trim-to-registre-bureau
 */

import 'dotenv/config';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const execute =
    process.env.TRIM_EXECUTE === '1' ||
    process.env.TRIM_EXECUTE === 'true';

  if (!execute) {
    console.log(
      '\n🔒 Mode simulation uniquement — aucune suppression.\n' +
        '   Pour supprimer réellement : TRIM_EXECUTE=1 npm run db:trim-to-registre-bureau\n',
    );
  } else {
    console.log('\n⚠️  TRIM_EXECUTE=1 — suppressions réelles sur la base liée à DATABASE_URL.\n');
  }

  const keepMemberIds = new Set<string>();

  const admins = await prisma.user.findMany({
    where: { roleSysteme: { in: ['SUPER_ADMIN', 'ADMIN'] } },
    select: { id: true, email: true, roleSysteme: true, member: { select: { id: true } } },
  });

  for (const u of admins) {
    if (u.member?.id) keepMemberIds.add(u.member.id);
    console.log(
      `   Protégé (rôle système) : ${u.email} (${u.roleSysteme}) → member ${u.member?.id ?? 'aucune fiche liée'}`,
    );
  }

  const bureauAccounts = await prisma.user.findMany({
    where: { email: { endsWith: '@seed.agcm.local' } },
    select: { id: true, email: true, roleSysteme: true, member: { select: { id: true } } },
  });

  for (const u of bureauAccounts) {
    if (u.member?.id) keepMemberIds.add(u.member.id);
    console.log(`   Compte bureau seed toléré : ${u.email}`);
  }

  const mandatActif = await prisma.mandat.findFirst({
    where: { statut: 'ACTIF' },
    orderBy: { dateDebut: 'desc' },
  });

  if (mandatActif) {
    const affectations = await prisma.affectationPoste.findMany({
      where: {
        mandatId: mandatActif.id,
        statut: 'ACTIF',
        poste: { estBureau: true },
      },
      select: { memberId: true },
      distinct: ['memberId'],
    });
    for (const a of affectations) keepMemberIds.add(a.memberId);
    console.log(
      `\n   Mandat actif : ${mandatActif.titre} — membres gardés pour postes bureau (ACTIF) : ${affectations.length}`,
    );
  } else {
    console.log('\n   ⚠️  Aucun mandat ACTIF — seuls ADMIN/SUPER_ADMIN, seed et PDF gardent une base cohérente.');
  }

  const pdfMembers = await prisma.member.findMany({
    where: {
      AND: [
        { email: { startsWith: 'registre-pdf-' } },
        { email: { endsWith: '@import.agcm.local' } },
      ],
    },
    select: { id: true },
  });

  for (const m of pdfMembers) keepMemberIds.add(m.id);

  console.log(`\n   Registre PDF (fiches import) conservées : ${pdfMembers.length}`);
  console.log(`   Total distinct de membres à conserver : ${keepMemberIds.size}`);

  const allMembers = await prisma.member.findMany({
    select: { id: true, email: true, nom: true, prenom: true, userId: true },
  });

  const toRemove = allMembers.filter((m) => !keepMemberIds.has(m.id));

  console.log(`\n   À supprimer environ : ${toRemove.length} fiche(s) membre`);

  if (toRemove.length > 20) {
    console.log(`      (premiers id) ${toRemove
      .slice(0, 5)
      .map((x) => x.id.slice(0, 8))
      .join(', ')}…`);
  } else if (toRemove.length) {
    for (const m of toRemove) {
      console.log(`      − ${m.prenom} ${m.nom} | ${m.email ?? 'pas d’email'} | ${m.id}`);
    }
  }

  if (!execute) {
    console.log('\n✅ Simulation terminée — relancez avec TRIM_EXECUTE=1 après vérification de DATABASE_URL.\n');
    await prisma.$disconnect();
    return;
  }

  const removeIds = toRemove.map((m) => m.id);

  await prisma.$transaction(
    async (tx) => {
    if (removeIds.length) {
      const delAff = await tx.affectationPoste.deleteMany({
        where: { memberId: { in: removeIds } },
      });
      console.log(`\n   Affectations supprimées pour les membres retirés : ${delAff.count}`);

      const delM = await tx.member.deleteMany({
        where: { id: { in: removeIds } },
      });
      console.log(`   Membres supprimés : ${delM.count}`);
    }

    const adminIds = admins.map((a) => a.id);
    const seedIds = bureauAccounts.map((b) => b.id);
    const neverDeleteUserIds = [...new Set([...adminIds, ...seedIds])];

    // Identifier les utilisateurs MEMBER orphelins (sans fiche Member après le trim)
    // pour nettoyer toutes les FK qui pointent vers eux avant le deleteMany final.
    const orphanUsers = await tx.user.findMany({
      where: {
        roleSysteme: 'MEMBER',
        member: null,
        id: { notIn: neverDeleteUserIds },
      },
      select: { id: true },
    });
    const orphanUserIds = orphanUsers.map((u) => u.id);

    if (orphanUserIds.length) {
      // Suppressions FK NOT NULL (sinon Prisma rejette le user.deleteMany)
      const delBureauMessages = await tx.bureauMessage.deleteMany({
        where: { auteurUserId: { in: orphanUserIds } },
      });
      console.log(`   Bureau messages supprimés (auteurs orphelins) : ${delBureauMessages.count}`);

      const delComments = await tx.comment.deleteMany({
        where: { auteurUserId: { in: orphanUserIds } },
      });
      console.log(`   Commentaires supprimés (auteurs orphelins) : ${delComments.count}`);

      // Nullifications FK nullable (on conserve les enregistrements, on perd juste le lien acteur)
      const updContents = await tx.content.updateMany({
        where: { approvedById: { in: orphanUserIds } },
        data: { approvedById: null },
      });
      console.log(`   Contents.approvedBy nullifiés : ${updContents.count}`);

      const updAudit = await tx.auditLog.updateMany({
        where: { userId: { in: orphanUserIds } },
        data: { userId: null },
      });
      console.log(`   AuditLogs.userId nullifiés : ${updAudit.count}`);

      const updPageViews = await tx.pageView.updateMany({
        where: { userId: { in: orphanUserIds } },
        data: { userId: null },
      });
      console.log(`   PageViews.userId nullifiés : ${updPageViews.count}`);

      const updDemAdh = await tx.demandeAdhesion.updateMany({
        where: { processedById: { in: orphanUserIds } },
        data: { processedById: null },
      });
      console.log(`   DemandesAdhesion.processedBy nullifiés : ${updDemAdh.count}`);

      const updDemPart = await tx.demandePartenariat.updateMany({
        where: { processedById: { in: orphanUserIds } },
        data: { processedById: null },
      });
      console.log(`   DemandesPartenariat.processedBy nullifiés : ${updDemPart.count}`);
    }

    const deletedOrphans = await tx.user.deleteMany({
      where: { id: { in: orphanUserIds } },
    });
    console.log(`   Utilisateurs MEMBER sans fiche « members » après nettoyage : ${deletedOrphans.count}`);
    },
    { timeout: 120_000, maxWait: 15_000 },
  );

  const [nMembers, nUsers, nRegRows] = await Promise.all([
    prisma.member.count(),
    prisma.user.count(),
    prisma.memberRegistreCotisation.count(),
  ]);

  console.log(`\n📊 Après traitement — members : ${nMembers}, users : ${nUsers}, registre lignes : ${nRegRows}\n`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  void prisma.$disconnect();
  process.exit(1);
});
