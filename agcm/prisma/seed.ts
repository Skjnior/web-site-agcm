/**
 * Seed AGCM — RÉINITIALISATION COMPLÈTE (efface toute la base).
 *
 * ⚠️ Ne pas lancer en production ni pour conserver des données existantes.
 * Préférer : npm run db:trim
 *
 * Commande : npm run seed:fresh
 *
 * L’ancien seed « 600 entrées par table » : npm run seed:legacy-600
 */

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
import { loadRegistrePdfParsedRows } from './registre-pdf-parser';

const prisma = new PrismaClient();

/** Date de référence du registre (PDF : situation au 17 avril 2026). */
const DATE_REGISTRE_PDF = new Date('2026-04-17T00:00:00.000Z');

async function main() {
  console.log('🌱 Seed AGCM — bureau, registre PDF adhérents, démo légère (sans masse 600)...\n');

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
  await prisma.galerieImage.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.content.deleteMany();
  await prisma.affectationPoste.deleteMany();
  await prisma.presidentCitation.deleteMany();
  await prisma.memberRegistreCotisation.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.poste.deleteMany();
  await prisma.mandat.deleteMany();
  console.log('✅ Nettoyage terminé\n');

  const hashedPassword = await bcrypt.hash(BUREAU_SEED_PASSWORD, 10);

  console.log('📅 Création des mandats (1 actif)...');
  const mandats = [];
  for (let i = 0; i < 5; i++) {
    const dateDebut = new Date(2022 + i, 0, 1);
    const dateFin = new Date(dateDebut);
    dateFin.setFullYear(dateFin.getFullYear() + 2);
    mandats.push(
      await prisma.mandat.create({
        data: {
          titre: `Mandat ${2022 + i}-${2024 + i}`,
          dateDebut,
          dateFin,
          statut: i === 4 ? 'ACTIF' : 'EXPIRE',
          pvDocumentUrl: null,
        },
      }),
    );
  }
  const mandatActifLatest = mandats[4];
  console.log(`✅ ${mandats.length} mandats\n`);

  console.log(`💼 Création des ${NOMBRE_POSTES_BUREAU} postes du bureau exécutif...`);
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
      }),
    );
  }
  console.log(`✅ ${postes.length} postes\n`);

  console.log('👤 Création des comptes bureau (9)...');
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
      }),
    );
  }
  console.log(`✅ ${users.length} utilisateurs\n`);

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

  console.log('👥 Création des membres titulaires du bureau (9)...');
  const membersBureau = [];
  for (let i = 0; i < NOMBRE_POSTES_BUREAU; i++) {
    const prenom = bureauIdentites[i][0];
    const nom = bureauIdentites[i][1];
    const user = users[i];
    const member = await prisma.member.create({
      data: {
        userId: user.id,
        prenom,
        nom,
        telephone: `+33 6 12 34 56 8${i}`,
        ville: 'La Rochelle',
        pays: 'France',
        photoUrl: memberPhotos[i % memberPhotos.length],
        bio: null,
        statutMembre: 'ACTIF',
        dateAdhesion: new Date(2024, 5, 1),
      },
    });
    membersBureau.push(member);
  }
  console.log(`✅ ${membersBureau.length} membres bureau\n`);

  console.log('🔗 Affectations bureau sur le mandat actif...');
  for (let b = 0; b < NOMBRE_POSTES_BUREAU; b++) {
    await prisma.affectationPoste.create({
      data: {
        mandatId: mandatActifLatest.id,
        posteId: postes[b].id,
        memberId: membersBureau[b].id,
        statut: 'ACTIF',
        dateDebut: mandatActifLatest.dateDebut,
        dateFin: null,
        raisonInactivation: null,
      },
    });
  }
  console.log(`✅ ${NOMBRE_POSTES_BUREAU} affectations\n`);

  const registreRows = loadRegistrePdfParsedRows();
  console.log(`📋 Import registre PDF (${registreRows.length} lignes) → membres + registre cotisations...`);
  let importCount = 0;
  for (const row of registreRows) {
    const email = `registre-pdf-${row.lignePdf}@import.agcm.local`;
    const situation =
      row.situationText.trim() ||
      '(Pas de détail situation dans l’extrait ; voir PDF ou compléter dans le registre.)';

    const member = await prisma.member.upsert({
      where: { email },
      create: {
        email,
        nom: row.nom.slice(0, 120),
        prenom: row.prenom.slice(0, 120),
        telephone: row.telephone,
        ville: 'La Rochelle',
        pays: 'France',
        statutMembre: 'ACTIF',
        userId: null,
        dateAdhesion: new Date(2024, 0, 1),
      },
      update: {
        nom: row.nom.slice(0, 120),
        prenom: row.prenom.slice(0, 120),
        telephone: row.telephone,
        ville: 'La Rochelle',
        pays: 'France',
      },
    });

    await prisma.memberRegistreCotisation.upsert({
      where: {
        memberId_dateReference: {
          memberId: member.id,
          dateReference: DATE_REGISTRE_PDF,
        },
      },
      create: {
        memberId: member.id,
        dateReference: DATE_REGISTRE_PDF,
        situationText: situation.slice(0, 8000),
        absencesText: null,
      },
      update: {
        situationText: situation.slice(0, 8000),
      },
    });
    importCount++;
  }
  console.log(`✅ ${importCount} adhérents issus du PDF\n`);

  const demoSlug = (prefix: string) =>
    `${prefix}-${randomUUID().replace(/-/g, '').slice(0, 12)}`.toLowerCase();

  console.log(
    '🎯 Démo bureau : contenus / projets / événements par poste (traces)...',
  );
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
        rejectionReason:
          'Exemple seed : merci de préciser les dates et le lieu public.',
      },
    ];

    for (const def of contentDefs) {
      const c = await prisma.content.create({
        data: {
          type: (def.type || 'ACTIVITE') as never,
          titre: def.titre,
          contenu: `Contenu de démonstration pour le poste « ${poste.nom} » (mandat actif).`,
          visibiliteCible: (def.visibilite || 'PUBLIC_SITE') as never,
          statutWorkflow: def.statut as never,
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
    }

    const projetDefs = [
      { statut: 'BROUILLON' as const, visibiliteSite: false, titre: `[Démo bureau] Projet brouillon — ${shortNom}` },
      { statut: 'EN_COURS' as const, visibiliteSite: true, titre: `[Démo bureau] Projet en cours (site) — ${shortNom}` },
      { statut: 'TERMINE' as const, visibiliteSite: true, titre: `[Démo bureau] Projet terminé — ${shortNom}` },
    ];

    for (const pd of projetDefs) {
      await prisma.projet.create({
        data: {
          titre: pd.titre,
          slug: demoSlug(`p-${b}`),
          objectif: `Objectif de démonstration pour ${poste.nom}.`,
          description: `Description seed — projet ${pd.statut.toLowerCase()}.`,
          statut: pd.statut,
          visibiliteSite: pd.visibiliteSite,
          responsablePosteId: poste.id,
          mandatId: mandatActifLatest.id,
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
      await prisma.event.create({
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
    }
  }
  console.log('✅ Démo bureau créée\n');

  console.log('🗣️  Citations présidents...');
  await prisma.presidentCitation.create({
    data: {
      nom: 'Diallo Mamadou',
      message:
        'Notre engagement pour la communauté guinéenne en Charente-Maritime est le moteur de nos actions.',
      debutMandat: new Date('2023-01-01'),
      finMandat: new Date('2025-12-31'),
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
  });
  await prisma.presidentCitation.create({
    data: {
      nom: 'Camara Aboubacar',
      message:
        "L'association m'a accueilli quand je suis arrivé en France. J'ai trouvé une famille.",
      debutMandat: new Date('2020-01-01'),
      finMandat: new Date('2022-12-31'),
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
  });
  console.log('✅ Citations créées\n');

  console.log('📰 Actualités publiées (site)...');
  const realNews = [
    {
      titre: "Grande Assemblée Générale Annuelle de l'AGCM",
      contenu:
        "Nous convions tous nos membres à notre assemblée générale annuelle qui se tiendra ce samedi à 14h. Au programme : bilan des activités de l'année écoulée, présentation des projets futurs et élection du nouveau bureau. Votre présence est capitale pour l'avenir de notre association.",
      type: 'ACTUALITE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      tags: ['AG', 'AGCM', 'Réunion'],
    },
    {
      titre: "Distribution de kits scolaires : Succès de l'opération",
      contenu:
        "Grâce à votre générosité, nous avons pu distribuer plus de 100 kits scolaires aux enfants de la communauté. Un grand merci à tous les donateurs et bénévoles qui ont rendu ce projet possible. L'éducation est notre priorité.",
      type: 'PARTAGE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      tags: ['Éducation', 'Entraide', 'Succès'],
    },
    {
      titre: "Célébration de la Fête de l'Indépendance de la Guinée",
      contenu:
        'Retour en images sur la magnifique célébration du 2 octobre. Une journée riche en couleurs, en musique et en partage gastronomique qui a réuni plus de 300 personnes. Vive la Guinée et vive la solidarité guinéenne en Charente-Maritime !',
      type: 'ACTIVITE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
      tags: ['Culture', 'Guinée', 'Fête'],
    },
    {
      titre: 'Nouveau Partenariat avec la Mairie de La Rochelle',
      contenu:
        "C'est avec fierté que nous annonçons le renforcement de notre partenariat avec la Mairie de La Rochelle. Ce soutien permettra de lancer de nouveaux ateliers d'accompagnement administratif dès le mois prochain.",
      type: 'ANNONCE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      tags: ['Partenariat', 'Institutionnel'],
    },
    {
      titre: 'Atelier Cuisine : Découvrez les Saveurs de la Basse-Guinée',
      contenu:
        'Rejoignez-nous ce week-end pour un atelier de cuisine traditionnelle. Apprenez à cuisiner le fameux riz au poisson et la sauce feuilles. Un moment de convivialité et de découverte culinaire à ne pas manquer.',
      type: 'ACTIVITE' as const,
      imagePrincipale: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      tags: ['Cuisine', 'Atelier', 'Culture'],
    },
    {
      titre: 'Appel aux Bénévoles pour le Forum des Associations',
      contenu:
        "L'AGCM sera présente au prochain Forum des Associations. Nous recherchons des bénévoles pour tenir notre stand et présenter nos activités au grand public. Inscrivez-vous via le formulaire de contact.",
      type: 'ACTUALITE' as const,
      imagePrincipale:
        'https://images.unsplash.com/photo-1559027615-cd9d7a915140?auto=format&fit=crop&w=800&q=80',
      tags: ['Bénévolat', 'Forum', 'Engagement'],
    },
    {
      titre: 'Rentrée associative 2026 : Nouveaux projets à venir',
      contenu:
        "L'AGCM prépare une rentrée riche en activités. Soutien scolaire, cours de français, ateliers culturels et événements festifs sont au programme. Restez connectés pour ne rien manquer !",
      type: 'ACTUALITE' as const,
      imagePrincipale:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
      tags: ['Rentrée', 'Projets', 'AGCM'],
    },
    {
      titre: 'Soirée de solidarité : Bilan et perspectives',
      contenu:
        'La soirée de solidarité du mois dernier a permis de collecter des fonds pour nos projets en Guinée. Merci à tous les participants et bénévoles. Prochaine édition prévue en septembre.',
      type: 'ACTUALITE' as const,
      imagePrincipale:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      tags: ['Solidarité', 'Événement', 'Bilan'],
    },
    {
      titre: 'Formation aux premiers secours : Session réussie',
      contenu:
        'Une vingtaine de membres ont suivi la formation aux premiers secours organisée en partenariat avec la Croix-Rouge. Une compétence précieuse pour notre communauté.',
      type: 'ACTUALITE' as const,
      imagePrincipale:
        'https://images.unsplash.com/photo-1559027615-cd9d7a915140?auto=format&fit=crop&w=800&q=80',
      tags: ['Formation', 'Premiers secours', 'Santé'],
    },
    {
      titre: "Carnaval des cultures : L'AGCM à l'honneur",
      contenu:
        'Notre association a défilé lors du Carnaval des cultures de La Rochelle. Costumes traditionnels, danses et chants ont ravi le public. Une belle vitrine pour la culture guinéenne !',
      type: 'ACTUALITE' as const,
      imagePrincipale:
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
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
  console.log(`✅ ${realNews.length} actualités\n`);

  const postePresident = postes.find((p) => p.nom === 'Président') || postes[0];
  console.log('📅 Événements affichés sur le site...');
  const realEvents = [
    {
      titre: 'Appel aux Bénévoles pour le Forum des Associations',
      slug: 'appel-aux-benevoles-forum-associations',
      description:
        "L'AGCM sera présente au prochain Forum des Associations. Nous recherchons des bénévoles pour tenir notre stand et présenter nos activités au grand public. Inscrivez-vous via le formulaire de contact.",
      dateDebut: new Date('2026-03-15'),
      dateFin: new Date('2026-03-15'),
      lieu: 'La Rochelle',
      imageUrl:
        'https://images.unsplash.com/photo-1559027615-cd9d7a915140?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Assemblée Générale Ordinaire 2026',
      slug: 'assemblee-generale-ordinaire-2026',
      description:
        "Assemblée générale annuelle de l'AGCM : bilan des activités, présentation des projets et élection du bureau.",
      dateDebut: new Date('2026-04-10'),
      dateFin: new Date('2026-04-10'),
      lieu: 'La Rochelle',
      imageUrl:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: "Fête de l'Indépendance de la Guinée",
      slug: 'fete-independance-guinee-2026',
      description:
        'Célébration du 2 octobre : musique, gastronomie et partage culturel.',
      dateDebut: new Date('2026-10-02'),
      dateFin: new Date('2026-10-02'),
      lieu: 'La Rochelle',
      imageUrl:
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Atelier Cuisine Guinéenne',
      slug: 'atelier-cuisine-guineenne-2026',
      description:
        'Découvrez les saveurs de la Guinée : riz au poisson, sauce feuilles et mafé.',
      dateDebut: new Date('2026-05-20'),
      dateFin: new Date('2026-05-20'),
      lieu: 'La Rochelle',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    },
    {
      titre: 'Journée Portes Ouvertes AGCM',
      slug: 'journee-portes-ouvertes-2026',
      description:
        'Venez découvrir nos locaux, nos projets et rencontrer les membres du bureau.',
      dateDebut: new Date('2026-06-14'),
      dateFin: new Date('2026-06-14'),
      lieu: 'La Rochelle',
      imageUrl:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: "Pique-nique de l'été",
      slug: 'pique-nique-ete-2026',
      description:
        'Grand pique-nique familial au parc. Apportez vos plats à partager.',
      dateDebut: new Date('2026-07-20'),
      dateFin: new Date('2026-07-20'),
      lieu: 'La Rochelle',
      imageUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Soirée Solidarité Guinée',
      slug: 'soiree-solidarite-guinee-2026',
      description:
        'Soirée caritative au profit de nos projets éducatifs en Guinée.',
      dateDebut: new Date('2026-09-12'),
      dateFin: new Date('2026-09-12'),
      lieu: 'La Rochelle',
      imageUrl:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Formation aux premiers secours',
      slug: 'formation-premiers-secours-2026',
      description:
        'Session PSC1 en partenariat avec la Croix-Rouge. Places limitées.',
      dateDebut: new Date('2026-08-05'),
      dateFin: new Date('2026-08-06'),
      lieu: 'La Rochelle',
      imageUrl:
        'https://images.unsplash.com/photo-1559027615-cd9d7a915140?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: 'Carnaval des cultures',
      slug: 'carnaval-cultures-2026',
      description:
        "L'AGCM participe au défilé du Carnaval des cultures. Venez en costume traditionnel !",
      dateDebut: new Date('2026-05-01'),
      dateFin: new Date('2026-05-01'),
      lieu: 'La Rochelle',
      imageUrl:
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
    },
    {
      titre: "Réunion d'information nouveaux adhérents",
      slug: 'reunion-info-nouveaux-adherents-2026',
      description:
        "Session d'accueil pour les nouveaux membres : présentation de l'association.",
      dateDebut: new Date('2026-11-15'),
      dateFin: new Date('2026-11-15'),
      lieu: 'La Rochelle',
      imageUrl:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
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
  console.log(`✅ ${realEvents.length} événements publics\n`);

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
  console.log('✅ Site vitrine (SitePublicPage)\n');

  console.log('🖼️ Galerie (images de démo, masquées par défaut sauf les 4 premières)...');
  const galleryItems = SITE_PUBLIC_DEFAULT_PAYLOAD.gallery ?? [];
  for (let i = 0; i < galleryItems.length; i++) {
    const g = galleryItems[i]!;
    await prisma.galerieImage.create({
      data: {
        url: g.url,
        alt: g.alt,
        visibleSite: i < 4,
        ordre: i,
      },
    });
  }
  console.log(`✅ ${galleryItems.length} images galerie\n`);

  console.log('\n📊 Résumé');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const counts = {
    mandats: await prisma.mandat.count(),
    postes: await prisma.poste.count(),
    users: await prisma.user.count(),
    members: await prisma.member.count(),
    registreCotisations: await prisma.memberRegistreCotisation.count(),
    affectations: await prisma.affectationPoste.count(),
    contents: await prisma.content.count(),
    projets: await prisma.projet.count(),
    events: await prisma.event.count(),
    citationsPresident: await prisma.presidentCitation.count(),
    galerieImages: await prisma.galerieImage.count(),
    partners: await prisma.partner.count(),
  };
  Object.entries(counts).forEach(([k, v]) => console.log(`   ${k}: ${v}`));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📝 Comptes bureau — mot de passe : ${BUREAU_SEED_PASSWORD}`);
  BUREAU_SEED_ACCOUNTS.forEach((acc, idx) => {
    const posteNom = BUREAU_EXECUTIF_POSTES[idx]?.nom ?? '?';
    console.log(`   ${posteNom}: ${acc.localPart}@${BUREAU_SEED_DOMAIN} (${acc.roleSysteme})`);
  });
  console.log(
    '\n📎 Adhérents PDF : emails techniques `registre-pdf-{n}@import.agcm.local` (sans compte de connexion).',
  );
  console.log(
    '   Ancien seed massif : npm run seed:legacy-600 — voir prisma/seed.legacy-600-bulk.ts\n',
  );
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
