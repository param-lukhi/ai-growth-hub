import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { executeAgentRun } from '@/lib/saas/multi-agent-runner';
import { testAgentDiagnostics } from '@/lib/saas/agent-engine';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, payload, customInput, productNames, productUrls, uploadedImages } = body;

    // Lookup Agent in Agent table first
    let agent = await prisma.agent.findUnique({
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

    if (!agent) {
      // Check legacy table and migrate on demand
      const legacyAgent = await prisma.websiteAgent.findUnique({
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

      if (!legacyAgent) {
        return NextResponse.json({ success: false, error: 'Agent not found.' }, { status: 404 });
      }

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
              affiliatePlatforms: true
            }
          }
        }
      });
    }

    const website = agent.website;

    // 1. ACTION: RUN_NOW
    if (action === 'RUN_NOW') {
      const result = await executeAgentRun({
        agentId: agent.id,
        task: 'MANUAL_RUN',
        customInput,
        productNames,
        productUrls,
        uploadedImages
      });

      return NextResponse.json({
        success: true,
        message: `Agent "${agent.name}" executed successfully!`,
        result
      });
    }

    // 2. ACTION: TEST_AGENT (Real Diagnostic Verification)
    if (action === 'TEST_AGENT') {
      const diagnostics = await testAgentDiagnostics(website, {
        id: agent.id,
        agentName: agent.name,
        role: agent.description,
        systemPrompt: agent.instructions,
        active: agent.status === 'ACTIVE'
      });

      await prisma.agentActivityLog.create({
        data: {
          websiteId: website.id,
          agentName: agent.name,
          actionType: 'DIAGNOSTIC_TEST',
          message: `Ran diagnostic test suite for ${agent.name}. Result: ${diagnostics.overallSuccess ? 'All Systems Go' : 'Warnings Detected'}.`,
          status: diagnostics.overallSuccess ? 'SUCCESS' : 'WARNING'
        }
      });

      return NextResponse.json({
        success: true,
        diagnostics
      });
    }

    // 3. ACTION: TOGGLE_STATUS (Pause / Resume)
    if (action === 'TOGGLE_STATUS') {
      const newStatus = agent.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      const updated = await prisma.agent.update({
        where: { id: agent.id },
        data: { status: newStatus }
      });

      await prisma.agentActivityLog.create({
        data: {
          websiteId: website.id,
          agentName: agent.name,
          actionType: newStatus === 'ACTIVE' ? 'AGENT_RESUMED' : 'AGENT_PAUSED',
          message: `Agent was ${newStatus === 'ACTIVE' ? 'resumed and active' : 'paused'}.`,
          status: 'SUCCESS'
        }
      });

      return NextResponse.json({ success: true, status: updated.status, active: updated.status === 'ACTIVE' });
    }

    // 4. ACTION: DUPLICATE (Clone Agent Configuration)
    if (action === 'DUPLICATE') {
      const { targetWebsiteId, newAgentName, newWebsiteName, newDomainUrl } = payload || {};

      let destWebsiteId = targetWebsiteId || website.id;

      // If user requested duplicating with a new website
      if (newWebsiteName && newDomainUrl) {
        const slug = newWebsiteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const newSite = await prisma.website.create({
          data: {
            name: newWebsiteName,
            slug: `${slug}-${Date.now().toString().slice(-4)}`,
            domainUrl: newDomainUrl,
            niche: website.niche,
            subNiche: website.subNiche,
            targetCountry: website.targetCountry,
            targetLanguage: website.targetLanguage,
            targetAudience: website.targetAudience,
            brandVoice: website.brandVoice,
            contentStyle: website.contentStyle,
            primaryTopics: website.primaryTopics,
            topicsToAvoid: website.topicsToAvoid,
            monetization: website.monetization,
            publishingFrequency: website.publishingFrequency,
            approvalMode: website.approvalMode,
            cmsType: website.cmsType,
            status: 'ACTIVE'
          }
        });
        destWebsiteId = newSite.id;
      }

      const cloned = await prisma.agent.create({
        data: {
          name: newAgentName || `${agent.name} (Copy)`,
          description: agent.description,
          agentType: agent.agentType,
          websiteId: destWebsiteId,
          status: 'ACTIVE',
          instructions: agent.instructions,
          goals: agent.goals,
          targetCountry: agent.targetCountry,
          targetLanguage: agent.targetLanguage,
          targetAudience: agent.targetAudience,
          categories: agent.categories,
          keywords: agent.keywords,
          tone: agent.tone,
          contentRules: agent.contentRules,
          seoRules: agent.seoRules,
          affiliateRules: agent.affiliateRules,
          publishingRules: agent.publishingRules,
          schedule: agent.schedule,
          aiModel: agent.aiModel,
          tools: agent.tools,
          memoryState: agent.memoryState
        }
      });

      return NextResponse.json({
        success: true,
        message: `Agent cloned successfully as "${cloned.name}".`,
        clonedAgent: cloned
      });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Error executing agent action:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
