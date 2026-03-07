// prisma/seed-citations.ts
// Script pour ajouter des citations de présidents

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const citations = [
  {
    citation: "L'association m'a accueilli quand je suis arrivé en France. J'ai trouvé une famille.",
    ordre: 1,
  },
  {
    citation: "Ensemble, nous construisons un pont entre la Guinée et la Charente-Maritime. Chaque projet est une victoire pour notre communauté.",
    ordre: 2,
  },
  {
    citation: "Notre force réside dans notre unité. L'AGCM est bien plus qu'une association, c'est un foyer pour tous les Guinéens de la région.",
    ordre: 3,
  },
  {
    citation: "Chaque membre qui rejoint l'association enrichit notre communauté. Nous grandissons ensemble, nous réussissons ensemble.",
    ordre: 4,
  },
  {
    citation: "Les projets que nous menons en Guinée et en France montrent que la solidarité n'a pas de frontières. C'est notre fierté.",
    ordre: 5,
  },
  {
    citation: "L'AGCM est un espace où la culture guinéenne s'épanouit en France. Nous préservons nos traditions tout en nous intégrant.",
    ordre: 6,
  },
  {
    citation: "Voir les jeunes s'épanouir grâce à nos actions, c'est la plus belle récompense. L'avenir de notre communauté est prometteur.",
    ordre: 7,
  },
  {
    citation: "Notre association est un exemple de ce que peut accomplir une communauté unie. Ensemble, nous sommes plus forts.",
    ordre: 8,
  },
];

async function main() {
  console.log('🌱 Ajout de citations de présidents...\n');

  try {
    // Récupérer les mandats
    const mandats = await prisma.mandat.findMany({
      orderBy: { dateDebut: 'desc' },
      take: 10, // Prendre les 10 derniers mandats
    });

    if (mandats.length === 0) {
      console.log('❌ Aucun mandat trouvé. Veuillez d\'abord exécuter le seed principal.');
      return;
    }

    // Récupérer le poste "Président"
    let postePresident = await prisma.poste.findFirst({
      where: { nom: 'Président' },
    });

    if (!postePresident) {
      console.log('📝 Création du poste "Président"...');
      postePresident = await prisma.poste.create({
        data: {
          nom: 'Président',
          description: 'Président de l\'association',
          estBureau: true,
          estActif: true,
        },
      });
    }

    // Récupérer les membres qui sont présidents (ou en créer)
    const affectationsPresident = await prisma.affectationPoste.findMany({
      where: {
        posteId: postePresident.id,
        statut: 'ACTIF',
      },
      include: {
        member: true,
        mandat: true,
      },
      take: 10,
    });

    if (affectationsPresident.length === 0) {
      console.log('⚠️  Aucune affectation président trouvée. Création de membres présidents...');
      
      // Créer quelques membres présidents pour les citations
      const hashedPassword = await require('bcryptjs').hash('password123', 10);
      
      for (let i = 0; i < Math.min(citations.length, mandats.length); i++) {
        const mandat = mandats[i];
        
        // Créer un utilisateur
        const user = await prisma.user.create({
          data: {
            email: `president${i + 1}@agcm.gn`,
            passwordHash: hashedPassword,
            roleSysteme: 'ADMIN',
            isActive: true,
          },
        });

        // Créer le membre
        const member = await prisma.member.create({
          data: {
            userId: user.id,
            prenom: ['Alpha', 'Mamadou', 'Ibrahima', 'Ousmane', 'Boubacar', 'Sekou', 'Amadou', 'Mohamed'][i % 8],
            nom: ['Diallo', 'Bah', 'Camara', 'Touré', 'Barry', 'Keita', 'Sow', 'Cissé'][i % 8],
            statutMembre: 'ACTIF',
          },
        });

        // Créer l'affectation
        await prisma.affectationPoste.create({
          data: {
            mandatId: mandat.id,
            posteId: postePresident.id,
            memberId: member.id,
            statut: 'ACTIF',
            dateDebut: mandat.dateDebut,
            dateFin: mandat.dateFin,
          },
        });

        // Créer la citation
        await prisma.presidentCitation.create({
          data: {
            citation: citations[i].citation,
            presidentId: member.id,
            mandatId: mandat.id,
            ordre: citations[i].ordre,
            isPublished: true,
          },
        });

        console.log(`✅ Citation ${i + 1}/${citations.length} créée pour ${member.prenom} ${member.nom}`);
      }
    } else {
      // Utiliser les affectations existantes
      console.log(`📋 Utilisation de ${affectationsPresident.length} affectations président existantes...`);
      
      for (let i = 0; i < Math.min(citations.length, affectationsPresident.length); i++) {
        const affectation = affectationsPresident[i];
        
        // Vérifier si la citation existe déjà
        const existing = await prisma.presidentCitation.findFirst({
          where: {
            presidentId: affectation.memberId,
            mandatId: affectation.mandatId,
          },
        });

        if (!existing) {
          await prisma.presidentCitation.create({
            data: {
              citation: citations[i].citation,
              presidentId: affectation.memberId,
              mandatId: affectation.mandatId,
              ordre: citations[i].ordre,
              isPublished: true,
            },
          });
          console.log(`✅ Citation ${i + 1} créée pour ${affectation.member.prenom} ${affectation.member.nom}`);
        } else {
          console.log(`⏭️  Citation déjà existante pour ${affectation.member.prenom} ${affectation.member.nom}`);
        }
      }
    }

    // Compter les citations créées
    const count = await prisma.presidentCitation.count({
      where: { isPublished: true },
    });

    console.log(`\n✅ ${count} citations de présidents disponibles dans la base de données`);
    console.log('\n🎉 Seed des citations terminé !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des citations:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


