import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const mandatActifLatest = await prisma.mandat.findFirst({
    where: { statut: 'ACTIF' },
    orderBy: { dateDebut: 'desc' }
  });
  console.log("Latest Mandat:", mandatActifLatest);
  if (mandatActifLatest) {
    const affectations = await prisma.affectationPoste.findMany({
      where: { mandatId: mandatActifLatest.id }
    });
    console.log("Affectations Count:", affectations.length);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
