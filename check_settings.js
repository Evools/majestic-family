const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allSettings = await prisma.systemSettings.findMany();
  console.log('Total Settings Records:', allSettings.length);
  allSettings.forEach((s, i) => {
    console.log(`Record ${i + 1}: ID=${s.id}, notifyNewReports=${s.notifyNewReports}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
