const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mandatId = "cmmgs6rdi0000jivkx8mbwxlj";
  const auteurPosteId = "cmmgs6rq200gojivkxidm1lmj";

  const news = [
    {
      type: 'ACTUALITE',
      titre: 'Succès de la Conférence sur les Droits et Devoirs',
      contenu: '<p>L’AGCM a organisé le 11 avril 2026 une conférence majeure portant sur les droits et devoirs des citoyens. Cet événement a réuni de nombreux membres de la communauté guinéenne de La Rochelle.</p><p>Les échanges ont été riches et ont permis de clarifier de nombreux points sur l’intégration et la vie associative. Merci à tous les intervenants et participants pour leur engagement !</p>',
      visibiliteCible: 'PUBLIC_SITE',
      statutWorkflow: 'PUBLIE',
      mandatId,
      auteurPosteId,
      createdAt: new Date('2026-04-11T14:00:00Z')
    },
    {
      type: 'ACTUALITE',
      titre: 'Retour sur l’Assemblée Générale Ordinaire 2026',
      contenu: '<p>Le dimanche 21 avril 2026, l’association a tenu son Assemblée Générale Ordinaire à la Salle du Prieuré à La Rochelle.</p><p>À l’ordre du jour : présentation des rapports d’activité et financier, ainsi que l’élection du nouveau bureau. Nous sommes heureux d’annoncer la reconduction de Mr. Alhassane Diallo à la présidence pour continuer le travail entamé.</p>',
      visibiliteCible: 'PUBLIC_SITE',
      statutWorkflow: 'PUBLIE',
      mandatId,
      auteurPosteId,
      createdAt: new Date('2026-04-21T10:00:00Z')
    },
    {
      type: 'ACTUALITE',
      titre: 'Vœux de Ramadan 2026',
      contenu: '<p>L’Association des Guinéens de La Charente-Maritime souhaite un excellent mois de Ramadan à toute la communauté musulmane.</p><p>Que ce mois de piété soit synonyme de solidarité, de partage et de paix pour tous nos membres et leurs familles.</p>',
      visibiliteCible: 'PUBLIC_SITE',
      statutWorkflow: 'PUBLIE',
      mandatId,
      auteurPosteId,
      createdAt: new Date('2026-03-10T08:00:00Z')
    }
  ];

  for (const item of news) {
    await prisma.content.create({
      data: item
    });
  }

  console.log('3 actualités Facebook insérées avec succès.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
