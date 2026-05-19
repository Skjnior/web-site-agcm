import 'dotenv/config';

/**
 * Vide TOTALEMENT le contenu public (actualités/contents, événements, projets,
 * messages contact, demandes adhésion/partenariat/dons) sans toucher aux comptes
 * utilisateurs, membres, mandats, postes, affectations ni au registre cotisations.
 *
 * Objectif : repartir d'une base vide côté contenu visible / formulaires publics
 * pour ressaisir manuellement les vraies données.
 *
 * Conserve :
 * - users, members, mandats, postes, affectations, registre cotisations
 * - partenaires (liens partenaires sont conservés ; videz via /admin/partenaires si besoin)
 *
 * Supprime intégralement :
 * - Content (actualités, activités, partages, annonces) et leurs comments
 * - Event et events_media
 * - Projet, projets_media, projets_partners (les Partner restent)
 * - MessageContact
 * - DemandeAdhesion / DemandePartenariat / DonationIntent
 * - GalerieImage (toutes les images uploadées dans la galerie)
 * - SitePublicPage (à recréer ensuite par le seed minimal si besoin)
 *
 * Usage (DRY RUN d'abord !) :
 *
 *   DATABASE_URL='postgresql://…' npm run db:trim-all-public
 *
 *   DATABASE_URL='postgresql://…' TRIM_EXECUTE=1 npm run db:trim-all-public
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const execute =
    process.env.TRIM_EXECUTE === '1' || process.env.TRIM_EXECUTE === 'true';

  if (!execute) {
    console.log(
      '\n🔒 Mode simulation uniquement — aucune suppression.\n' +
        '   Pour supprimer réellement : TRIM_EXECUTE=1 npm run db:trim-all-public\n',
    );
  } else {
    console.log(
      '\n⚠️  TRIM_EXECUTE=1 — suppressions réelles sur la base liée à DATABASE_URL.\n',
    );
  }

  const counts = {
    contents: await prisma.content.count(),
    comments: await prisma.comment.count(),
    events: await prisma.event.count(),
    eventMedias: await prisma.eventMedia.count(),
    projets: await prisma.projet.count(),
    projetMedias: await prisma.projetMedia.count(),
    projetPartners: await prisma.projetPartner.count(),
    messagesContact: await prisma.messageContact.count(),
    demandesAdhesion: await prisma.demandeAdhesion.count(),
    demandesPartenariat: await prisma.demandePartenariat.count(),
    donationIntents: await prisma.donationIntent.count(),
    galerieImages: await prisma.galerieImage.count(),
    sitePublicPages: await prisma.sitePublicPage.count(),
  };

  console.log('📊 Avant nettoyage :');
  console.log(`   contents (actualités / activités / partages / annonces) : ${counts.contents}`);
  console.log(`   comments                                                 : ${counts.comments}`);
  console.log(`   events                                                   : ${counts.events}`);
  console.log(`   events_media                                             : ${counts.eventMedias}`);
  console.log(`   projets                                                  : ${counts.projets}`);
  console.log(`   projets_media                                            : ${counts.projetMedias}`);
  console.log(`   projets_partners                                         : ${counts.projetPartners}`);
  console.log(`   messages_contact                                         : ${counts.messagesContact}`);
  console.log(`   demandes_adhesion                                        : ${counts.demandesAdhesion}`);
  console.log(`   demandes_partenariat                                     : ${counts.demandesPartenariat}`);
  console.log(`   donation_intents                                         : ${counts.donationIntents}`);
  console.log(`   galerie_images                                           : ${counts.galerieImages}`);
  console.log(`   site_public_pages                                        : ${counts.sitePublicPages}\n`);

  if (!execute) {
    console.log(
      '✅ Simulation terminée. Relancez avec TRIM_EXECUTE=1 pour exécuter.\n',
    );
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(
    async (tx) => {
      const delComments = await tx.comment.deleteMany({});
      console.log(`   Comments supprimés                : ${delComments.count}`);

      const delContents = await tx.content.deleteMany({});
      console.log(`   Contents supprimés                : ${delContents.count}`);

      const delEvents = await tx.event.deleteMany({});
      console.log(`   Events supprimés (cascade médias) : ${delEvents.count}`);

      const delProjetPartners = await tx.projetPartner.deleteMany({});
      console.log(`   ProjetPartner supprimés            : ${delProjetPartners.count}`);

      const delProjetMedias = await tx.projetMedia.deleteMany({});
      console.log(`   ProjetMedia supprimés              : ${delProjetMedias.count}`);

      const delProjets = await tx.projet.deleteMany({});
      console.log(`   Projets supprimés                  : ${delProjets.count}`);

      const delMessages = await tx.messageContact.deleteMany({});
      console.log(`   MessagesContact supprimés          : ${delMessages.count}`);

      const delDemAdh = await tx.demandeAdhesion.deleteMany({});
      console.log(`   DemandesAdhesion supprimées        : ${delDemAdh.count}`);

      const delDemPart = await tx.demandePartenariat.deleteMany({});
      console.log(`   DemandesPartenariat supprimées     : ${delDemPart.count}`);

      const delDons = await tx.donationIntent.deleteMany({});
      console.log(`   DonationIntents supprimés          : ${delDons.count}`);

      const delGalerie = await tx.galerieImage.deleteMany({});
      console.log(`   GalerieImage supprimées            : ${delGalerie.count}`);

      const delPages = await tx.sitePublicPage.deleteMany({});
      console.log(`   SitePublicPage supprimées          : ${delPages.count}`);
    },
    { timeout: 120_000, maxWait: 15_000 },
  );

  const after = {
    contents: await prisma.content.count(),
    events: await prisma.event.count(),
    projets: await prisma.projet.count(),
    members: await prisma.member.count(),
    users: await prisma.user.count(),
  };

  console.log('\n📊 Après nettoyage :');
  console.log(`   contents     : ${after.contents}`);
  console.log(`   events       : ${after.events}`);
  console.log(`   projets      : ${after.projets}`);
  console.log(`   members      : ${after.members} (inchangés)`);
  console.log(`   users        : ${after.users} (inchangés)\n`);

  console.log('✅ Terminé.\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
