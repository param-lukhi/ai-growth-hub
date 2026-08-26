const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetEmail = 'lukhiparam904@gmail.com';
  const newPassword = 'Hanumandada@904';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email: targetEmail },
      update: {
        password: hashedPassword,
        status: 'ACTIVE',
        role: 'ADMIN',
      },
      create: {
        name: 'Param Lukhi',
        email: targetEmail,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('Successfully updated admin user in Prisma DB:', user.email);
  } catch (err) {
    console.error('Prisma update error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
