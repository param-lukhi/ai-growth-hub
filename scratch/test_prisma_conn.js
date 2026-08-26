const fs = require('fs');
const path = require('path');

// Manually load .env into process.env if needed
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function run() {
  console.log('Connecting to Prisma...');
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Raw query succeeded:', result);

    const categories = await prisma.category.findMany({ take: 5 });
    console.log('Found categories count:', categories.length);

    const websites = await prisma.website.findMany({
      include: { agent: true },
      take: 5
    });
    console.log('Found websites count:', websites.length);
    for (const w of websites) {
      console.log('Website:', w.id, w.name, w.slug, 'Agent:', w.agent ? w.agent.agentName : null);
    }
  } catch (err) {
    console.error('Prisma test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
