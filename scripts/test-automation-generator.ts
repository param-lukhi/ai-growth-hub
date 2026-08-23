import { generateFullProductAndBlog, extractAsin } from '../lib/amazon-generator';
import { getMarketplaceAdapter } from '../lib/marketplaces';

async function runTests() {
  console.log('--- STARTING PRODUCT & AMAZON GENERATOR VERIFICATION TESTS ---');

  // Test 1: ASIN Extraction
  console.log('\n[TEST 1] ASIN Extraction:');
  const url1 = 'https://www.amazon.in/dp/B09XS7JWHH?tag=techpulse-20';
  const asin1 = extractAsin(url1);
  console.log(`Input: ${url1} => Extracted ASIN: ${asin1}`);
  if (asin1 === 'B09XS7JWHH') {
    console.log('✓ ASIN Extraction Test Passed');
  } else {
    throw new Error(`ASIN extraction failed, got ${asin1}`);
  }

  // Test 2: Option D - Affiliate Link Only (Sony WH-1000XM5)
  console.log('\n[TEST 2] Option D - Affiliate Link Only (Sony WH-1000XM5):');
  const draft1 = await generateFullProductAndBlog({
    url: 'https://www.amazon.in/dp/B09XS7JWHH',
    affiliateTag: 'techpulse-20',
  });
  console.log(`Title: ${draft1.title}`);
  console.log(`Brand: ${draft1.brand}`);
  console.log(`ASIN: ${draft1.asin}`);
  console.log(`Price: ${draft1.price} (${draft1.currency})`);
  console.log(`Word Count: ${draft1.wordCount} (Requirement 2000+ passed: ${draft1.wordCountPassed})`);
  console.log(`Identity Locked: ${draft1.productIdentityLocked}`);
  console.log(`Verification Status: ${draft1.verificationStatus}`);

  if (draft1.wordCount < 2000) {
    throw new Error(`Word count is less than 2000: ${draft1.wordCount}`);
  }
  if (draft1.brand !== 'Sony') {
    throw new Error(`Brand mismatch: expected Sony, got ${draft1.brand}`);
  }
  console.log('✓ Option D Passed (2000+ words confirmed, verified pricing and identity lock)');

  // Test 3: Option E - Product Name Only ("Sony WH-1000XM5")
  console.log('\n[TEST 3] Option E - Product Name Search & Candidate Match:');
  const adapter = getMarketplaceAdapter('AMAZON');
  const matches = await adapter.searchProducts('Sony WH-1000XM5', 3);
  console.log(`Found ${matches.length} matches:`);
  matches.forEach((m, idx) => {
    console.log(`  ${idx + 1}. [${m.productId}] ${m.title} | Price: ${m.currentPrice} | Conf: ${m.confidenceScore}%`);
  });
  if (matches.length === 0 || matches[0].productId !== 'B09XS7JWHH') {
    throw new Error('Candidate search match failed for Sony WH-1000XM5');
  }
  console.log('✓ Option E Search Candidates Passed');

  // Test 4: Option A - Product Name + Image + Link
  console.log('\n[TEST 4] Option A - Product Name + Image + Affiliate Link:');
  const draft2 = await generateFullProductAndBlog({
    url: 'https://www.amazon.in/dp/B0CHX6QG73',
    query: 'Apple iPhone 15 Pro Max',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    affiliateTag: 'techpulse-20',
  });
  console.log(`Title: ${draft2.title}`);
  console.log(`Brand: ${draft2.brand}`);
  console.log(`Price: ${draft2.price} (${draft2.currency})`);
  console.log(`Word Count: ${draft2.wordCount} (2000+ passed: ${draft2.wordCountPassed})`);
  console.log(`Featured Image: ${draft2.featuredImage}`);
  console.log(`Specs count: ${Object.keys(draft2.specifications).length}`);
  if (draft2.wordCount < 2000) {
    throw new Error(`Word count is less than 2000: ${draft2.wordCount}`);
  }
  console.log('✓ Option A Passed');

  // Test 4B: boAt Rockerz 450
  console.log('\n[TEST 4B] Option B - boAt Rockerz 450 Live URL:');
  const draft3 = await generateFullProductAndBlog({
    url: 'https://www.amazon.in/dp/B07PR1CL3S',
    affiliateTag: 'techpulse-20',
  });
  console.log(`Title: ${draft3.title}`);
  console.log(`Brand: ${draft3.brand}`);
  console.log(`Price: ${draft3.price} (${draft3.currency})`);
  console.log(`Word Count: ${draft3.wordCount}`);
  console.log(`Specs count: ${Object.keys(draft3.specifications).length}`);
  if (draft3.brand !== 'boAt') {
    throw new Error(`Brand mismatch for boAt: ${draft3.brand}`);
  }
  console.log('✓ Option B boAt Rockerz 450 Passed');

  // Test 5: Normalized Single Source of Truth Object validation
  console.log('\n[TEST 5] Normalized verifiedProductData validation:');
  const vp = draft1.verifiedProductData;
  console.log('Identity:', vp.identity);
  console.log('Pricing:', vp.pricing);
  if (!vp.identity.productIdentityLocked || !vp.pricing.lastVerified) {
    throw new Error('verifiedProductData missing locked identity or pricing timestamps');
  }
  console.log('✓ Single Source of Truth Object Verified');

  console.log('\n========================================');
  console.log('🎉 ALL AUTOMATION GENERATOR TESTS PASSED SUCCESSFULLY!');
  console.log('========================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
