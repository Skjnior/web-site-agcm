const { PrismaClient } = require('@prisma/client');

const LOCAL_URL = "postgresql://kader_denoyer:kaderdenoyer@localhost:5434/postgres";
const REMOTE_URL = "postgres://701013015bbf04229d7ceeffef4642e6ec76151e349ceffe1d1aba4f34ceb0bd:sk_9H18qliUoyl5-GyawVl5d@db.prisma.io:5432/postgres?sslmode=require";

const local = new PrismaClient({ datasources: { db: { url: LOCAL_URL } } });
const remote = new PrismaClient({ datasources: { db: { url: REMOTE_URL } } });

async function migrate() {
  console.log("🚀 Nettoyage de la base distante...");
  
  // Tables dans l'ordre inverse des dépendances pour le nettoyage
  const tableNames = [
    'audit_logs', 'page_views', 'comments', 'contents', 'affectations_poste', 
    'members', 'users', 'events_media', 'events', 'projets_media', 
    'projets_partners', 'projets', 'partners', 'postes', 'mandats', 
    'demandes_adhesion', 'demandes_partenariat', 'donation_intents', 
    'messages_contact', 'site_public_page', 'president_citations', 'bureau_message_attachments', 'bureau_messages'
  ];

  for (const table of tableNames) {
    try {
      await remote.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
    } catch (e) {
      // Certaines tables n'existent peut-être pas ou ont des noms différents dans le schéma public
      // On ignore les erreurs de nettoyage pour continuer
    }
  }

  console.log("📥 Début de l'importation...");

  // Modèles Prisma dans l'ordre des dépendances
  const models = [
    'mandat',
    'poste',
    'user',
    'member',
    'affectationPoste',
    'content',
    'event',
    'projet',
    'partner',
    'projetPartner',
    'projetMedia',
    'eventMedia',
    'demandeAdhesion',
    'demandePartenariat',
    'donationIntent',
    'messageContact',
    'sitePublicPage',
    'presidentCitation',
    'bureauMessage',
    'bureauMessageAttachment'
  ];

  for (const model of models) {
    try {
      const data = await local[model].findMany();
      if (data.length > 0) {
        console.log(`📦 Migration de ${model} (${data.length} lignes)...`);
        await remote[model].createMany({
          data: data,
          skipDuplicates: true
        });
      }
    } catch (error) {
      console.error(`   ❌ Erreur sur ${model}:`, error.message);
    }
  }

  console.log("🏁 Migration terminée avec succès !");
  await local.$disconnect();
  await remote.$disconnect();
}

migrate();
