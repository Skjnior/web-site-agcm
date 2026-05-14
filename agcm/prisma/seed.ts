// prisma/seed.ts
// Script de seed pour générer 600 entrées dans CHAQUE table (21 tables)

import { PrismaClient, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { SITE_PUBLIC_DEFAULT_PAYLOAD } from '../src/config/site-public-default-payload';
import {
  BUREAU_EXECUTIF_POSTES,
  BUREAU_SEED_ACCOUNTS,
  BUREAU_SEED_DOMAIN,
  BUREAU_SEED_PASSWORD,
  NOMBRE_POSTES_BUREAU,
} from './bureau-reglement-seed';

const prisma = new PrismaClient();

// Données de base pour génération
const prenoms = [
  'Ahmed', 'Fatou', 'Moussa', 'Aissatou', 'Ibrahima', 'Mariama', 'Ousmane', 'Aminata',
  'Boubacar', 'Kadiatou', 'Mamadou', 'Fatoumata', 'Alpha', 'Hawa', 'Sekou', 'Aissata',
  'Mohamed', 'Aicha', 'Amadou', 'Djeneba', 'Bakary', 'Fanta', 'Lamine', 'Kadija',
  'Saidou', 'Mariam', 'Idrissa', 'Awa', 'Youssouf', 'Ramatou', 'Cheick', 'Aminata',
  'Souleymane', 'Hadjiratou', 'Mamady', 'Fatouma', 'Balla', 'Aissatou', 'Samba', 'Mariama',
  'Kadiatou', 'Ibrahima', 'Aissata', 'Oumar', 'Fatoumata', 'Boubacar', 'Aminata', 'Moussa',
  'Hawa', 'Alpha', 'Aicha', 'Mamadou', 'Djeneba', 'Sekou', 'Aissatou', 'Mohamed',
  'Kadija', 'Lamine', 'Fanta', 'Bakary', 'Awa', 'Idrissa', 'Mariam', 'Saidou',
  'Ramatou', 'Youssouf', 'Aminata', 'Cheick', 'Fatouma', 'Mamady', 'Hadjiratou', 'Souleymane',
];

const noms = [
  'Diallo', 'Bah', 'Camara', 'Sow', 'Barry', 'Touré', 'Keita', 'Sylla',
  'Cissé', 'Traoré', 'Kouyaté', 'Dramé', 'Sangaré', 'Konaté', 'Coulibaly', 'Diawara',
  'Doumbouya', 'Fofana', 'Kaba', 'Sidibé', 'Diakité', 'Sangaré', 'Cissokho', 'Diarra',
  'Koné', 'Dembélé', 'Sissoko', 'Diop', 'Ndiaye', 'Fall', 'Ba', 'Thiam',
  'Gueye', 'Niang', 'Seck', 'Dieng', 'Wade', 'Mbaye', 'Ndiaye', 'Sarr',
  'Diouf', 'Faye', 'Diatta', 'Samb', 'Ngom', 'Diouf', 'Sène', 'Diop',
  'Ndiaye', 'Fall', 'Ba', 'Thiam', 'Gueye', 'Niang', 'Seck', 'Dieng',
];

const villes = ['Conakry', 'Kankan', 'Kindia', 'Labé', 'Mamou', 'Nzérékoré', 'Boké', 'Faranah'];
const pays = ['Guinée', 'France', 'Sénégal', 'Mali', 'Côte d\'Ivoire', 'Burkina Faso'];

const TARGET_COUNT = 600;

// Images réelles Unsplash pour les projets (terrain, éducation, santé, environnement)
const PROJECT_IMAGES = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1559027615-cd9d7a915140?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
];

// Images réelles Unsplash pour les événements (communauté, réunions, forums)
const EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1559027615-cd9d7a915140?auto=format&fit=crop&w=800&q=80',
];

async function main() {
  console.log('🌱 Début du seed avec 600 entrées dans CHAQUE table (24 tables)...\n');

  // Nettoyer toutes les données existantes
  console.log('🧹 Nettoyage des données existantes...');
  await prisma.sitePublicPage.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.bureauMessageAttachment.deleteMany();
  await prisma.bureauMessage.deleteMany();
  await prisma.messageContact.deleteMany();
  await prisma.donationIntent.deleteMany();
  await prisma.demandePartenariat.deleteMany();
  await prisma.demandeAdhesion.deleteMany();
  await prisma.eventMedia.deleteMany();
  await prisma.event.deleteMany();
  await prisma.projetPartner.deleteMany();
  await prisma.projetMedia.deleteMany();
  await prisma.projet.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.content.deleteMany();
  await prisma.affectationPoste.deleteMany();
  await prisma.presidentCitation.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.poste.deleteMany();
  await prisma.mandat.deleteMany();
  console.log('✅ Nettoyage terminé\n');

  const hashedPassword = await bcrypt.hash(BUREAU_SEED_PASSWORD, 10);

  // ============================================
  // 1. CRÉER MANDATS (600)
  // ============================================
  console.log('📅 Création de 600 mandats...');
  const mandats = [];
  for (let i = 0; i < TARGET_COUNT; i++) {
    const dateDebut = new Date(2020 + (i % 10), i % 12, (i % 28) + 1);
    const dateFin = new Date(dateDebut);
    dateFin.setFullYear(dateFin.getFullYear() + 2);

    const statut = i < 50 ? 'ACTIF' : i < 300 ? 'EXPIRE' : 'ARCHIVE';

    const mandat = await prisma.mandat.create({
      data: {
        titre: `Mandat ${2020 + (i % 10)}-${2022 + (i % 10)}`,
        dateDebut,
        dateFin,
        statut: statut as any,
        pvDocumentUrl: i % 10 === 0 ? `https://example.com/pv/${i}.pdf` : null,
      },
    });
    mandats.push(mandat);

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${mandats.length} mandats créés\n`);

  /** Même mandat que `getMandatActif()` (ACTIF, dateDebut la plus récente) — affectations bureau + données visibles au tableau de bord par poste */
  const mandatActifLatest =
    mandats.filter((m) => m.statut === 'ACTIF').sort((a, b) => b.dateDebut.getTime() - a.dateDebut.getTime())[0] ||
    mandats[0];

  // ============================================
  // 2. CRÉER POSTES (9 bureau règlement + postes démo hors bureau)
  // ============================================
  console.log(`💼 Création de ${NOMBRE_POSTES_BUREAU} postes du bureau exécutif + postes démo...`);
  const postes = [];
  for (const p of BUREAU_EXECUTIF_POSTES) {
    postes.push(
      await prisma.poste.create({
        data: {
          nom: p.nom,
          description: p.description,
          estBureau: true,
          estActif: true,
        },
      })
    );
  }
  for (let i = NOMBRE_POSTES_BUREAU; i < TARGET_COUNT; i++) {
    const k = i - NOMBRE_POSTES_BUREAU + 1;
    const nom = `Poste démo ${k}`;
    postes.push(
      await prisma.poste.create({
        data: {
          nom,
          description: `Poste hors bureau (données de démonstration seed) — ${nom}`,
          estBureau: false,
          estActif: i < TARGET_COUNT - 50,
        },
      })
    );

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${postes.length} postes créés\n`);

  // ============================================
  // 3. CRÉER USERS — 9 comptes bureau (règlement) + utilisateurs démo
  // ============================================
  console.log('👤 Création des utilisateurs (bureau exécutif + démo)...');
  const users = [];
  for (const acc of BUREAU_SEED_ACCOUNTS) {
    users.push(
      await prisma.user.create({
        data: {
          email: `${acc.localPart}@${BUREAU_SEED_DOMAIN}`,
          passwordHash: hashedPassword,
          roleSysteme: acc.roleSysteme,
          isActive: true,
          lastLogin: new Date(),
        },
      })
    );
  }
  for (let i = BUREAU_SEED_ACCOUNTS.length; i < TARGET_COUNT; i++) {
    const email = `user${i + 1}@agcm.gn`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        roleSysteme: 'MEMBER',
        isActive: i < 580,
        lastLogin: i % 3 === 0 ? new Date() : null,
      },
    });
    users.push(user);

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${users.length} utilisateurs créés\n`);

  // ============================================
  // 4. CRÉER MEMBERS (600) — 9 premiers = titulaires des postes bureau sur mandat actif
  // ============================================
  console.log('👥 Création de 600 membres...');
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
  const members = [];
  for (let i = 0; i < TARGET_COUNT; i++) {
    const prenom = i < bureauIdentites.length ? bureauIdentites[i][0] : prenoms[i % prenoms.length];
    const nom = i < bureauIdentites.length ? bureauIdentites[i][1] : noms[i % noms.length];
    const user = users[i];

    const memberPhotos = [
      'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?w=400&q=80',
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80',
      'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&q=80',
      'https://images.unsplash.com/photo-1523444453880-928812c85ed9?w=400&q=80',
      'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    ];

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        prenom,
        nom,
        telephone: `+224 612 ${String(i).padStart(6, '0')}`,
        ville: villes[i % villes.length],
        pays: pays[i % pays.length],
        photoUrl: memberPhotos[i % memberPhotos.length],
        bio: i % 5 === 0 ? `Bio de ${prenom} ${nom}` : null,
        statutMembre: i < 550 ? 'ACTIF' : i < 580 ? 'SUSPENDU' : 'RADIE',
        dateAdhesion: new Date(2020 + (i % 5), i % 12, (i % 28) + 1),
      },
    });
    members.push(member);

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${members.length} membres créés\n`);

  // ============================================
  // 5. CRÉER AFFECTATIONS — exactement 9 actives sur le mandat actif (bureau exécutif)
  // ============================================
  console.log('🔗 Création de 600 affectations...');

  for (let b = 0; b < NOMBRE_POSTES_BUREAU; b++) {
    await prisma.affectationPoste.create({
      data: {
        mandatId: mandatActifLatest.id,
        posteId: postes[b].id,
        memberId: members[b].id,
        statut: 'ACTIF',
        dateDebut: mandatActifLatest.dateDebut,
        dateFin: null,
        raisonInactivation: null,
      },
    });
  }

  for (let i = NOMBRE_POSTES_BUREAU; i < TARGET_COUNT; i++) {
    const member = members[i];
    const poste = postes[i % postes.length];
    const mandat = mandats[i % mandats.length];
    const statut = i < 580 ? 'ARCHIVE' : 'INACTIF';

    await prisma.affectationPoste.create({
      data: {
        mandatId: mandat.id,
        posteId: poste.id,
        memberId: member.id,
        statut: statut as any,
        dateDebut: new Date(2020 + (i % 5), i % 12, (i % 28) + 1),
        dateFin: new Date(2023 + (i % 2), i % 12, (i % 28) + 1),
        raisonInactivation: statut === 'INACTIF' ? `Raison d'inactivation ${i}` : null,
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créées...`);
    }
  }
  console.log(`✅ ${TARGET_COUNT} affectations créées\n`);

  // ============================================
  // 6. CRÉER CONTENTS (600)
  // ============================================
  console.log('📝 Création de 600 contenus...');
  const contentTypes = ['ACTIVITE', 'ACTUALITE', 'PARTAGE', 'ANNONCE'];
  const visibilites = ['PRIVE_BUREAU', 'PUBLIC_SITE'];
  const statuts = ['BROUILLON', 'SOUMIS', 'APPROUVE', 'REJETE', 'PUBLIE', 'ARCHIVE'];

  const contents = [];
  for (let i = 0; i < TARGET_COUNT; i++) {
    const poste = postes[i % postes.length];
    const type = contentTypes[i % contentTypes.length];
    const visibilite = visibilites[i % visibilites.length];
    const statut = statuts[i % statuts.length];

    const content = await prisma.content.create({
      data: {
        type: type as any,
        titre: `Contenu ${i + 1}: ${type}`,
        contenu: `Description détaillée du contenu ${i + 1}`,
        lienExterne: i % 3 === 0 ? `https://example.com/link${i}` : null,
        imagePrincipale: i % 5 === 0 ? `https://example.com/images/${i}.jpg` : null,
        tags: [`tag${i % 10}`, `tag${(i + 1) % 10}`],
        visibiliteCible: visibilite as any,
        statutWorkflow: statut as any,
        auteurPosteId: poste.id,
        mandatId: mandatActifLatest.id,
        approvedById: statut === 'APPROUVE' || statut === 'PUBLIE' ? users[0].id : null,
        approvedAt: statut === 'APPROUVE' || statut === 'PUBLIE' ? new Date() : null,
        rejectionReason: statut === 'REJETE' ? `Raison de rejet ${i}` : null,
      },
    });
    contents.push(content);

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${contents.length} contenus créés\n`);

  // ============================================
  // 7. CRÉER COMMENTS (600)
  // ============================================
  console.log('💬 Création de 600 commentaires...');
  for (let i = 0; i < TARGET_COUNT; i++) {
    const content = contents[i % contents.length];
    const user = users[i % users.length];

    await prisma.comment.create({
      data: {
        contentId: content.id,
        auteurUserId: user.id,
        texte: `Commentaire ${i + 1} sur le contenu ${content.titre}`,
        isDeleted: i % 20 === 0, // 5% supprimés
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${TARGET_COUNT} commentaires créés\n`);

  // ============================================
  // 8. CRÉER PROJETS (600)
  // ============================================
  console.log('🚀 Création de 600 projets...');
  const projetStatuts = ['BROUILLON', 'EN_COURS', 'TERMINE', 'SUSPENDU', 'ANNULE'];
  const projets = [];

  for (let i = 0; i < TARGET_COUNT; i++) {
    const poste = postes[i % postes.length];
    const statut = projetStatuts[i % projetStatuts.length];

    const projet = await prisma.projet.create({
      data: {
        titre: `Projet ${i + 1}`,
        slug: `projet-${i + 1}`,
        objectif: `Objectif du projet ${i + 1}`,
        description: `Description détaillée du projet ${i + 1}`,
        actions: `Actions du projet ${i + 1}`,
        statut: statut as any,
        visibiliteSite: i % 2 === 0,
        responsablePosteId: poste.id,
        mandatId: mandatActifLatest.id,
      },
    });
    projets.push(projet);

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${projets.length} projets créés\n`);

  // ============================================
  // 9. CRÉER PROJET MEDIA (600) - Images réelles pour tous les projets
  // ============================================
  console.log('🖼️  Création de 600 médias projets (images réelles)...');
  for (let i = 0; i < TARGET_COUNT; i++) {
    const projet = projets[i % projets.length];
    const imageUrl = PROJECT_IMAGES[i % PROJECT_IMAGES.length];

    // Chaque projet a une image principale (l'API filtre par type IMAGE)
    await prisma.projetMedia.create({
      data: {
        projetId: projet.id,
        type: 'IMAGE',
        url: imageUrl,
        ordre: 0,
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${TARGET_COUNT} médias projets créés\n`);

  // ============================================
  // 10. CRÉER PARTNERS (600)
  // ============================================
  console.log('🤝 Création de 600 partenaires...');
  const partnerTypes = ['Institution', 'Entreprise', 'Association', 'ONG', 'Gouvernement'];
  const partners = [];

  for (let i = 0; i < TARGET_COUNT; i++) {
    const partner = await prisma.partner.create({
      data: {
        nom: `Partenaire ${i + 1}`,
        logo: i % 3 === 0 ? `https://example.com/logos/${i}.png` : null,
        description: `Description du partenaire ${i + 1}`,
        siteUrl: `https://partner${i}.example.com`,
        type: partnerTypes[i % partnerTypes.length],
        statut: i < 550 ? 'ACTIF' : 'INACTIF',
        visibiliteSite: i % 2 === 0,
      },
    });
    partners.push(partner);

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${partners.length} partenaires créés\n`);

  // ============================================
  // 11. CRÉER PROJET PARTNERS (600)
  // ============================================
  console.log('🔗 Création de 600 relations projets-partenaires...');
  for (let i = 0; i < TARGET_COUNT; i++) {
    const projet = projets[i % projets.length];
    const partner = partners[i % partners.length];

    await prisma.projetPartner.create({
      data: {
        projetId: projet.id,
        partnerId: partner.id,
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créées...`);
    }
  }
  console.log(`✅ ${TARGET_COUNT} relations projets-partenaires créées\n`);

  // ============================================
  // 12. CRÉER EVENTS (600)
  // ============================================
  console.log('📅 Création de 600 événements...');
  const eventStatuts = ['PASSE', 'EN_COURS', 'A_VENIR'];
  const events = [];

  for (let i = 0; i < TARGET_COUNT; i++) {
    const poste = postes[i % postes.length];
    const dateDebut = new Date(2020 + (i % 5), i % 12, (i % 28) + 1);
    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateFin.getDate() + (i % 7));

    let statut: 'PASSE' | 'EN_COURS' | 'A_VENIR' = 'A_VENIR';
    const now = new Date();
    if (dateDebut < now) {
      statut = dateFin > now ? 'EN_COURS' : 'PASSE';
    }

    const event = await prisma.event.create({
      data: {
        titre: `Événement ${i + 1}`,
        slug: `evenement-${i + 1}`,
        description: `Description de l'événement ${i + 1}`,
        dateDebut,
        dateFin,
        lieu: villes[i % villes.length],
        statut,
        afficheSite: i % 2 === 0,
        createdByPosteId: poste.id,
        mandatId: mandatActifLatest.id,
      },
    });
    events.push(event);

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${events.length} événements créés\n`);

  // ============================================
  // 13. CRÉER EVENT MEDIA (600) - Images réelles Unsplash
  // ============================================
  console.log('🖼️  Création de 600 médias événements (images réelles)...');
  for (let i = 0; i < TARGET_COUNT; i++) {
    const event = events[i % events.length];
    const imageUrl = EVENT_IMAGES[i % EVENT_IMAGES.length];

    await prisma.eventMedia.create({
      data: {
        eventId: event.id,
        url: imageUrl,
        isPrincipale: i % 3 === 0,
        ordre: i % 5,
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${TARGET_COUNT} médias événements créés\n`);

  // ============================================
  // 13b. CRÉER ÉVÉNEMENTS VISIBLES SUR LE SITE (minimum 10 à venir)
  // ============================================
  console.log('📅 Création des événements affichés sur le site (min 10)...');
  const postePresident = postes.find((p) => p.nom === 'Président') || postes[0];

  const realEvents = [
    {
      titre: 'Appel aux Bénévoles pour le Forum des Associations',
      slug: 'appel-aux-benevoles-forum-associations',
      description: "L'AGCM sera présente au prochain Forum des Associations. Nous recherchons des bénévoles pour tenir notre stand et présenter nos activités au grand public. Inscrivez-vous via le formulaire de contact.",
      dateDebut: new Date('2026-03-15'),
      dateFin: new Date('2026-03-15'),
      lieu: 'La Rochelle',
      imageUrl: 'https://images.unsplash.com/photo-1559027615-cd9d7a915140?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Assemblée Générale Ordinaire 2026',
      slug: 'assemblee-generale-ordinaire-2026',
      description: "Assemblée générale annuelle de l'AGCM : bilan des activités, présentation des projets et élection du bureau.",
      dateDebut: new Date('2026-04-10'),
      dateFin: new Date('2026-04-10'),
      lieu: 'La Rochelle',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Fête de l\'Indépendance de la Guinée',
      slug: 'fete-independance-guinee-2026',
      description: "Célébration du 2 octobre : musique, gastronomie et partage culturel. Rejoignez-nous pour cette journée festive !",
      dateDebut: new Date('2026-10-02'),
      dateFin: new Date('2026-10-02'),
      lieu: 'La Rochelle',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Atelier Cuisine Guinéenne',
      slug: 'atelier-cuisine-guineenne-2026',
      description: 'Découvrez les saveurs de la Guinée : riz au poisson, sauce feuilles et mafé. Un moment convivial et gourmand.',
      dateDebut: new Date('2026-05-20'),
      dateFin: new Date('2026-05-20'),
      lieu: 'La Rochelle',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    },
    {
      titre: 'Journée Portes Ouvertes AGCM',
      slug: 'journee-portes-ouvertes-2026',
      description: 'Venez découvrir nos locaux, nos projets et rencontrer les membres du bureau. Café et pâtisseries offerts.',
      dateDebut: new Date('2026-06-14'),
      dateFin: new Date('2026-06-14'),
      lieu: 'La Rochelle',
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Pique-nique de l\'été',
      slug: 'pique-nique-ete-2026',
      description: 'Grand pique-nique familial au parc. Apportez vos plats à partager. Animations pour les enfants.',
      dateDebut: new Date('2026-07-20'),
      dateFin: new Date('2026-07-20'),
      lieu: 'La Rochelle',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Soirée Solidarité Guinée',
      slug: 'soiree-solidarite-guinee-2026',
      description: 'Soirée caritative au profit de nos projets éducatifs en Guinée. Repas, animations et tombola.',
      dateDebut: new Date('2026-09-12'),
      dateFin: new Date('2026-09-12'),
      lieu: 'La Rochelle',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Formation aux premiers secours',
      slug: 'formation-premiers-secours-2026',
      description: 'Session de formation PSC1 en partenariat avec la Croix-Rouge. Places limitées, inscription obligatoire.',
      dateDebut: new Date('2026-08-05'),
      dateFin: new Date('2026-08-06'),
      lieu: 'La Rochelle',
      imageUrl: 'https://images.unsplash.com/photo-1559027615-cd9d7a915140?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Carnaval des cultures',
      slug: 'carnaval-cultures-2026',
      description: 'L\'AGCM participe au défilé du Carnaval des cultures. Venez en costume traditionnel ou simplement nous encourager !',
      dateDebut: new Date('2026-05-01'),
      dateFin: new Date('2026-05-01'),
      lieu: 'La Rochelle',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Réunion d\'information nouveaux adhérents',
      slug: 'reunion-info-nouveaux-adherents-2026',
      description: 'Session d\'accueil pour les nouveaux membres : présentation de l\'association, des activités et du bureau.',
      dateDebut: new Date('2026-11-15'),
      dateFin: new Date('2026-11-15'),
      lieu: 'La Rochelle',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const ev of realEvents) {
    const event = await prisma.event.create({
      data: {
        titre: ev.titre,
        slug: ev.slug,
        description: ev.description,
        dateDebut: ev.dateDebut,
        dateFin: ev.dateFin,
        lieu: ev.lieu,
        statut: 'A_VENIR',
        afficheSite: true,
        createdByPosteId: postePresident.id,
        mandatId: mandatActifLatest.id,
      },
    });
    await prisma.eventMedia.create({
      data: {
        eventId: event.id,
        url: ev.imageUrl,
        isPrincipale: true,
        ordre: 0,
      },
    });
  }
  console.log(`✅ ${realEvents.length} événements visibles sur le site créés\n`);

  // ============================================
  // 14. CRÉER DEMANDES ADHESION (600)
  // ============================================
  console.log('📋 Création de 600 demandes d\'adhésion...');
  const demandeStatuts = ['EN_ATTENTE', 'APPROUVEE', 'REFUSEE'];

  for (let i = 0; i < TARGET_COUNT; i++) {
    const prenom = prenoms[i % prenoms.length];
    const nom = noms[i % noms.length];
    const statut = demandeStatuts[i % demandeStatuts.length];

    await prisma.demandeAdhesion.create({
      data: {
        prenom,
        nom,
        email: `demande${i + 1}@example.com`,
        telephone: `+224 612 ${String(i).padStart(6, '0')}`,
        ville: villes[i % villes.length],
        pays: pays[i % pays.length],
        message: i % 3 === 0 ? `Message de motivation ${i + 1}` : null,
        statut: statut as any,
        processedById: statut !== 'EN_ATTENTE' ? users[0].id : null,
        processedAt: statut !== 'EN_ATTENTE' ? new Date() : null,
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créées...`);
    }
  }
  console.log(`✅ ${TARGET_COUNT} demandes d'adhésion créées\n`);

  // ============================================
  // 15. CRÉER DEMANDES PARTENARIAT (600)
  // ============================================
  console.log('🤝 Création de 600 demandes de partenariat...');
  for (let i = 0; i < TARGET_COUNT; i++) {
    const statut = demandeStatuts[i % demandeStatuts.length];

    await prisma.demandePartenariat.create({
      data: {
        organisation: `Organisation ${i + 1}`,
        contactNom: `${prenoms[i % prenoms.length]} ${noms[i % noms.length]}`,
        email: `partenariat${i + 1}@example.com`,
        telephone: `+224 612 ${String(i).padStart(6, '0')}`,
        typePartenariat: partnerTypes[i % partnerTypes.length],
        message: i % 3 === 0 ? `Message de partenariat ${i + 1}` : null,
        statut: statut as any,
        processedById: statut !== 'EN_ATTENTE' ? users[0].id : null,
        processedAt: statut !== 'EN_ATTENTE' ? new Date() : null,
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créées...`);
    }
  }
  console.log(`✅ ${TARGET_COUNT} demandes de partenariat créées\n`);

  // ============================================
  // 16. CRÉER DONATION INTENTS (600)
  // ============================================
  console.log('💝 Création de 600 intentions de don...');
  const donationTypes = ['FINANCIER', 'MATERIEL', 'AUTRE'];
  const donationStatuts = ['NOUVEAU', 'CONTACTE', 'CONFIRME', 'CLASSE_SANS_SUITE'];

  for (let i = 0; i < TARGET_COUNT; i++) {
    const poste = postes[i % postes.length];

    await prisma.donationIntent.create({
      data: {
        type: donationTypes[i % donationTypes.length] as any,
        montantEstime: i % 2 === 0 ? (i + 1) * 100 : null,
        description: i % 3 === 0 ? `Description du don ${i + 1}` : null,
        nom: i % 2 === 0 ? `${prenoms[i % prenoms.length]} ${noms[i % noms.length]}` : null,
        email: i % 2 === 0 ? `don${i + 1}@example.com` : null,
        telephone: i % 2 === 0 ? `+224 612 ${String(i).padStart(6, '0')}` : null,
        statut: donationStatuts[i % donationStatuts.length] as any,
        handledByPosteId: poste.id,
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créées...`);
    }
  }
  console.log(`✅ ${TARGET_COUNT} intentions de don créées\n`);

  // ============================================
  // 17. CRÉER MESSAGES CONTACT (600)
  // ============================================
  console.log('📧 Création de 600 messages de contact...');
  const contactStatuts = ['NOUVEAU', 'EN_COURS', 'TRAITE', 'ARCHIVE'];

  for (let i = 0; i < TARGET_COUNT; i++) {
    const poste = postes[i % postes.length];

    await prisma.messageContact.create({
      data: {
        nom: `${prenoms[i % prenoms.length]} ${noms[i % noms.length]}`,
        email: `contact${i + 1}@example.com`,
        sujet: `Sujet du message ${i + 1}`,
        message: `Contenu du message ${i + 1}`,
        statut: contactStatuts[i % contactStatuts.length] as any,
        destinatairePosteId: i % 2 === 0 ? poste.id : null,
        assignedToPosteId: i % 3 === 0 ? poste.id : null,
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${TARGET_COUNT} messages de contact créés\n`);

  // ============================================
  // 18. CRÉER BUREAU MESSAGES (600)
  // ============================================
  console.log('💬 Création de 600 messages bureau...');
  const scopes = ['PRIVE_BUREAU', 'PUBLIC_MEMBRES'];

  for (let i = 0; i < TARGET_COUNT; i++) {
    const user = users[i % users.length];
    const scope = scopes[i % scopes.length];

    await prisma.bureauMessage.create({
      data: {
        auteurUserId: user.id,
        mandatId: i % 2 === 0 ? mandatActifLatest.id : null,
        texte: `Message ${i + 1} dans le bureau`,
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${TARGET_COUNT} messages bureau créés\n`);

  // ============================================
  // 19. CRÉER AUDIT LOGS (600)
  // ============================================
  console.log('📊 Création de 600 logs d\'audit...');
  const auditActions = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'SUBMIT', 'ASSIGN', 'INACTIVATE', 'ARCHIVE'];
  const entityTypes = ['User', 'Member', 'Content', 'Projet', 'Event', 'DemandeAdhesion', 'Mandat', 'Poste', 'AffectationPoste', 'Vote'];

  for (let i = 0; i < TARGET_COUNT; i++) {
    const user = users[i % users.length];
    const action = auditActions[i % auditActions.length];
    const entityType = entityTypes[i % entityTypes.length];

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: action as any,
        entityType,
        entityId: `entity-${i}`,
        beforeData: i % 2 === 0 ? { old: 'value' } : undefined,
        afterData: { new: 'value' },
      },
    });

    if ((i + 1) % 100 === 0) {
      console.log(`   ${i + 1}/${TARGET_COUNT} créés...`);
    }
  }
  console.log(`✅ ${TARGET_COUNT} logs d'audit créés\n`);

  // ============================================
  // 19b. DÉMO BUREAU — contenus / projets / événements + audits réels par poste exécutif
  // ============================================
  console.log(
    '🎯 Données de démo bureau (chaque poste exécutif : contenus variés, projets, événements, traces)...'
  );
  const demoSlug = (prefix: string) =>
    `${prefix}-${randomUUID().replace(/-/g, '').slice(0, 12)}`.toLowerCase();

  for (let b = 0; b < NOMBRE_POSTES_BUREAU; b++) {
    const poste = postes[b];
    const actor = users[b];
    const shortNom = poste.nom.slice(0, 48);

    const contentDefs: Array<{
      statut: 'BROUILLON' | 'SOUMIS' | 'APPROUVE' | 'PUBLIE' | 'REJETE';
      titre: string;
      type?: 'ACTIVITE' | 'ACTUALITE' | 'PARTAGE' | 'ANNONCE';
      visibilite?: 'PRIVE_BUREAU' | 'PUBLIC_SITE';
      rejectionReason?: string;
      withApproved?: boolean;
    }> = [
      {
        statut: 'BROUILLON',
        titre: `[Démo bureau] Brouillon — ${shortNom}`,
        type: 'ACTIVITE',
        visibilite: 'PRIVE_BUREAU',
      },
      {
        statut: 'SOUMIS',
        titre: `[Démo bureau] En attente validation — ${shortNom}`,
        type: 'ACTUALITE',
        visibilite: 'PUBLIC_SITE',
      },
      {
        statut: 'APPROUVE',
        titre: `[Démo bureau] Approuvé (site) — ${shortNom}`,
        type: 'PARTAGE',
        visibilite: 'PUBLIC_SITE',
        withApproved: true,
      },
      {
        statut: 'PUBLIE',
        titre: `[Démo bureau] Publié — ${shortNom}`,
        type: 'ACTIVITE',
        visibilite: 'PUBLIC_SITE',
        withApproved: true,
      },
      {
        statut: 'REJETE',
        titre: `[Démo bureau] Rejeté (à corriger) — ${shortNom}`,
        type: 'ANNONCE',
        visibilite: 'PUBLIC_SITE',
        rejectionReason: 'Exemple seed : merci de préciser les dates et le lieu public.',
      },
    ];

    for (const def of contentDefs) {
      const c = await prisma.content.create({
        data: {
          type: (def.type || 'ACTIVITE') as any,
          titre: def.titre,
          contenu: `Contenu de démonstration pour le poste « ${poste.nom} » (mandat actif). Visible dans Mes activités et Traces.`,
          visibiliteCible: (def.visibilite || 'PUBLIC_SITE') as any,
          statutWorkflow: def.statut as any,
          auteurPosteId: poste.id,
          mandatId: mandatActifLatest.id,
          approvedById: def.withApproved ? users[0].id : null,
          approvedAt: def.withApproved ? new Date() : null,
          rejectionReason: def.rejectionReason ?? null,
          tags: ['demo-bureau', `poste-${b}`],
        },
      });
      await prisma.auditLog.create({
        data: {
          userId: actor.id,
          action: 'CREATE',
          entityType: 'Content',
          entityId: c.id,
          afterData: { titre: c.titre, statutWorkflow: def.statut },
        },
      });
      await prisma.auditLog.create({
        data: {
          userId: actor.id,
          action: 'UPDATE',
          entityType: 'Content',
          entityId: c.id,
          beforeData: { statutWorkflow: 'BROUILLON' },
          afterData: { statutWorkflow: def.statut },
        },
      });
    }

    const projetDefs = [
      {
        statut: 'BROUILLON' as const,
        visibiliteSite: false,
        titre: `[Démo bureau] Projet brouillon — ${shortNom}`,
      },
      {
        statut: 'EN_COURS' as const,
        visibiliteSite: true,
        titre: `[Démo bureau] Projet en cours (site) — ${shortNom}`,
      },
      {
        statut: 'TERMINE' as const,
        visibiliteSite: true,
        titre: `[Démo bureau] Projet terminé — ${shortNom}`,
      },
    ];

    for (const pd of projetDefs) {
      const pr = await prisma.projet.create({
        data: {
          titre: pd.titre,
          slug: demoSlug(`p-${b}`),
          objectif: `Objectif de démonstration pour ${poste.nom}.`,
          description: `Description seed — projet ${pd.statut.toLowerCase()}, visibilité site : ${pd.visibiliteSite ? 'oui' : 'non'}.`,
          statut: pd.statut,
          visibiliteSite: pd.visibiliteSite,
          responsablePosteId: poste.id,
          mandatId: mandatActifLatest.id,
        },
      });
      await prisma.auditLog.create({
        data: {
          userId: actor.id,
          action: 'CREATE',
          entityType: 'Projet',
          entityId: pr.id,
          afterData: { titre: pr.titre, statut: pd.statut },
        },
      });
      await prisma.auditLog.create({
        data: {
          userId: actor.id,
          action: 'UPDATE',
          entityType: 'Projet',
          entityId: pr.id,
          afterData: { visibiliteSite: pd.visibiliteSite },
        },
      });
    }

    const now = Date.now();
    const eventDefs = [
      {
        statut: 'PASSE' as const,
        afficheSite: true,
        titre: `[Démo bureau] Événement passé — ${shortNom}`,
        dateDebut: new Date(now - 45 * 86400000),
        lieu: 'La Rochelle — salle de démo',
      },
      {
        statut: 'EN_COURS' as const,
        afficheSite: false,
        titre: `[Démo bureau] Événement en cours — ${shortNom}`,
        dateDebut: new Date(now - 3600000),
        lieu: 'En ligne (seed)',
      },
      {
        statut: 'A_VENIR' as const,
        afficheSite: true,
        titre: `[Démo bureau] Événement à venir — ${shortNom}`,
        dateDebut: new Date(now + 21 * 86400000),
        lieu: 'Lieu à confirmer',
      },
    ];

    for (const ed of eventDefs) {
      const ev = await prisma.event.create({
        data: {
          titre: ed.titre,
          slug: demoSlug(`e-${b}`),
          description: `Événement seed (${ed.statut}) pour le poste « ${poste.nom} ».`,
          dateDebut: ed.dateDebut,
          dateFin: ed.statut === 'EN_COURS' ? new Date(now + 7200000) : null,
          lieu: ed.lieu,
          statut: ed.statut,
          afficheSite: ed.afficheSite,
          createdByPosteId: poste.id,
          mandatId: mandatActifLatest.id,
        },
      });
      await prisma.auditLog.create({
        data: {
          userId: actor.id,
          action: 'CREATE',
          entityType: 'Event',
          entityId: ev.id,
          afterData: { titre: ev.titre, statut: ed.statut },
        },
      });
    }
  }
  console.log('✅ Démo bureau créée (9 postes × contenus / projets / événements + audits)\n');

  // ============================================
  // 25. CRÉER PRESIDENT CITATIONS (2)
  // ============================================
  console.log('🗣️  Création des citations de présidents...');
  await prisma.presidentCitation.create({
    data: {
      nom: 'Diallo Mamadou',
      message: 'Notre engagement pour la communauté guinéenne en Charente-Maritime est le moteur de nos actions.',
      debutMandat: new Date('2023-01-01'),
      finMandat: new Date('2025-12-31'),
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
  });
  await prisma.presidentCitation.create({
    data: {
      nom: 'Camara Aboubacar',
      message: "L'association m'a accueilli quand je suis arrivé en France. J'ai trouvé une famille.",
      debutMandat: new Date('2020-01-01'),
      finMandat: new Date('2022-12-31'),
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
  });
  console.log('✅ Citations de présidents créées\n');

  // ============================================
  // 26. CRÉER ACTUALITÉS PUBLIÉES (minimum 10 pour le site public)
  // ============================================
  console.log('📰 Création des actualités publiées (min 10)...');
  const realNews = [
    {
      titre: 'Grande Assemblée Générale Annuelle de l\'AGCM',
      contenu: 'Nous convions tous nos membres à notre assemblée générale annuelle qui se tiendra ce samedi à 14h. Au programme : bilan des activités de l\'année écoulée, présentation des projets futurs et élection du nouveau bureau. Votre présence est capitale pour l\'avenir de notre association.',
      type: 'ACTUALITE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      tags: ['AG', 'AGCM', 'Réunion'],
    },
    {
      titre: 'Distribution de kits scolaires : Succès de l\'opération',
      contenu: 'Grâce à votre générosité, nous avons pu distribuer plus de 100 kits scolaires aux enfants de la communauté. Un grand merci à tous les donateurs et bénévoles qui ont rendu ce projet possible. L\'éducation est notre priorité.',
      type: 'PARTAGE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      tags: ['Éducation', 'Entraide', 'Succès'],
    },
    {
      titre: 'Célébration de la Fête de l\'Indépendance de la Guinée',
      contenu: 'Retour en images sur la magnifique célébration du 2 octobre. Une journée riche en couleurs, en musique et en partage gastronomique qui a réuni plus de 300 personnes. Vive la Guinée et vive la solidarité guinéenne en Charente-Maritime !',
      type: 'ACTIVITE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
      tags: ['Culture', 'Guinée', 'Fête'],
    },
    {
      titre: 'Nouveau Partenariat avec la Mairie de La Rochelle',
      contenu: 'C\'est avec fierté que nous annonçons le renforcement de notre partenariat avec la Mairie de La Rochelle. Ce soutien permettra de lancer de nouveaux ateliers d\'accompagnement administratif dès le mois prochain.',
      type: 'ANNONCE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      tags: ['Partenariat', 'Institutionnel'],
    },
    {
      titre: 'Atelier Cuisine : Découvrez les Saveurs de la Basse-Guinée',
      contenu: 'Rejoignez-nous ce week-end pour un atelier de cuisine traditionnelle. Apprenez à cuisiner le fameux riz au poisson et la sauce feuilles. Un moment de convivialité et de découverte culinaire à ne pas manquer.',
      type: 'ACTIVITE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      tags: ['Cuisine', 'Atelier', 'Culture'],
    },
    {
      titre: 'Appel aux Bénévoles pour le Forum des Associations',
      contenu: 'L\'AGCM sera présente au prochain Forum des Associations. Nous recherchons des bénévoles pour tenir notre stand et présenter nos activités au grand public. Inscrivez-vous via le formulaire de contact.',
      type: 'ACTUALITE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1559027615-cd9d7a915140?auto=format&fit=crop&w=800&q=80',
      tags: ['Bénévolat', 'Forum', 'Engagement'],
    },
    {
      titre: 'Rentrée associative 2026 : Nouveaux projets à venir',
      contenu: 'L\'AGCM prépare une rentrée riche en activités. Soutien scolaire, cours de français, ateliers culturels et événements festifs sont au programme. Restez connectés pour ne rien manquer !',
      type: 'ACTUALITE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
      tags: ['Rentrée', 'Projets', 'AGCM'],
    },
    {
      titre: 'Soirée de solidarité : Bilan et perspectives',
      contenu: 'La soirée de solidarité du mois dernier a permis de collecter des fonds pour nos projets en Guinée. Merci à tous les participants et bénévoles. Prochaine édition prévue en septembre.',
      type: 'ACTUALITE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      tags: ['Solidarité', 'Événement', 'Bilan'],
    },
    {
      titre: 'Formation aux premiers secours : Session réussie',
      contenu: 'Une vingtaine de membres ont suivi la formation aux premiers secours organisée en partenariat avec la Croix-Rouge. Une compétence précieuse pour notre communauté.',
      type: 'ACTUALITE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1559027615-cd9d7a915140?auto=format&fit=crop&w=800&q=80',
      tags: ['Formation', 'Premiers secours', 'Santé'],
    },
    {
      titre: 'Carnaval des cultures : L\'AGCM à l\'honneur',
      contenu: 'Notre association a défilé lors du Carnaval des cultures de La Rochelle. Costumes traditionnels, danses et chants ont ravi le public. Une belle vitrine pour la culture guinéenne !',
      type: 'ACTUALITE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
      tags: ['Carnaval', 'Culture', 'La Rochelle'],
    },
  ];

  for (const news of realNews) {
    await prisma.content.create({
      data: {
        titre: news.titre,
        contenu: news.contenu,
        type: news.type,
        imagePrincipale: news.imagePrincipale,
        tags: news.tags,
        statutWorkflow: 'PUBLIE',
        visibiliteCible: 'PUBLIC_SITE',
        auteurPosteId: postes[0].id,
        mandatId: mandatActifLatest.id,
        approvedById: users[0].id,
        approvedAt: new Date(),
      },
    });
  }
  console.log(`✅ ${realNews.length} actualités publiées créées\n`);

  // ============================================
  // Contenu éditorial site vitrine (landing / à propos)
  // ============================================
  await prisma.sitePublicPage.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      payload: SITE_PUBLIC_DEFAULT_PAYLOAD as unknown as Prisma.InputJsonValue,
    },
    update: {
      payload: SITE_PUBLIC_DEFAULT_PAYLOAD as unknown as Prisma.InputJsonValue,
    },
  });
  console.log('✅ Contenu public du site (SitePublicPage)\n');

  // ============================================
  // RÉSUMÉ FINAL
  // ============================================
  console.log('\n📊 RÉSUMÉ DU SEED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const counts = {
    mandats: await prisma.mandat.count(),
    postes: await prisma.poste.count(),
    users: await prisma.user.count(),
    members: await prisma.member.count(),
    affectations: await prisma.affectationPoste.count(),
    contents: await prisma.content.count(),
    comments: await prisma.comment.count(),
    projets: await prisma.projet.count(),
    projetMedia: await prisma.projetMedia.count(),
    partners: await prisma.partner.count(),
    projetPartners: await prisma.projetPartner.count(),
    events: await prisma.event.count(),
    eventMedia: await prisma.eventMedia.count(),
    demandesAdhesion: await prisma.demandeAdhesion.count(),
    demandesPartenariat: await prisma.demandePartenariat.count(),
    donationIntents: await prisma.donationIntent.count(),
    messagesContact: await prisma.messageContact.count(),
    bureauMessages: await prisma.bureauMessage.count(),
    auditLogs: await prisma.auditLog.count(),
    citationsPresident: await prisma.presidentCitation.count(),
    sitePublicPage: await prisma.sitePublicPage.count(),
  };

  Object.entries(counts).forEach(([table, count]) => {
    const status = count === TARGET_COUNT ? '✅' : '⚠️';
    console.log(`${status} ${table.padEnd(25)} : ${count.toString().padStart(4)} entrées`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n🎉 Seed terminé ! Total : ${Object.values(counts).reduce((a, b) => a + b, 0)} entrées`);
  console.log('\n📝 Comptes bureau exécutif (9 postes, règlement intérieur) :');
  console.log(`   Mot de passe unique : ${BUREAU_SEED_PASSWORD}`);
  BUREAU_SEED_ACCOUNTS.forEach((acc, idx) => {
    const posteNom = BUREAU_EXECUTIF_POSTES[idx]?.nom ?? '?';
    console.log(`   ${posteNom}: ${acc.localPart}@${BUREAU_SEED_DOMAIN} (${acc.roleSysteme})`);
  });
  console.log(`\n   Utilisateurs démo : user10@agcm.gn … user600@agcm.gn — même mot de passe`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
