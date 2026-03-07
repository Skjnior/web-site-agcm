import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const affectations = await prisma.affectationPoste.findMany({
    where: { statut: 'ACTIF' }
  });
  console.log("ACTIF Affectations Count:", affectations.length);
  if (affectations.length > 0) {
    console.log("Sample ACTIF mandatId:", affectations[0].mandatId);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
