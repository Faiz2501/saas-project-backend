const bcrypt = require('bcrypt');
const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'Anirban@techgen.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Sayonee@123';

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hash,
      role: Role.SUPER_ADMIN,
    },
    create: {
      email,
      password: hash,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
    },
  });

  console.log('SUPER_ADMIN ready:', {
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });