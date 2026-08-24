const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    'MANAGE_PRICING',
    'MANAGE_STAFF',
    'VIEW_USERS',
    'VIEW_TRANSACTIONS',
    'VIEW_SUPPORT',
    'MANAGE_API_KEYS',
    'REFUND_WALLET',
    'VIEW_VERIFICATIONS',
  ];

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Permissions created successfully');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });