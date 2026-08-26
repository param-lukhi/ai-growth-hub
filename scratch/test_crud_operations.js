const fs = require('fs');

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
const prisma = new PrismaClient();

async function testOperations() {
  console.log('=== 1. Testing prisma.website.findUnique() ===');
  const existing = await prisma.website.findFirst({
    include: { agent: true }
  });
  console.log('Existing website:', existing ? existing.name : 'None');

  if (existing) {
    const uniqueTest = await prisma.website.findUnique({
      where: { id: existing.id },
      include: { agent: true, articles: true, topics: true }
    });
    console.log('findUnique success:', uniqueTest ? uniqueTest.name : 'Failed');
  }

  console.log('\n=== 2. Testing Create Website + Agent ===');
  const testSlug = `test-site-${Date.now()}`;
  const createdWebsite = await prisma.website.create({
    data: {
      name: 'Test Automation Site',
      slug: testSlug,
      domainUrl: 'https://test-automation-site.com',
      niche: 'AI Tools',
      subNiche: 'Generative AI',
      targetCountry: 'Global',
      targetLanguage: 'English',
      status: 'ACTIVE',
      agent: {
        create: {
          agentName: 'Test AI Agent',
          role: 'Content Growth Agent',
          tone: 'Professional and Analytical',
          active: true
        }
      }
    },
    include: { agent: true }
  });

  console.log('Created Website ID:', createdWebsite.id);
  console.log('Created Website Agent:', createdWebsite.agent?.agentName);

  console.log('\n=== 3. Testing Save / Update Website + Agent ===');
  const updatedWebsite = await prisma.website.update({
    where: { id: createdWebsite.id },
    data: {
      name: 'Updated Automation Site',
      agent: {
        update: {
          tone: 'Conversational, In-depth and Engaging'
        }
      }
    },
    include: { agent: true }
  });
  console.log('Updated Name:', updatedWebsite.name);
  console.log('Updated Tone:', updatedWebsite.agent?.tone);

  console.log('\n=== 4. Testing Load Website + Agent ===');
  const loadedWebsite = await prisma.website.findUnique({
    where: { id: createdWebsite.id },
    include: { agent: true }
  });
  console.log('Loaded successfully:', loadedWebsite?.id === createdWebsite.id);

  console.log('\n=== 5. Cleaning up test record ===');
  await prisma.website.delete({
    where: { id: createdWebsite.id }
  });
  console.log('Cleaned up test website.');
}

testOperations()
  .then(() => console.log('\nALL CRUD TESTS PASSED SUCCESSFULLY!'))
  .catch(err => console.error('CRUD Test Failed:', err))
  .finally(async () => await prisma.$disconnect());
