import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { calculateTopicScore } from '@/lib/saas/agent-engine';

// GET /api/saas/topics?websiteId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId query parameter is required.' }, { status: 400 });
    }

    const topics = await prisma.topicOpportunity.findMany({
      where: { websiteId },
      orderBy: { priorityScore: 'desc' }
    });

    return NextResponse.json({ success: true, topics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/saas/topics - Trigger Agent Topic Discovery
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { websiteId, customQuery } = body;

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: { agent: true }
    });

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found.' }, { status: 404 });
    }

    const isAuto = website.niche.toLowerCase().includes('auto');
    const newTopicPool = isAuto ? [
      {
        topic: 'Best Dual Dash Cams with 4K Night Vision',
        primaryKeyword: 'best dual dash cam 4k',
        secondaryKeywords: ['front rear dash cam 4k', 'dash cam with parking mode', 'car camera night vision'],
        searchIntent: 'Commercial Investigation',
        buyerIntent: 'High',
        competitionEstimate: 'Medium',
        contentOpportunity: 'Surge in buyer demand for high-resolution security while parked.',
        affiliatePotential: 'High',
        suggestedArticleType: 'Buying Guide',
        suggestedTitle: 'Top 5 Best Dual Dash Cams with 4K Night Vision in 2026'
      },
      {
        topic: 'Best Cordless Car Pressure Washers',
        primaryKeyword: 'cordless car pressure washer',
        secondaryKeywords: ['battery powered pressure washer', 'portable car foam cannon', 'wireless car wash gun'],
        searchIntent: 'Commercial Investigation',
        buyerIntent: 'High',
        competitionEstimate: 'Low',
        contentOpportunity: 'Apartment car owners who do not have access to an outdoor garden hose.',
        affiliatePotential: 'High',
        suggestedArticleType: 'Review',
        suggestedTitle: 'Best Cordless Battery Pressure Washers for Easy Apartment Car Washing'
      },
      {
        topic: 'Best Car Seat Cushions for Long Distance Driving',
        primaryKeyword: 'best car seat cushion for long drives',
        secondaryKeywords: ['orthopedic car cushion', 'memory foam seat cushion for car', 'sciatica car seat pad'],
        searchIntent: 'Commercial Investigation',
        buyerIntent: 'High',
        competitionEstimate: 'Low',
        affiliatePotential: 'High',
        suggestedArticleType: 'Round-up',
        suggestedTitle: 'Best Ergonomic Car Seat Cushions to Prevent Back Pain on Long Drives'
      }
    ] : [
      {
        topic: 'Best Noise Cancelling Headphones Under ₹5,000',
        primaryKeyword: 'best anc headphones under 5000',
        secondaryKeywords: ['over ear anc headphones budget', 'sony vs jbl under 5000', 'wireless anc headphones india'],
        searchIntent: 'Commercial Investigation',
        buyerIntent: 'High',
        competitionEstimate: 'Medium',
        contentOpportunity: 'Massive volume of students and remote workers seeking budget ANC over-ear headphones.',
        affiliatePotential: 'High',
        suggestedArticleType: 'Buying Guide',
        suggestedTitle: 'Best Over-Ear Noise Cancelling Headphones Under ₹5,000 in India (2026)'
      },
      {
        topic: 'Best Smartwatches with ECG & Blood Pressure Tracking',
        primaryKeyword: 'best smartwatch with ecg tracking',
        secondaryKeywords: ['health tracking smartwatch', 'accurate heart rate smartwatch', 'best fitness watch 2026'],
        searchIntent: 'Commercial Investigation',
        buyerIntent: 'High',
        competitionEstimate: 'Medium',
        contentOpportunity: 'Growing fitness and health sensor interest with verified medical sensor comparisons.',
        affiliatePotential: 'High',
        suggestedArticleType: 'Buying Guide',
        suggestedTitle: 'Best Health & Fitness Smartwatches with ECG Tracking (Tested & Ranked)'
      },
      {
        topic: 'Best 65W GaN Fast Chargers for Laptops & Phones',
        primaryKeyword: 'best 65w gan charger',
        secondaryKeywords: ['type c fast charger for laptop', 'multi port gan charger', '65w usb c charger india'],
        searchIntent: 'Commercial Investigation',
        buyerIntent: 'High',
        competitionEstimate: 'Low',
        contentOpportunity: 'High impulse accessory purchase paired with every laptop or phone buying guide.',
        affiliatePotential: 'High',
        suggestedArticleType: 'Round-up',
        suggestedTitle: 'Best Compact 65W GaN Fast Chargers for MacBooks, Laptops & Phones'
      }
    ];

    const createdTopics = [];

    for (const t of newTopicPool) {
      // Calculate 0-100 score
      const { score, breakdown } = calculateTopicScore(
        t.topic,
        t.searchIntent,
        t.buyerIntent,
        t.affiliatePotential,
        website.niche,
        true,
        true
      );

      const created = await prisma.topicOpportunity.create({
        data: {
          websiteId: website.id,
          topic: t.topic,
          primaryKeyword: t.primaryKeyword,
          secondaryKeywords: JSON.stringify(t.secondaryKeywords),
          searchIntent: t.searchIntent,
          buyerIntent: t.buyerIntent,
          competitionEstimate: t.competitionEstimate,
          contentOpportunity: t.contentOpportunity,
          affiliatePotential: t.affiliatePotential,
          suggestedArticleType: t.suggestedArticleType,
          suggestedTitle: t.suggestedTitle,
          priorityScore: score,
          scoreBreakdown: JSON.stringify(breakdown),
          status: 'DISCOVERED'
        }
      });
      createdTopics.push(created);
    }

    // Log Activity
    await prisma.agentActivityLog.create({
      data: {
        websiteId: website.id,
        agentName: website.agent?.agentName || `${website.name} Growth Agent`,
        actionType: 'TOPIC_DISCOVERY',
        message: `Discovered and scored ${createdTopics.length} new high-priority content opportunities for ${website.niche}.`,
        status: 'SUCCESS'
      }
    });

    return NextResponse.json({
      success: true,
      discoveredCount: createdTopics.length,
      topics: createdTopics
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
