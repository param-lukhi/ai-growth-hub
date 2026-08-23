import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ensureDefaultWebsitesSeeded } from '@/lib/saas/seed-data';
import { generateInitialGrowthPlan } from '@/lib/saas/agent-engine';

// GET /api/saas/websites
export async function GET() {
  try {
    await ensureDefaultWebsitesSeeded();

    const websites = await prisma.website.findMany({
      include: {
        agent: true,
        _count: {
          select: {
            articles: true,
            topics: true,
            activityLogs: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ success: true, websites });
  } catch (error: any) {
    console.error('Error fetching websites:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/saas/websites - Add Website Wizard Submission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      domainUrl,
      niche,
      subNiche,
      targetCountry = 'India',
      targetLanguage = 'English',
      targetAudience,
      brandVoice,
      contentStyle,
      primaryTopics = [],
      topicsToAvoid = [],
      monetization = ['AMAZON_AFFILIATE'],
      publishingFrequency = 'WEEKLY',
      approvalMode = 'MANUAL',
      cmsType = 'NATIVE',
      cmsConfig
    } = body;

    if (!name || !domainUrl || !niche) {
      return NextResponse.json(
        { success: false, error: 'Website Name, URL, and Niche are required.' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check slug collision
    const existing = await prisma.website.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    // Create Website
    const website = await prisma.website.create({
      data: {
        name,
        slug: finalSlug,
        domainUrl: domainUrl.startsWith('http') ? domainUrl : `https://${domainUrl}`,
        niche,
        subNiche,
        targetCountry,
        targetLanguage,
        targetAudience,
        brandVoice: brandVoice || 'Clear, helpful, practical, trustworthy',
        contentStyle: contentStyle || 'Research-backed buying guides and verified product comparisons',
        primaryTopics: typeof primaryTopics === 'string' ? primaryTopics : JSON.stringify(primaryTopics),
        topicsToAvoid: typeof topicsToAvoid === 'string' ? topicsToAvoid : JSON.stringify(topicsToAvoid),
        monetization: typeof monetization === 'string' ? monetization : JSON.stringify(monetization),
        publishingFrequency,
        approvalMode,
        cmsType,
        cmsConfig: cmsConfig ? (typeof cmsConfig === 'string' ? cmsConfig : JSON.stringify(cmsConfig)) : null,
        status: 'ACTIVE',
        lastAgentRun: new Date(),
        agent: {
          create: {
            agentName: `${name} Growth Agent`,
            role: `${niche} content, SEO, and growth optimization agent`,
            tone: 'Authoritative, clear, and reader-first',
            systemPrompt: `You are the dedicated AI Growth Agent for ${name}. Research topics in the ${niche} niche for ${targetCountry}. Deliver high-converting, research-backed content without hallucinations.`,
            memoryState: JSON.stringify({
              brandVoice: brandVoice || 'Clear, practical, trustworthy',
              coveredTopics: [],
              reviewedProducts: [],
              affiliateRules: ['Disclose affiliate links clearly', 'Verify specifications'],
              targetAudience: targetAudience || `Consumers shopping in ${niche}`
            }),
            active: true
          }
        },
        automationRules: {
          create: [
            { ruleName: 'DAILY_TOPIC_DISCOVERY', frequency: 'DAILY', isEnabled: false },
            { ruleName: 'POST_PUBLISH_SOCIAL', frequency: 'ON_PUBLISH', isEnabled: true },
            { ruleName: 'WEEKLY_CONTENT_PLAN', frequency: 'WEEKLY', isEnabled: false }
          ]
        },
        integrations: {
          create: [
            { provider: 'GOOGLE_SEARCH_CONSOLE', displayName: `GSC (${name})`, status: 'REQUIRES_CONNECTION' },
            { provider: 'AMAZON_ASSOCIATES', displayName: `Amazon Associates (${name})`, status: 'REQUIRES_CONNECTION' },
            { provider: 'GOOGLE_ANALYTICS', displayName: `Google Analytics 4 (${name})`, status: 'REQUIRES_CONNECTION' }
          ]
        },
        activityLogs: {
          create: [
            {
              agentName: `${name} Growth Agent`,
              actionType: 'TOPIC_DISCOVERY',
              message: `AI Agent initialized and calibrated for ${niche} in ${targetCountry}. Generated Initial Growth Report.`,
              status: 'SUCCESS'
            }
          ]
        }
      },
      include: {
        agent: true
      }
    });

    // Generate initial growth plan and seed initial 5 prioritized topic opportunities
    const growthPlan = generateInitialGrowthPlan(website as any);
    if (growthPlan.topics.length > 0) {
      await prisma.topicOpportunity.createMany({
        data: growthPlan.topics.map(t => ({
          websiteId: website.id,
          topic: t.topic || 'New Topic',
          primaryKeyword: t.primaryKeyword || 'keyword',
          secondaryKeywords: JSON.stringify(t.secondaryKeywords || []),
          searchIntent: t.searchIntent || 'Commercial Investigation',
          buyerIntent: t.buyerIntent || 'High',
          competitionEstimate: t.competitionEstimate || 'Medium',
          contentOpportunity: t.contentOpportunity || `High relevance for ${niche}`,
          affiliatePotential: t.affiliatePotential || 'High',
          suggestedArticleType: t.suggestedArticleType || 'Buying Guide',
          suggestedTitle: t.suggestedTitle || t.topic || 'Article',
          priorityScore: t.priorityScore || 85,
          status: 'DISCOVERED'
        }))
      });
    }

    return NextResponse.json({
      success: true,
      website,
      growthReport: growthPlan
    });
  } catch (error: any) {
    console.error('Error creating website:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
