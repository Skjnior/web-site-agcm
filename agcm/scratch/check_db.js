
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.pageView.count();
    console.log('Count:', count);
    const stats = await prisma.pageView.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    });
    console.log('Stats:', stats);
    const uniqueIPs = await prisma.pageView.findMany({
      where: {},
      select: { ipAddress: true },
      distinct: ['ipAddress'],
    });
    console.log('Unique IPs:', uniqueIPs.length);
    const views = await prisma.pageView.findMany({ take: 5 });
    console.log('Views:', views);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
