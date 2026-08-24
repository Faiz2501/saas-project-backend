const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const permissions = await prisma.permission.findMany();

  console.log(permissions);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });