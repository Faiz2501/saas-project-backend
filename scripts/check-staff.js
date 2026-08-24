const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const staff = await prisma.user.findMany({
    where: {
      role: 'STAFF',
    },
  });

  console.log(staff);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });