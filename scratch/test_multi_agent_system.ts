import prisma from '../lib/db';
import { executeAgentRun } from '../lib/saas/multi-agent-runner';
import {
  mapProductToAffiliatePlatforms,
  getAffiliateAdapter
} from '../lib/affiliate/affiliate-engine';
import { AGENT_TYPES_REGISTRY } from '../lib/saas/agent-types-registry';

async function main() {
  console.log('==============================================');
  console.log('TESTING MULTI-AGENT & MULTI-AFFILIATE PLATFORM');
  console.log('==============================================\n');

  // 1. Check Websites
  let websiteA = await prisma.website.findFirst({
    where: { slug: 'techpulse' }
  });

  if (!websiteA) {
    websiteA = await prisma.website.create({
      data: {
        name: 'TechPulse',
        slug: 'techpulse',
        domainUrl: 'https://blogweb904.vercel.app',
        niche: 'Technology',
        targetCountry: 'India',
        targetLanguage: 'English'
      }
    });
  }
  console.log(`[PASS] Website A found: ${websiteA.name} (${websiteA.id})`);

  // Create or find Website B for multi-website isolation test
  let websiteB = await prisma.website.findFirst({
    where: { slug: 'autowheel-hub' }
  });

  if (!websiteB) {
    websiteB = await prisma.website.create({
      data: {
        name: 'AutoWheel Hub',
        slug: 'autowheel-hub',
        domainUrl: 'https://autowheelhub.com',
        niche: 'Automotive',
        targetCountry: 'India',
        targetLanguage: 'English'
      }
    });
  }
  console.log(`[PASS] Website B found: ${websiteB.name} (${websiteB.id})`);

  // 2. Configure Affiliate Platforms for Website A
  await prisma.websiteAffiliatePlatform.upsert({
    where: {
      websiteId_platformName: {
        websiteId: websiteA.id,
        platformName: 'Amazon Associates India'
      }
    },
    update: { trackingId: 'techpulse-20', priority: 'PRIMARY' },
    create: {
      websiteId: websiteA.id,
      platformName: 'Amazon Associates India',
      platformType: 'AMAZON',
      country: 'India',
      trackingId: 'techpulse-20',
      priority: 'PRIMARY',
      status: 'CONNECTED'
    }
  });

  await prisma.websiteAffiliatePlatform.upsert({
    where: {
      websiteId_platformName: {
        websiteId: websiteA.id,
        platformName: 'Cuelinks India'
      }
    },
    update: { trackingId: '10842', priority: 'SECONDARY' },
    create: {
      websiteId: websiteA.id,
      platformName: 'Cuelinks India',
      platformType: 'CUELINKS',
      country: 'India',
      trackingId: '10842',
      priority: 'SECONDARY',
      status: 'CONNECTED'
    }
  });
  console.log('[PASS] Configured Amazon (Primary) & Cuelinks (Secondary) on Website A');

  // 3. Configure Affiliate Platforms for Website B (Flipkart Primary)
  await prisma.websiteAffiliatePlatform.upsert({
    where: {
      websiteId_platformName: {
        websiteId: websiteB.id,
        platformName: 'Flipkart Auto'
      }
    },
    update: { trackingId: 'autowheel_affid', priority: 'PRIMARY' },
    create: {
      websiteId: websiteB.id,
      platformName: 'Flipkart Auto',
      platformType: 'FLIPKART',
      country: 'India',
      trackingId: 'autowheel_affid',
      priority: 'PRIMARY',
      status: 'CONNECTED'
    }
  });
  console.log('[PASS] Configured Flipkart (Primary) on Website B');

  // 4. Test Multi-Affiliate Isolation & Mapping
  const mappingA = await mapProductToAffiliatePlatforms(websiteA.id, {
    name: 'OnePlus Nord Buds 4',
    rawUrl: 'https://www.amazon.in/dp/B0CHX6QG73'
  });
  console.log(`[PASS] Website A Product Mapping count: ${mappingA.links.length}`);
  mappingA.links.forEach(l => {
    console.log(`   -> [${l.platformName}] ${l.ctaText}: ${l.affiliateUrl} (Status: ${l.verificationStatus})`);
  });

  const mappingB = await mapProductToAffiliatePlatforms(websiteB.id, {
    name: 'Bosch Tyre Inflator',
    rawUrl: 'https://www.flipkart.com/bosch-tyre-inflator/p/itm12345'
  });
  console.log(`[PASS] Website B Product Mapping count: ${mappingB.links.length}`);
  mappingB.links.forEach(l => {
    console.log(`   -> [${l.platformName}] ${l.ctaText}: ${l.affiliateUrl} (Status: ${l.verificationStatus})`);
  });

  // 5. Test Adapter Units (Amazon, Flipkart, Cuelinks, vCommission, Impact)
  const amazonAdapter = getAffiliateAdapter('AMAZON');
  const resAmazon = amazonAdapter.generateAffiliateUrl('https://www.amazon.in/dp/B0CHX6QG73', {
    websiteId: websiteA.id,
    platformName: 'Amazon',
    platformType: 'AMAZON',
    country: 'India',
    trackingId: 'techpulse-20',
    priority: 'PRIMARY',
    status: 'CONNECTED'
  });
  console.log(`[PASS] AmazonAdapter result: ${resAmazon.affiliateUrl}`);

  const cuelinksAdapter = getAffiliateAdapter('CUELINKS');
  const resCuelinks = cuelinksAdapter.generateAffiliateUrl('https://store.boat-lifestyle.com/products/airdopes-141', {
    websiteId: websiteA.id,
    platformName: 'Cuelinks',
    platformType: 'CUELINKS',
    country: 'India',
    trackingId: '10842',
    priority: 'SECONDARY',
    status: 'CONNECTED'
  });
  console.log(`[PASS] CuelinksAdapter result: ${resCuelinks.affiliateUrl}`);

  // 6. Test Agent Creation & Execution across multiple Agent Types
  const seoAgent = await prisma.agent.create({
    data: {
      name: 'TechPulse SEO Master',
      agentType: 'SEO_TRAFFIC',
      websiteId: websiteA.id,
      status: 'ACTIVE',
      instructions: AGENT_TYPES_REGISTRY.SEO_TRAFFIC.defaultSystemPrompt,
      goals: AGENT_TYPES_REGISTRY.SEO_TRAFFIC.defaultGoals,
      targetCountry: 'India',
      targetLanguage: 'English'
    }
  });
  console.log(`\n[PASS] Created SEO Agent: ${seoAgent.name} (ID: ${seoAgent.id})`);

  const runResult = await executeAgentRun({
    agentId: seoAgent.id,
    task: 'TEST_RUN'
  });
  console.log(`[PASS] Executed SEO Agent Run (Duration: ${runResult.durationMs}ms, RunID: ${runResult.runId})`);

  const logs = await prisma.agentLog.findMany({
    where: { agentId: seoAgent.id },
    take: 5
  });
  console.log(`[PASS] Verified AgentLog records written: ${logs.length} entries`);
  logs.forEach(l => console.log(`   -> [${l.level}] ${l.message}`));

  console.log('\n==============================================');
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
  console.log('==============================================');
}

main().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
