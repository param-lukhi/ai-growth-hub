import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setAdminPassword() {
  const newPassword = process.argv[2] || process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const targetEmail = process.env.ADMIN_EMAIL || 'lukhiparam904@gmail.com';

  if (!newPassword || newPassword.trim().length < 6) {
    console.error('Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  console.log(`Updating admin password for: ${targetEmail}...`);
  const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

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

  console.log(`Success! Admin user (${user.email}) password has been updated and securely hashed.`);
}

setAdminPassword()
  .catch((err) => {
    console.error('Failed to set admin password:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
