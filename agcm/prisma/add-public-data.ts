// prisma/add-public-data.ts
// Script pour ajouter 20 actualités publiques et des événements visibles

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const actualitesTitres = [
  'Journée d\'intégration réussie pour les nouveaux membres',
  'Collecte de fonds pour les projets en Guinée : objectif atteint !',
  'Soirée culturelle : retour en images',
  'Nouveau partenariat avec la mairie de La Rochelle',
  'Formation aux démarches administratives : session de mars',
  'Tournoi de football solidaire : les résultats',
  'Appel aux bénévoles pour le projet éducatif en Guinée',
  'Assemblée générale annuelle : compte-rendu',
  'Atelier cuisine guinéenne : recettes partagées',
  'Soutien scolaire : nouvelles inscriptions ouvertes',
  'Projet de bibliothèque en Guinée : avancement',
  'Fête de l\'indépendance : célébration communautaire',
  'Sensibilisation environnement : actions menées',
  'Mentorat professionnel : témoignages de réussite',
  'Collecte de vêtements : merci pour votre générosité',
  'Conférence sur l\'intégration : intervenants annoncés',
  'Projet santé en Guinée : mission de mars',
  'Cours de français : nouvelles sessions disponibles',
  'Événement sportif : journée de cohésion',
  'Bilan annuel 2024 : nos réalisations',
];

const evenementsTitres = [
  'Journée d\'intégration des nouveaux membres',
  'Tournoi de football solidaire',
  'Soirée culturelle et gastronomie',
  'Collecte de kits scolaires',
  'Formation aux démarches administratives',
  'Atelier de cuisine guinéenne',
  'Conférence sur l\'entrepreneuriat',
  'Sortie découverte de La Rochelle',
  'Séance de soutien scolaire',
  'Réunion du bureau exécutif',
  'Célébration de la fête de l\'indépendance',
  'Collecte de vêtements et matériels',
  'Tournoi de pétanque',
  'Atelier de sensibilisation environnementale',
  'Soirée dansante et conviviale',
];

async function main() {
  console.log('🌱 Ajout de données publiques (actualités et événements)...\n');

  // Récupérer les données nécessaires
  const mandatActif = await prisma.mandat.findFirst({
    where: { statut: 'ACTIF' },
  });

  if (!mandatActif) {
    console.error('❌ Aucun mandat actif trouvé. Veuillez d\'abord exécuter le seed principal.');
    return;
  }

  const postes = await prisma.poste.findMany({ take: 10 });
  if (postes.length === 0) {
    console.error('❌ Aucun poste trouvé. Veuillez d\'abord exécuter le seed principal.');
    return;
  }

  const users = await prisma.user.findMany({
    where: { roleSysteme: 'ADMIN' as any },
    take: 1,
  });

  if (users.length === 0) {
    console.error('❌ Aucun admin trouvé. Veuillez d\'abord exécuter le seed principal.');
    return;
  }

  const admin = users[0];

  // ============================================
  // 1. CRÉER 20 ACTUALITÉS PUBLIQUES
  // ============================================
  console.log('📰 Création de 20 actualités publiques...');
  const actualites = [];
  for (let i = 0; i < 20; i++) {
    const poste = postes[i % postes.length];
    const titre = actualitesTitres[i];
    
    const actualite = await prisma.content.create({
      data: {
        type: 'ACTUALITE',
        titre,
        contenu: `Contenu détaillé de l'actualité "${titre}". Cette actualité présente les activités récentes de l'association, les projets en cours, et les événements à venir. Elle permet de tenir la communauté informée des actions menées par l'AGCM en Charente-Maritime et en Guinée.\n\nL'association continue de travailler activement pour renforcer les liens entre les membres, soutenir l'intégration, et mener des projets solidaires.`,
        imagePrincipale: `https://images.unsplash.com/photo-${1521737604893 + i}?w=800&auto=format&fit=crop`,
        tags: ['actualité', 'association', 'communauté'],
        visibiliteCible: 'PUBLIC_SITE',
        statutWorkflow: 'PUBLIE',
        auteurPosteId: poste.id,
        mandatId: mandatActif.id,
        approvedById: admin.id,
        approvedAt: new Date(),
      },
    });
    actualites.push(actualite);
    console.log(`   ✅ ${i + 1}/20 : ${titre}`);
  }
  console.log(`✅ ${actualites.length} actualités créées\n`);

  // ============================================
  // 2. CRÉER ÉVÉNEMENTS "À VENIR"
  // ============================================
  console.log('📅 Création d\'événements "À venir"...');
  const now = new Date();
  const evenementsAVenir = [];
  
  for (let i = 0; i < 8; i++) {
    const dateDebut = new Date(now);
    dateDebut.setDate(dateDebut.getDate() + (i + 1) * 7); // Semaines futures
    dateDebut.setHours(14 + (i % 4), 0, 0, 0);
    
    const dateFin = new Date(dateDebut);
    dateFin.setHours(dateFin.getHours() + 3);
    
    const titre = evenementsTitres[i % evenementsTitres.length];
    const slug = `evenement-${i + 1}-${Date.now()}`;
    const poste = postes[i % postes.length];
    
    const evenement = await prisma.event.create({
      data: {
        titre: `${titre} - ${dateDebut.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
        slug,
        description: `Description détaillée de l'événement "${titre}". Cet événement est organisé par l'association pour rassembler la communauté guinéenne de Charente-Maritime. Tous les membres et sympathisants sont invités à participer.\n\nProgramme :\n- Accueil des participants\n- Activités principales\n- Moment de convivialité\n- Clôture`,
        dateDebut,
        dateFin,
        lieu: ['La Rochelle', 'Rochefort', 'Royan', 'Saintes'][i % 4],
        statut: 'A_VENIR',
        afficheSite: true,
        createdByPosteId: poste.id,
        mandatId: mandatActif.id,
        medias: {
          create: {
            url: `https://images.unsplash.com/photo-${1521737604893 + i}?w=800&auto=format&fit=crop`,
            isPrincipale: true,
            ordre: 0,
          },
        },
      },
    });
    evenementsAVenir.push(evenement);
    console.log(`   ✅ ${i + 1}/8 : ${evenement.titre}`);
  }
  console.log(`✅ ${evenementsAVenir.length} événements "À venir" créés\n`);

  // ============================================
  // 3. CRÉER ÉVÉNEMENTS "EN COURS"
  // ============================================
  console.log('📅 Création d\'événements "En cours"...');
  const evenementsEnCours = [];
  
  for (let i = 0; i < 5; i++) {
    const dateDebut = new Date(now);
    dateDebut.setDate(dateDebut.getDate() - (i + 1)); // Commencé il y a quelques jours
    dateDebut.setHours(10, 0, 0, 0);
    
    const dateFin = new Date(now);
    dateFin.setDate(dateFin.getDate() + (i + 1) * 2); // Se termine dans quelques jours
    dateFin.setHours(18, 0, 0, 0);
    
    const titre = evenementsTitres[(i + 8) % evenementsTitres.length];
    const slug = `evenement-en-cours-${i + 1}-${Date.now()}`;
    const poste = postes[(i + 8) % postes.length];
    
    const evenement = await prisma.event.create({
      data: {
        titre: `${titre} - En cours`,
        slug,
        description: `Événement actuellement en cours : "${titre}". Cet événement a débuté récemment et se poursuit. N'hésitez pas à nous rejoindre !\n\nInformations pratiques :\n- Lieu accessible\n- Activités variées\n- Participation ouverte à tous`,
        dateDebut,
        dateFin,
        lieu: ['La Rochelle', 'Rochefort', 'Royan'][i % 3],
        statut: 'EN_COURS',
        afficheSite: true,
        createdByPosteId: poste.id,
        mandatId: mandatActif.id,
        medias: {
          create: {
            url: `https://images.unsplash.com/photo-${1500530855697 + i}?w=800&auto=format&fit=crop`,
            isPrincipale: true,
            ordre: 0,
          },
        },
      },
    });
    evenementsEnCours.push(evenement);
    console.log(`   ✅ ${i + 1}/5 : ${evenement.titre}`);
  }
  console.log(`✅ ${evenementsEnCours.length} événements "En cours" créés\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Données publiques ajoutées avec succès !');
  console.log(`   📰 ${actualites.length} actualités publiques`);
  console.log(`   📅 ${evenementsAVenir.length} événements "À venir"`);
  console.log(`   📅 ${evenementsEnCours.length} événements "En cours"`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'ajout des données:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

