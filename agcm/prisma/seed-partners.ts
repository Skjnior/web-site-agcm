/**
 * Ajoute 5 partenaires visibles sur le site (nom + logo).
 * Usage : npm run db:seed-partners
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PARTNERS = [
  { nom: 'Mairie de La Rochelle', logo: '/partners/mairie-la-rochelle.svg' },
  { nom: 'Croix-Rouge française', logo: '/partners/croix-rouge.svg' },
  { nom: 'Université de La Rochelle', logo: '/partners/universite-la-rochelle.svg' },
  { nom: 'Association Guinée-France', logo: '/partners/association-guinee-france.svg' },
  { nom: 'Entreprises solidaires 17', logo: '/partners/entreprise-solidaire.svg' },
] as const;

async function main() {
  console.log('🤝 Partenaires site public…\n');

  for (const p of PARTNERS) {
    const existing = await prisma.partner.findFirst({
      where: { nom: p.nom },
    });

    if (existing) {
      await prisma.partner.update({
        where: { id: existing.id },
        data: {
          logo: p.logo,
          visibiliteSite: true,
          statut: 'ACTIF',
        },
      });
      console.log(`   ↻ Mis à jour : ${p.nom}`);
    } else {
      await prisma.partner.create({
        data: {
          nom: p.nom,
          logo: p.logo,
          visibiliteSite: true,
          statut: 'ACTIF',
        },
      });
      console.log(`   ✓ Créé : ${p.nom}`);
    }
  }

  const visible = await prisma.partner.count({
    where: { visibiliteSite: true, statut: 'ACTIF' },
  });
  console.log(`\n✅ ${visible} partenaire(s) visible(s) sur le site.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
