import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ensureDefaultWebsitesSeeded } from '@/lib/saas/seed-data';
import { AGENT_TYPES_REGISTRY, AgentTypeKey } from '@/lib/saas/agent-types-registry';

export const dynamic = 'force-dynamic';

// Helper to seed initial Agent records if needed
async function ensureAgentRecordsSeeded() {
  await ensureDefaultWebsitesSeeded();
  const agentCount = await prisma.agent.count();
  if (agentCount === 0) {
    const websites = await prisma.website.findMany({
      include: { agent: true }
    });

    for (const site of websites) {
      // Create primary Blog Writer agent
      await prisma.agent.create({
        data: {
          name: site.agent?.agentName || `${site.name} Blog Writer Agent`,
          description: site.agent?.role || `Primary autonomous content and growth agent for ${site.name}`,
          agentType: 'BLOG_WRITER',
          websiteId: site.id,
          status: site.agent?.active ? 'ACTIVE' : 'ACTIVE',
          instructions: site.agent?.systemPrompt || `Research high-value search topics in ${site.niche} for ${site.targetCountry}. Produce comprehensive, research-backed guides with structured schema and verified affiliate links.`,
          goals: 'Publish high-ranking commercial buying guides and product reviews weekly.',
          targetCountry: site.targetCountry,
          targetLanguage: site.targetLanguage,
          targetAudience: site.targetAudience || 'Consumers seeking verified product advice',
          categories: site.primaryTopics || JSON.stringify([site.niche]),
          keywords: JSON.stringify(['best ' + site.niche.toLowerCase(), site.niche.toLowerCase() + ' review', site.niche.toLowerCase() + ' guide']),
          tone: site.agent?.tone || 'Clear, helpful, practical, trustworthy',
          contentRules: site.agent?.customRules || JSON.stringify({ minLength: 800, maxLength: 2500 }),
          seoRules: JSON.stringify({ autoTitle: true, autoMeta: true, autoSchema: true }),
          affiliateRules: JSON.stringify({ autoDisclosure: true, requireVerifiedLinks: true }),
          publishingRules: JSON.stringify({ approvalMode: site.approvalMode }),
          schedule: site.publishingFrequency || '3_PER_WEEK',
          aiModel: 'gemini-2.5-flash',
          tools: JSON.stringify(['ARTICLE_WRITER', 'PRODUCT_RESEARCH', 'IMAGE_VERIFIER', 'SCHEMA_GENERATOR', 'AFFILIATE_MAPPER']),
          memoryState: site.agent?.memoryState || JSON.stringify({ brandVoice: site.brandVoice, coveredTopics: [] })
        }
      });

      // Create an SEO & Traffic agent for TechPulse
      if (site.slug === 'techpulse') {
        await prisma.agent.create({
          data: {
            name: 'TechPulse SEO Intelligence Agent',
            description: 'Autonomous keyword discovery, striking distance ranking opportunities, and competitor gap analysis',
            agentType: 'SEO_TRAFFIC',
            websiteId: site.id,
            status: 'ACTIVE',
            instructions: 'Analyze keyword search trends and Search Console queries in India to discover striking distance opportunities.',
            goals: 'Find 15+ high-commercial intent topic opportunities weekly.',
            targetCountry: 'India',
            targetLanguage: 'English',
            categories: JSON.stringify(['Smartphones', 'Earbuds', 'Laptops', 'Smartwatches']),
            tone: 'Data-driven, analytical, and actionable',
            schedule: 'DAILY',
            aiModel: 'gemini-2.5-flash',
            tools: JSON.stringify(['KEYWORD_RESEARCH', 'SEARCH_CONSOLE', 'COMPETITOR_ANALYSIS', 'INTERNAL_LINKER'])
          }
        });
      }
    }
  }
}

// GET /api/saas/agents?websiteId=xxx&agentType=xxx&status=xxx
export async function GET(request: Request) {
  try {
    await ensureAgentRecordsSeeded();

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    const agentId = searchParams.get('agentId');
    const agentType = searchParams.get('agentType');
    const status = searchParams.get('status');

    // Case 1: Specific Agent by ID
    if (agentId) {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        include: {
          website: {
            include: {
              integrations: true,
              affiliatePlatforms: true
            }
          },
          runs: {
            take: 5,
            orderBy: { startedAt: 'desc' }
          },
          logs: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!agent) {
        return NextResponse.json({ success: false, error: 'Agent not found.' }, { status: 404 });
      }

      // Calculate performance metrics
      const articles = await prisma.contentArticle.findMany({
        where: { websiteId: agent.websiteId },
        select: { status: true, qualityScore: true, views: true, affiliateClicks: true }
      });

      const generatedCount = articles.length;
      const publishedCount = articles.filter(a => a.status === 'PUBLISHED').length;
      const rejectedCount = articles.filter(a => a.status === 'REJECTED').length;
      const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);
      const totalClicks = articles.reduce((acc, a) => acc + (a.affiliateClicks || 0), 0);
      const avgQuality = generatedCount > 0 ? Math.round(articles.reduce((acc, a) => acc + (a.qualityScore || 85), 0) / generatedCount) : 90;

      return NextResponse.json({
        success: true,
        agent: {
          ...agent,
          active: agent.status === 'ACTIVE',
          agentName: agent.name,
          role: agent.description || AGENT_TYPES_REGISTRY[agent.agentType as AgentTypeKey]?.defaultRole || 'AI Growth Agent',
          stats: {
            articlesGenerated: generatedCount,
            articlesPublished: publishedCount,
            articlesRejected: rejectedCount,
            trafficCount: totalViews || agent.website.trafficCount || 0,
            affiliateClicks: totalClicks || agent.website.affiliateClicks || 0,
            averageQualityScore: avgQuality,
            lastRun: agent.runs[0]?.startedAt || agent.updatedAt
          }
        }
      });
    }

    // Case 2: Filtered Query / List All Agents
    const whereClause: any = {};
    if (websiteId) whereClause.websiteId = websiteId;
    if (agentType && agentType !== 'ALL') whereClause.agentType = agentType;
    if (status && status !== 'ALL') whereClause.status = status;

    const agents = await prisma.agent.findMany({
      where: whereClause,
      include: {
        website: {
          include: {
            integrations: true,
            affiliatePlatforms: true
          }
        },
        runs: {
          take: 1,
          orderBy: { startedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const articles = await prisma.contentArticle.findMany({
          where: { websiteId: agent.websiteId },
          select: { status: true, qualityScore: true, views: true, affiliateClicks: true }
        });

        const generatedCount = articles.length;
        const publishedCount = articles.filter(a => a.status === 'PUBLISHED').length;
        const rejectedCount = articles.filter(a => a.status === 'REJECTED').length;
        const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);
        const totalClicks = articles.reduce((acc, a) => acc + (a.affiliateClicks || 0), 0);
        const avgQuality = generatedCount > 0 ? Math.round(articles.reduce((acc, a) => acc + (a.qualityScore || 85), 0) / generatedCount) : 90;

        return {
          ...agent,
          active: agent.status === 'ACTIVE',
          agentName: agent.name,
          role: agent.description || AGENT_TYPES_REGISTRY[agent.agentType as AgentTypeKey]?.defaultRole || 'AI Growth Agent',
          stats: {
            articlesGenerated: generatedCount,
            articlesPublished: publishedCount,
            articlesRejected: rejectedCount,
            trafficCount: totalViews || agent.website.trafficCount || 0,
            affiliateClicks: totalClicks || agent.website.affiliateClicks || 0,
            averageQualityScore: avgQuality,
            lastRun: agent.runs[0]?.startedAt || agent.updatedAt
          }
        };
      })
    );

    return NextResponse.json({ success: true, agents: agentsWithStats });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/saas/agents - Create a new Agent (Multi-Agent architecture)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      agentName,
      description,
      agentType = 'BLOG_WRITER',
      websiteId,
      status = 'ACTIVE',
      instructions,
      goals,
      targetCountry,
      targetLanguage,
      targetAudience,
      categories,
      keywords,
      tone,
      contentRules,
      seoRules,
      affiliateRules,
      publishingRules,
      schedule,
      aiModel = 'gemini-2.5-flash',
      tools,
      memoryState,
      newWebsite
    } = body;

    let targetWebsiteId = websiteId;
    let createdSite: any = null;

    if (!targetWebsiteId && newWebsite) {
      const slug = newWebsite.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existing = await prisma.website.findUnique({ where: { slug } });
      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      createdSite = await prisma.website.create({
        data: {
          name: newWebsite.name,
          slug: finalSlug,
          domainUrl: newWebsite.domainUrl.startsWith('http') ? newWebsite.domainUrl : `https://${newWebsite.domainUrl}`,
          niche: newWebsite.niche || 'Technology',
          subNiche: newWebsite.subNiche || null,
          targetCountry: newWebsite.targetCountry || 'India',
          targetLanguage: newWebsite.targetLanguage || 'English',
          targetAudience: newWebsite.targetAudience || null,
          brandVoice: newWebsite.brandVoice || 'Clear, helpful, practical, trustworthy',
          contentStyle: newWebsite.contentStyle || 'Research-backed buying guides',
          monetization: typeof newWebsite.monetization === 'string' ? newWebsite.monetization : JSON.stringify(newWebsite.monetization || ['AMAZON_AFFILIATE']),
          publishingFrequency: newWebsite.publishingFrequency || 'WEEKLY',
          approvalMode: newWebsite.approvalMode || 'MANUAL',
          cmsType: newWebsite.cmsType || 'NATIVE',
          status: 'ACTIVE'
        }
      });
      targetWebsiteId = createdSite.id;
    }

    if (!targetWebsiteId && !createdSite) {
      return NextResponse.json({ success: false, error: 'websiteId or newWebsite details are required.' }, { status: 400 });
    }

    let website = createdSite || (targetWebsiteId ? await prisma.website.findUnique({ where: { id: targetWebsiteId } }) : null);
    if (!website) {
      website = {
        id: targetWebsiteId || `site-${Date.now()}`,
        name: newWebsite?.name || 'Connected Property',
        niche: newWebsite?.niche || 'Technology',
        targetCountry: newWebsite?.targetCountry || 'India',
        targetLanguage: newWebsite?.targetLanguage || 'English',
        targetAudience: newWebsite?.targetAudience || 'Consumers',
        brandVoice: 'Clear, helpful, practical',
        approvalMode: 'MANUAL'
      };
    }

    const typeDef = AGENT_TYPES_REGISTRY[agentType as AgentTypeKey] || AGENT_TYPES_REGISTRY.CUSTOM;
    const finalName = name || agentName || `${website.name} ${typeDef.shortName} Agent`;

    const createdAgent = await prisma.agent.create({
      data: {
        name: finalName,
        description: description || typeDef.defaultRole,
        agentType,
        websiteId: targetWebsiteId,
        status,
        instructions: instructions || typeDef.defaultSystemPrompt,
        goals: goals || typeDef.defaultGoals,
        targetCountry: targetCountry || website.targetCountry,
        targetLanguage: targetLanguage || website.targetLanguage,
        targetAudience: targetAudience || website.targetAudience || 'Value-focused shoppers',
        categories: typeof categories === 'string' ? categories : JSON.stringify(categories || [website.niche]),
        keywords: typeof keywords === 'string' ? keywords : JSON.stringify(keywords || []),
        tone: tone || typeDef.defaultTone,
        contentRules: typeof contentRules === 'string' ? contentRules : JSON.stringify(contentRules || { minLength: 800, maxLength: 2500 }),
        seoRules: typeof seoRules === 'string' ? seoRules : JSON.stringify(seoRules || { autoTitle: true, autoMeta: true }),
        affiliateRules: typeof affiliateRules === 'string' ? affiliateRules : JSON.stringify(affiliateRules || { autoDisclosure: true }),
        publishingRules: typeof publishingRules === 'string' ? publishingRules : JSON.stringify(publishingRules || { approvalMode: website.approvalMode }),
        schedule: schedule || typeDef.defaultSchedule,
        aiModel,
        tools: typeof tools === 'string' ? tools : JSON.stringify(tools || typeDef.recommendedTools),
        memoryState: typeof memoryState === 'string' ? memoryState : JSON.stringify(memoryState || { brandVoice: website.brandVoice, coveredTopics: [] })
      },
      include: { website: true }
    });

    // Log Activity
    await prisma.agentActivityLog.create({
      data: {
        websiteId: targetWebsiteId,
        agentName: createdAgent.name,
        actionType: 'AGENT_CREATED',
        message: `Agent "${createdAgent.name}" (${typeDef.name}) initialized for ${website.name}.`,
        status: 'SUCCESS'
      }
    });

    return NextResponse.json({ success: true, agent: createdAgent });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    let errorMessage = error.message || 'Failed to create agent.';
    if (errorMessage.includes('DATABASE_URL') || errorMessage.includes('credentials') || errorMessage.includes('ADC')) {
      errorMessage = 'Firestore database credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are missing in environment variables.';
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
