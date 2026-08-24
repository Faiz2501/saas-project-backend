const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.permission.deleteMany({
    where: {
      name: '',
    },
  });

  console.log('Bad permission removed');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });