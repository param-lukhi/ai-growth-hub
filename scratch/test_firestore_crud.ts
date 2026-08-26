import { firestoreDb } from '../lib/db';

async function testFirestoreCrud() {
  console.log('--- Testing Cloud Firestore CRUD Abstraction Layer ---');

  // 1. Create Website
  const testWebsite = await firestoreDb.website.create({
    data: {
      name: 'Firestore Verification Site',
      domain: 'https://firestore-verification-test.com',
      slug: 'firestore-test-site-' + Date.now(),
      niche: 'AI Tech',
      ownerId: 'test-user-123',
      targetLanguage: 'EN',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Created Website in Firestore:', testWebsite.id, testWebsite.name);

  // 2. Create Agent attached to Website
  const testAgent = await firestoreDb.websiteAgent.create({
    data: {
      name: 'Verification Agent',
      websiteId: testWebsite.id,
      agentType: 'CONTENT_CREATOR',
      status: 'ACTIVE',
      mode: 'AUTONOMOUS'
    }
  });

  console.log('✅ Created Agent in Firestore:', testAgent.id, testAgent.name);

  // 3. Query Website with included relations
  const fetchedWebsite = await firestoreDb.website.findUnique({
    where: { id: testWebsite.id },
    include: { agent: true }
  });

  console.log('✅ Fetched Website with Agent relation:', fetchedWebsite?.name, '| Agent:', fetchedWebsite?.agent?.name);

  // 4. Update Website
  const updatedWebsite = await firestoreDb.website.update({
    where: { id: testWebsite.id },
    data: { name: 'Updated Verification Site' }
  });

  console.log('✅ Updated Website Name:', updatedWebsite.name);

  // 5. Count Websites
  const count = await firestoreDb.website.count({
    where: { status: 'ACTIVE' }
  });

  console.log('✅ Active Websites Count:', count);

  // 6. Clean up test documents
  await firestoreDb.websiteAgent.delete({ where: { id: testAgent.id } });
  await firestoreDb.website.delete({ where: { id: testWebsite.id } });

  console.log('✅ Test documents cleaned up successfully!');
}

testFirestoreCrud().catch(console.error);
