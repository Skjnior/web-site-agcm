const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findText() {
  console.log("--- CITATIONS PRÉSIDENT ---");
  const citations = await prisma.presidentCitation.findMany();
  console.log(JSON.stringify(citations, null, 2));

  console.log("\n--- CONTENUS RÉCENTS ---");
  const contents = await prisma.content.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(contents, null, 2));

  await prisma.$disconnect();
}

findText();
