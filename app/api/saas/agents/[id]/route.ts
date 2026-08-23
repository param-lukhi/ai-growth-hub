import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/saas/agents/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.websiteAgent.findUnique({
      where: { id: params.id },
      include: {
        website: {
          include: {
            integrations: true,
            automationRules: true,
            activityLogs: {
              orderBy: { createdAt: 'desc' },
              take: 20
            },
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

    // Compute stats
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/saas/agents/[id] - Save deep 14-tab configuration
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      agentName,
      role,
      tone,
      systemPrompt,
      memoryState,
      customRules,
      active,
      // Nested Website modifications
      website: websiteUpdates
    } = body;

    const existingAgent = await prisma.websiteAgent.findUnique({
      where: { id: params.id },
      include: { website: true }
    });

    if (!existingAgent) {
      return NextResponse.json({ success: false, error: 'Agent not found.' }, { status: 404 });
    }

    // 1. Update Agent Core
    const updatedAgent = await prisma.websiteAgent.update({
      where: { id: params.id },
      data: {
        ...(agentName !== undefined && { agentName }),
        ...(role !== undefined && { role }),
        ...(tone !== undefined && { tone }),
        ...(systemPrompt !== undefined && { systemPrompt }),
        ...(memoryState !== undefined && {
          memoryState: typeof memoryState === 'string' ? memoryState : JSON.stringify(memoryState)
        }),
        ...(customRules !== undefined && {
          customRules: typeof customRules === 'string' ? customRules : JSON.stringify(customRules)
        }),
        ...(active !== undefined && { active })
      }
    });

    // 2. Update Website settings if provided
    if (websiteUpdates && existingAgent.websiteId) {
      await prisma.website.update({
        where: { id: existingAgent.websiteId },
        data: {
          ...(websiteUpdates.name && { name: websiteUpdates.name }),
          ...(websiteUpdates.domainUrl && { domainUrl: websiteUpdates.domainUrl }),
          ...(websiteUpdates.niche && { niche: websiteUpdates.niche }),
          ...(websiteUpdates.subNiche !== undefined && { subNiche: websiteUpdates.subNiche }),
          ...(websiteUpdates.targetCountry && { targetCountry: websiteUpdates.targetCountry }),
          ...(websiteUpdates.targetLanguage && { targetLanguage: websiteUpdates.targetLanguage }),
          ...(websiteUpdates.targetAudience !== undefined && { targetAudience: websiteUpdates.targetAudience }),
          ...(websiteUpdates.brandVoice !== undefined && { brandVoice: websiteUpdates.brandVoice }),
          ...(websiteUpdates.contentStyle !== undefined && { contentStyle: websiteUpdates.contentStyle }),
          ...(websiteUpdates.primaryTopics !== undefined && {
            primaryTopics: typeof websiteUpdates.primaryTopics === 'string' ? websiteUpdates.primaryTopics : JSON.stringify(websiteUpdates.primaryTopics)
          }),
          ...(websiteUpdates.topicsToAvoid !== undefined && {
            topicsToAvoid: typeof websiteUpdates.topicsToAvoid === 'string' ? websiteUpdates.topicsToAvoid : JSON.stringify(websiteUpdates.topicsToAvoid)
          }),
          ...(websiteUpdates.monetization !== undefined && {
            monetization: typeof websiteUpdates.monetization === 'string' ? websiteUpdates.monetization : JSON.stringify(websiteUpdates.monetization)
          }),
          ...(websiteUpdates.publishingFrequency && { publishingFrequency: websiteUpdates.publishingFrequency }),
          ...(websiteUpdates.approvalMode && { approvalMode: websiteUpdates.approvalMode }),
          ...(websiteUpdates.cmsType && { cmsType: websiteUpdates.cmsType }),
          ...(websiteUpdates.cmsConfig !== undefined && {
            cmsConfig: typeof websiteUpdates.cmsConfig === 'string' ? websiteUpdates.cmsConfig : JSON.stringify(websiteUpdates.cmsConfig)
          })
        }
      });
    }

    // 3. Log Activity
    await prisma.agentActivityLog.create({
      data: {
        websiteId: existingAgent.websiteId,
        agentName: updatedAgent.agentName,
        actionType: 'AGENT_UPDATE',
        message: `Agent settings, SEO directives, and isolated memory persisted to database.`,
        status: 'SUCCESS'
      }
    });

    const refreshed = await prisma.websiteAgent.findUnique({
      where: { id: params.id },
      include: {
        website: {
          include: {
            integrations: true,
            automationRules: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, agent: refreshed });
  } catch (error: any) {
    console.error('Error updating agent:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/saas/agents/[id] - Safe delete
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const existingAgent = await prisma.websiteAgent.findUnique({
      where: { id: params.id }
    });

    if (!existingAgent) {
      return NextResponse.json({ success: false, error: 'Agent not found.' }, { status: 404 });
    }

    // Delete agent record (preserves website and articles)
    await prisma.websiteAgent.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: `Agent "${existingAgent.agentName}" deleted successfully while preserving website articles.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
