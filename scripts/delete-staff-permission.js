const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.staffPermission.deleteMany({
    where: {
      userId: 'f7408637-298a-4e5b-bdd7-3816a3abd803',
    },
  });

  console.log('Permission removed');
}

main()
  .finally(() => prisma.$disconnect());