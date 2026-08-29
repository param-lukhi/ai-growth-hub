async function testHttpEndpoints() {
  const baseUrl = 'http://localhost:3000';
  const cookieHeader = 'admin_session=authenticated_token_secret';

  console.log('=== TESTING HTTP API ENDPOINTS FOR WEBSITES ===\n');

  try {
    // 1. Test Unauthorized GET
    console.log('[HTTP TEST 1] Testing Unauthorized GET /api/saas/websites...');
    const unauthRes = await fetch(`${baseUrl}/api/saas/websites`);
    const unauthJson = await unauthRes.json();
    console.log(`✓ Status: ${unauthRes.status}, Body:`, unauthJson);
    if (unauthRes.status !== 401 || unauthJson.success !== false) {
      throw new Error('Expected 401 Unauthorized for request without session cookie');
    }

    // 2. Test Authenticated GET
    console.log('\n[HTTP TEST 2] Testing Authenticated GET /api/saas/websites...');
    const authGetRes = await fetch(`${baseUrl}/api/saas/websites`, {
      headers: { Cookie: cookieHeader }
    });
    const authGetJson = await authGetRes.json();
    console.log(`✓ Status: ${authGetRes.status}, Found: ${authGetJson.websites?.length} websites.`);
    if (!authGetRes.ok || !authGetJson.success) {
      throw new Error(`Authenticated GET failed: ${JSON.stringify(authGetJson)}`);
    }

    // 3. Test Authenticated POST
    console.log('\n[HTTP TEST 3] Testing Authenticated POST /api/saas/websites (Create)...');
    const siteName = `API Test Website ${Date.now()}`;
    const createRes = await fetch(`${baseUrl}/api/saas/websites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader
      },
      body: JSON.stringify({
        name: siteName,
        domainUrl: 'https://apitest.example.com',
        niche: 'Finance',
        subNiche: 'Credit Cards & Personal Finance',
        targetCountry: 'India',
        targetLanguage: 'English',
        targetAudience: 'Working professionals in India',
        brandVoice: 'Clear, trustworthy, analytical',
        contentStyle: 'In-depth credit card comparisons',
        publishingFrequency: '3_PER_WEEK',
        approvalMode: 'MANUAL'
      })
    });
    const createJson = await createRes.json();
    console.log(`✓ Status: ${createRes.status}, Response:`, {
      success: createJson.success,
      id: createJson.website?.id,
      name: createJson.website?.name,
      topicsCount: createJson.growthReport?.topics?.length
    });
    if (!createRes.ok || !createJson.success || !createJson.website?.id) {
      throw new Error(`Authenticated POST failed: ${JSON.stringify(createJson)}`);
    }

    const createdId = createJson.website.id;

    // 4. Test Authenticated PUT (Update)
    console.log(`\n[HTTP TEST 4] Testing Authenticated PUT /api/saas/websites/${createdId}...`);
    const updateRes = await fetch(`${baseUrl}/api/saas/websites/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader
      },
      body: JSON.stringify({
        name: `${siteName} (Updated via API)`,
        status: 'PAUSED',
        approvalMode: 'SEMI_AUTOMATIC'
      })
    });
    const updateJson = await updateRes.json();
    console.log(`✓ Status: ${updateRes.status}, Updated name:`, updateJson.website?.name, 'status:', updateJson.website?.status);
    if (!updateRes.ok || !updateJson.success || updateJson.website?.status !== 'PAUSED') {
      throw new Error(`Authenticated PUT failed: ${JSON.stringify(updateJson)}`);
    }

    // 5. Test Authenticated DELETE
    console.log(`\n[HTTP TEST 5] Testing Authenticated DELETE /api/saas/websites/${createdId}...`);
    const deleteRes = await fetch(`${baseUrl}/api/saas/websites/${createdId}`, {
      method: 'DELETE',
      headers: { Cookie: cookieHeader }
    });
    const deleteJson = await deleteRes.json();
    console.log(`✓ Status: ${deleteRes.status}, Response:`, deleteJson);
    if (!deleteRes.ok || !deleteJson.success) {
      throw new Error(`Authenticated DELETE failed: ${JSON.stringify(deleteJson)}`);
    }

    // 6. Verify Deletion with GET by ID (should 404)
    console.log(`\n[HTTP TEST 6] Verifying deletion via GET /api/saas/websites/${createdId}...`);
    const verifyRes = await fetch(`${baseUrl}/api/saas/websites/${createdId}`, {
      headers: { Cookie: cookieHeader }
    });
    console.log(`✓ Status: ${verifyRes.status} (Expected 404)`);
    if (verifyRes.status !== 404) {
      throw new Error(`Expected 404 for deleted website, got ${verifyRes.status}`);
    }

    console.log('\n=== ALL HTTP API ENDPOINT TESTS PASSED SUCCESSFULLY! ===\n');
  } catch (err) {
    console.error('❌ HTTP TEST FAILED:', err);
    process.exit(1);
  }
}

testHttpEndpoints();
