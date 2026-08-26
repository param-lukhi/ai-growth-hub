import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { AGENT_TYPES_REGISTRY, AgentTypeKey } from '@/lib/saas/agent-types-registry';

// GET /api/saas/agents/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    let agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        website: {
          include: {
            integrations: true,
            affiliatePlatforms: true,
            automationRules: true,
            activityLogs: {
              orderBy: { createdAt: 'desc' },
              take: 20
            }
          }
        },
        runs: {
          take: 10,
          orderBy: { startedAt: 'desc' }
        },
        logs: {
          take: 25,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Fallback lookup in WebsiteAgent if needed
    if (!agent) {
      const legacyAgent = await prisma.websiteAgent.findUnique({
        where: { id: params.id },
        include: {
          website: {
            include: {
              integrations: true,
              affiliatePlatforms: true,
              automationRules: true,
              activityLogs: {
                orderBy: { createdAt: 'desc' },
                take: 20
              }
            }
          }
        }
      });

      if (!legacyAgent) {
        return NextResponse.json({ success: false, error: 'Agent not found.' }, { status: 404 });
      }

      // Upsert into Agent table
      agent = await prisma.agent.upsert({
        where: { id: legacyAgent.id },
        update: {},
        create: {
          id: legacyAgent.id,
          name: legacyAgent.agentName,
          description: legacyAgent.role,
          agentType: 'BLOG_WRITER',
          websiteId: legacyAgent.websiteId,
          status: legacyAgent.active ? 'ACTIVE' : 'PAUSED',
          instructions: legacyAgent.systemPrompt,
          tone: legacyAgent.tone,
          contentRules: legacyAgent.customRules,
          memoryState: legacyAgent.memoryState,
          targetCountry: legacyAgent.website.targetCountry,
          targetLanguage: legacyAgent.website.targetLanguage
        },
        include: {
          website: {
            include: {
              integrations: true,
              affiliatePlatforms: true,
              automationRules: true,
              activityLogs: {
                orderBy: { createdAt: 'desc' },
                take: 20
              }
            }
          },
          runs: true,
          logs: true
        }
      });
    }

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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/saas/agents/[id] - Save agent and website configuration
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      agentName,
      description,
      role,
      agentType,
      status,
      active,
      instructions,
      systemPrompt,
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
      aiModel,
      tools,
      memoryState,
      customRules,
      // Nested Website modifications
      website: websiteUpdates
    } = body;

    const existingAgent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: { website: true }
    });

    if (!existingAgent) {
      return NextResponse.json({ success: false, error: 'Agent not found.' }, { status: 404 });
    }

    const finalStatus = status !== undefined ? status : (active !== undefined ? (active ? 'ACTIVE' : 'PAUSED') : existingAgent.status);
    const finalName = name || agentName || existingAgent.name;
    const finalDescription = description || role || existingAgent.description;
    const finalInstructions = instructions || systemPrompt || existingAgent.instructions;

    // 1. Update Agent Core
    const updatedAgent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        name: finalName,
        description: finalDescription,
        ...(agentType && { agentType }),
        status: finalStatus,
        instructions: finalInstructions,
        ...(goals !== undefined && { goals }),
        ...(targetCountry && { targetCountry }),
        ...(targetLanguage && { targetLanguage }),
        ...(targetAudience !== undefined && { targetAudience }),
        ...(categories !== undefined && {
          categories: typeof categories === 'string' ? categories : JSON.stringify(categories)
        }),
        ...(keywords !== undefined && {
          keywords: typeof keywords === 'string' ? keywords : JSON.stringify(keywords)
        }),
        ...(tone && { tone }),
        ...(contentRules !== undefined && {
          contentRules: typeof contentRules === 'string' ? contentRules : JSON.stringify(contentRules)
        }),
        ...(seoRules !== undefined && {
          seoRules: typeof seoRules === 'string' ? seoRules : JSON.stringify(seoRules)
        }),
        ...(affiliateRules !== undefined && {
          affiliateRules: typeof affiliateRules === 'string' ? affiliateRules : JSON.stringify(affiliateRules)
        }),
        ...(publishingRules !== undefined && {
          publishingRules: typeof publishingRules === 'string' ? publishingRules : JSON.stringify(publishingRules)
        }),
        ...(schedule !== undefined && { schedule }),
        ...(aiModel && { aiModel }),
        ...(tools !== undefined && {
          tools: typeof tools === 'string' ? tools : JSON.stringify(tools)
        }),
        ...(memoryState !== undefined && {
          memoryState: typeof memoryState === 'string' ? memoryState : JSON.stringify(memoryState)
        })
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
          ...(websiteUpdates.publishingFrequency && { publishingFrequency: websiteUpdates.publishingFrequency }),
          ...(websiteUpdates.approvalMode && { approvalMode: websiteUpdates.approvalMode }),
          ...(websiteUpdates.cmsType && { cmsType: websiteUpdates.cmsType })
        }
      });
    }

    // 3. Log Activity
    await prisma.agentActivityLog.create({
      data: {
        websiteId: existingAgent.websiteId,
        agentName: updatedAgent.name,
        actionType: 'AGENT_UPDATE',
        message: `Agent settings, tools, instructions, and isolated memory persisted to database.`,
        status: 'SUCCESS'
      }
    });

    const refreshed = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        website: {
          include: {
            integrations: true,
            affiliatePlatforms: true
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
    const existingAgent = await prisma.agent.findUnique({
      where: { id: params.id }
    });

    if (!existingAgent) {
      return NextResponse.json({ success: false, error: 'Agent not found.' }, { status: 404 });
    }

    await prisma.agent.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: `Agent "${existingAgent.name}" deleted successfully while preserving website content and analytics.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
