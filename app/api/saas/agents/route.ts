import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ensureDefaultWebsitesSeeded } from '@/lib/saas/seed-data';

// GET /api/saas/agents?websiteId=xxx OR ?agentId=xxx OR no params (list all)
export async function GET(request: Request) {
  try {
    await ensureDefaultWebsitesSeeded();

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    const agentId = searchParams.get('agentId');

    // Case 1: Specific Agent by ID
    if (agentId) {
      const agent = await prisma.websiteAgent.findUnique({
        where: { id: agentId },
        include: {
          website: {
            include: {
              integrations: true,
              automationRules: true,
              _count: {
                select: {
                  articles: true,
                  topics: true,
                  activityLogs: true
                }
              }
            }
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
      const avgQuality = generatedCount > 0 ? Math.round(articles.reduce((acc, a) => acc + (a.qualityScore || 85), 0) / generatedCount) : 88;

      return NextResponse.json({
        success: true,
        agent: {
          ...agent,
          stats: {
            articlesGenerated: generatedCount,
            articlesPublished: publishedCount,
            articlesRejected: rejectedCount,
            trafficCount: totalViews || agent.website.trafficCount || 0,
            affiliateClicks: totalClicks || agent.website.affiliateClicks || 0,
            averageQualityScore: avgQuality,
            lastRun: agent.website.lastAgentRun || agent.updatedAt
          }
        }
      });
    }

    // Case 2: Specific Agent by Website ID
    if (websiteId) {
      const agent = await prisma.websiteAgent.findUnique({
        where: { websiteId },
        include: {
          website: {
            include: {
              integrations: true,
              automationRules: true,
              _count: {
                select: {
                  articles: true,
                  topics: true,
                  activityLogs: true
                }
              }
            }
          }
        }
      });

      if (!agent) {
        return NextResponse.json({ success: false, error: 'Agent not found for this website.' }, { status: 404 });
      }

      const articles = await prisma.contentArticle.findMany({
        where: { websiteId },
        select: { status: true, qualityScore: true, views: true, affiliateClicks: true }
      });

      const generatedCount = articles.length;
      const publishedCount = articles.filter(a => a.status === 'PUBLISHED').length;
      const rejectedCount = articles.filter(a => a.status === 'REJECTED').length;
      const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);
      const totalClicks = articles.reduce((acc, a) => acc + (a.affiliateClicks || 0), 0);
      const avgQuality = generatedCount > 0 ? Math.round(articles.reduce((acc, a) => acc + (a.qualityScore || 85), 0) / generatedCount) : 88;

      return NextResponse.json({
        success: true,
        agent: {
          ...agent,
          stats: {
            articlesGenerated: generatedCount,
            articlesPublished: publishedCount,
            articlesRejected: rejectedCount,
            trafficCount: totalViews || agent.website.trafficCount || 0,
            affiliateClicks: totalClicks || agent.website.affiliateClicks || 0,
            averageQualityScore: avgQuality,
            lastRun: agent.website.lastAgentRun || agent.updatedAt
          }
        }
      });
    }

    // Case 3: List ALL Agents across all websites
    const allAgents = await prisma.websiteAgent.findMany({
      include: {
        website: {
          include: {
            integrations: true,
            automationRules: true,
            _count: {
              select: {
                articles: true,
                topics: true,
                activityLogs: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Populate real statistics per agent
    const agentsWithStats = await Promise.all(
      allAgents.map(async (agent) => {
        const articles = await prisma.contentArticle.findMany({
          where: { websiteId: agent.websiteId },
          select: { status: true, qualityScore: true, views: true, affiliateClicks: true }
        });

        const generatedCount = articles.length;
        const publishedCount = articles.filter(a => a.status === 'PUBLISHED').length;
        const rejectedCount = articles.filter(a => a.status === 'REJECTED').length;
        const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);
        const totalClicks = articles.reduce((acc, a) => acc + (a.affiliateClicks || 0), 0);
        const avgQuality = generatedCount > 0 ? Math.round(articles.reduce((acc, a) => acc + (a.qualityScore || 85), 0) / generatedCount) : 88;

        return {
          ...agent,
          stats: {
            articlesGenerated: generatedCount,
            articlesPublished: publishedCount,
            articlesRejected: rejectedCount,
            trafficCount: totalViews || agent.website.trafficCount || 0,
            affiliateClicks: totalClicks || agent.website.affiliateClicks || 0,
            averageQualityScore: avgQuality,
            lastRun: agent.website.lastAgentRun || agent.updatedAt
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

// POST /api/saas/agents - Create Agent (with existing or new website)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      agentName,
      role,
      tone,
      systemPrompt,
      websiteId,
      // If creating website inline
      newWebsite
    } = body;

    let targetWebsiteId = websiteId;

    if (!targetWebsiteId && newWebsite) {
      const slug = newWebsite.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existing = await prisma.website.findUnique({ where: { slug } });
      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      const createdSite = await prisma.website.create({
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

    if (!targetWebsiteId) {
      return NextResponse.json({ success: false, error: 'websiteId or newWebsite details are required.' }, { status: 400 });
    }

    // Check if agent already exists for this website
    const existingAgent = await prisma.websiteAgent.findUnique({
      where: { websiteId: targetWebsiteId }
    });

    if (existingAgent) {
      return NextResponse.json({ success: false, error: 'An agent is already configured for this website.' }, { status: 400 });
    }

    const website = await prisma.website.findUnique({ where: { id: targetWebsiteId } });

    const createdAgent = await prisma.websiteAgent.create({
      data: {
        websiteId: targetWebsiteId,
        agentName: agentName || `${website?.name || 'Website'} Growth Agent`,
        role: role || `${website?.niche || 'General'} content, SEO, and growth optimization agent`,
        tone: tone || 'Clear, helpful, practical, trustworthy',
        systemPrompt: systemPrompt || `You are the dedicated AI Growth Agent for ${website?.name}. Research topics in the ${website?.niche} niche for ${website?.targetCountry}. Deliver high-converting, research-backed content without hallucinations.`,
        memoryState: JSON.stringify({
          brandVoice: website?.brandVoice || 'Clear, practical, trustworthy',
          coveredTopics: [],
          reviewedProducts: [],
          affiliateRules: ['Disclose affiliate links clearly', 'Verify specifications'],
          targetAudience: website?.targetAudience || `Consumers shopping in ${website?.niche}`
        }),
        customRules: JSON.stringify({
          minWordCount: 800,
          requireFaqSchema: true,
          requireComparisonTable: true
        }),
        active: true
      },
      include: { website: true }
    });

    // Log Activity
    await prisma.agentActivityLog.create({
      data: {
        websiteId: targetWebsiteId,
        agentName: createdAgent.agentName,
        actionType: 'AGENT_CREATED',
        message: `Agent "${createdAgent.agentName}" initialized for ${website?.name}.`,
        status: 'SUCCESS'
      }
    });

    return NextResponse.json({ success: true, agent: createdAgent });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/saas/agents - Update Agent settings & memory
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { websiteId, agentName, role, tone, systemPrompt, memoryState, customRules, active } = body;

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const updated = await prisma.websiteAgent.upsert({
      where: { websiteId },
      update: {
        ...(agentName && { agentName }),
        ...(role && { role }),
        ...(tone && { tone }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(memoryState !== undefined && { memoryState: typeof memoryState === 'string' ? memoryState : JSON.stringify(memoryState) }),
        ...(customRules !== undefined && { customRules: typeof customRules === 'string' ? customRules : JSON.stringify(customRules) }),
        ...(active !== undefined && { active })
      },
      create: {
        websiteId,
        agentName: agentName || 'AI Growth Agent',
        role: role || 'Content and Growth Agent',
        tone: tone || 'Clear, helpful, practical, trustworthy',
        systemPrompt,
        memoryState: typeof memoryState === 'string' ? memoryState : JSON.stringify(memoryState || {}),
        customRules: typeof customRules === 'string' ? customRules : JSON.stringify(customRules || {}),
        active: active !== undefined ? active : true
      },
      include: { website: true }
    });

    // Log Activity
    await prisma.agentActivityLog.create({
      data: {
        websiteId,
        agentName: updated.agentName,
        actionType: 'AGENT_UPDATE',
        message: `Updated agent configuration, tone settings, and isolated memory state.`,
        status: 'SUCCESS'
      }
    });

    return NextResponse.json({ success: true, agent: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
