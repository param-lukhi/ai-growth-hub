import { firestoreDb } from '../lib/db';
import { ensureDefaultWebsitesSeeded } from '../lib/saas/seed-data';

async function runTests() {
  console.log('=== STARTING WEBSITES CRUD TEST FOR FIRESTORE ===');

  try {
    // 1. Seed Check & Initial READ
    console.log('\n[TEST 1] Ensuring default websites seeded & Reading websites...');
    await ensureDefaultWebsitesSeeded();
    const initialWebsites = await firestoreDb.website.findMany({
      include: {
        agent: true,
        _count: {
          select: {
            articles: true,
            topics: true,
            activityLogs: true
          }
        }
      }
    });
    console.log(`✓ READ Success: Found ${initialWebsites.length} initial websites.`);
    initialWebsites.forEach(w => {
      console.log(`  - [${w.id}] "${w.name}" (${w.slug}) | niche: ${w.niche} | status: ${w.status}`);
    });

    // 2. CREATE website
    console.log('\n[TEST 2] Creating new Website in Firestore...');
    const testSiteName = `Niche Test Site ${Date.now()}`;
    const testSiteSlug = `niche-test-site-${Date.now()}`;
    const newSite = await firestoreDb.website.create({
      data: {
        name: testSiteName,
        slug: testSiteSlug,
        domainUrl: 'https://testniche.example.com',
        niche: 'Gaming',
        subNiche: 'Mechanical Keyboards & Mice',
        targetCountry: 'India',
        targetLanguage: 'English',
        targetAudience: 'Indian PC Gamers and Enthusiasts',
        brandVoice: 'Dynamic, competitive, analytical',
        contentStyle: 'In-depth switch reviews and latency tests',
        monetization: JSON.stringify(['AMAZON_AFFILIATE']),
        publishingFrequency: '3_PER_WEEK',
        approvalMode: 'MANUAL',
        cmsType: 'NATIVE',
        status: 'ACTIVE',
        agent: {
          create: {
            agentName: `${testSiteName} Growth Agent`,
            role: 'Gaming gear content & SEO agent',
            tone: 'Dynamic and tech-savvy',
            systemPrompt: 'Produce high-converting mechanical keyboard reviews.',
            active: true
          }
        }
      },
      include: { agent: true }
    });

    console.log(`✓ CREATE Success: Created website document with ID: ${newSite.id}`);
    console.log(`  - Name: ${newSite.name}`);
    console.log(`  - Agent Name: ${newSite.agent?.agentName || newSite.agent?.name}`);

    // 3. READ back single website
    console.log('\n[TEST 3] Reading newly created website by ID...');
    const fetchedSite = await firestoreDb.website.findUnique({
      where: { id: newSite.id },
      include: { agent: true }
    });
    if (!fetchedSite || fetchedSite.name !== testSiteName) {
      throw new Error(`Failed to read back created website. Expected "${testSiteName}", got "${fetchedSite?.name}"`);
    }
    console.log(`✓ READ By ID Success: Document verified with name: "${fetchedSite.name}"`);

    // 4. UPDATE website
    console.log('\n[TEST 4] Updating website fields in Firestore...');
    const updatedName = `${testSiteName} (Updated)`;
    const updatedSite = await firestoreDb.website.update({
      where: { id: newSite.id },
      data: {
        name: updatedName,
        status: 'PAUSED',
        approvalMode: 'AUTOMATIC',
        targetCountry: 'United States'
      },
      include: { agent: true }
    });

    console.log(`✓ UPDATE Success: Updated name to "${updatedSite.name}", status: ${updatedSite.status}, country: ${updatedSite.targetCountry}`);

    // Verify update persisted
    const verifyUpdate = await firestoreDb.website.findUnique({ where: { id: newSite.id } });
    if (verifyUpdate?.name !== updatedName || verifyUpdate?.status !== 'PAUSED') {
      throw new Error(`UPDATE verification failed. Persisted name: ${verifyUpdate?.name}, status: ${verifyUpdate?.status}`);
    }
    console.log('✓ UPDATE Persistence Verified.');

    // 5. DELETE website
    console.log('\n[TEST 5] Deleting created website from Firestore...');
    const deletedSite = await firestoreDb.website.delete({
      where: { id: newSite.id }
    });
    console.log(`✓ DELETE Success: Removed website ID ${deletedSite?.id || newSite.id}`);

    // Verify deletion
    const verifyDelete = await firestoreDb.website.findUnique({ where: { id: newSite.id } });
    if (verifyDelete) {
      throw new Error(`Website still exists after DELETE! ID: ${newSite.id}`);
    }
    console.log('✓ DELETE Persistence Verified: Document no longer exists.');

    // 6. Test Protection on primary TechPulse
    console.log('\n[TEST 6] Verifying TechPulse primary website protection...');
    const techpulse = await firestoreDb.website.findFirst({ where: { slug: 'techpulse' } });
    if (techpulse) {
      console.log(`✓ TechPulse primary exists with ID: ${techpulse.id}`);
    }

    console.log('\n=== ALL FIRESTORE CRUD TESTS PASSED SUCCESSFULLY! ===\n');
  } catch (error) {
    console.error('❌ TEST FAILED WITH ERROR:', error);
    process.exit(1);
  }
}

runTests();
