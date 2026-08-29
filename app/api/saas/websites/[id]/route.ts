import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { validateAdminAuth, unauthorizedResponse } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

// GET /api/saas/websites/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = validateAdminAuth(request);
    if (!auth.authorized) {
      return unauthorizedResponse(auth.error);
    }

    const website = await prisma.website.findUnique({
      where: { id: params.id },
      include: {
        agent: true,
        topics: { take: 10, orderBy: { priorityScore: 'desc' } },
        articles: { take: 10, orderBy: { createdAt: 'desc' } },
        integrations: true,
        automationRules: true,
        activityLogs: { take: 15, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, website });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch website.' }, { status: 500 });
  }
}

// PUT /api/saas/websites/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = validateAdminAuth(request);
    if (!auth.authorized) {
      return unauthorizedResponse(auth.error);
    }

    const body = await request.json();
    const {
      name,
      domainUrl,
      niche,
      subNiche,
      targetCountry,
      targetLanguage,
      targetAudience,
      brandVoice,
      contentStyle,
      primaryTopics,
      topicsToAvoid,
      monetization,
      publishingFrequency,
      approvalMode,
      cmsType,
      cmsConfig,
      status
    } = body;

    const existing = await prisma.website.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    const updatePayload: Record<string, any> = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (domainUrl !== undefined) {
      const trimmed = domainUrl.trim();
      updatePayload.domainUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    }
    if (niche !== undefined) updatePayload.niche = niche.trim();
    if (subNiche !== undefined) updatePayload.subNiche = subNiche ? subNiche.trim() : '';
    if (targetCountry !== undefined) updatePayload.targetCountry = targetCountry.trim();
    if (targetLanguage !== undefined) updatePayload.targetLanguage = targetLanguage.trim();
    if (targetAudience !== undefined) updatePayload.targetAudience = targetAudience;
    if (brandVoice !== undefined) updatePayload.brandVoice = brandVoice;
    if (contentStyle !== undefined) updatePayload.contentStyle = contentStyle;
    if (primaryTopics !== undefined) {
      updatePayload.primaryTopics = typeof primaryTopics === 'string' ? primaryTopics : JSON.stringify(primaryTopics);
    }
    if (topicsToAvoid !== undefined) {
      updatePayload.topicsToAvoid = typeof topicsToAvoid === 'string' ? topicsToAvoid : JSON.stringify(topicsToAvoid);
    }
    if (monetization !== undefined) {
      updatePayload.monetization = typeof monetization === 'string' ? monetization : JSON.stringify(monetization);
    }
    if (publishingFrequency !== undefined) updatePayload.publishingFrequency = publishingFrequency;
    if (approvalMode !== undefined) updatePayload.approvalMode = approvalMode;
    if (cmsType !== undefined) updatePayload.cmsType = cmsType;
    if (cmsConfig !== undefined) {
      updatePayload.cmsConfig = typeof cmsConfig === 'string' ? cmsConfig : JSON.stringify(cmsConfig);
    }
    if (status !== undefined) updatePayload.status = status;

    const updatedWebsite = await prisma.website.update({
      where: { id: params.id },
      data: updatePayload,
      include: {
        agent: true
      }
    });

    return NextResponse.json({ success: true, website: updatedWebsite });
  } catch (error: any) {
    console.error('Error updating website:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update website.' }, { status: 500 });
  }
}

// DELETE /api/saas/websites/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = validateAdminAuth(request);
    if (!auth.authorized) {
      return unauthorizedResponse(auth.error);
    }

    // Prevent deletion of TechPulse primary website
    const target = await prisma.website.findUnique({ where: { id: params.id } });
    if (!target) {
      return NextResponse.json({ success: false, error: 'Website not found' }, { status: 404 });
    }

    if (target.slug === 'techpulse') {
      return NextResponse.json({ success: false, error: 'Cannot delete the primary TechPulse website.' }, { status: 400 });
    }

    // Delete primary website record from Firestore
    await prisma.website.delete({
      where: { id: params.id }
    });

    // Cascade delete associated agents, topics, articles, and logs
    try {
      await prisma.websiteAgent.deleteMany({ where: { websiteId: params.id } });
      await prisma.agent.deleteMany({ where: { websiteId: params.id } });
      await prisma.topicOpportunity.deleteMany({ where: { websiteId: params.id } });
      await prisma.contentArticle.deleteMany({ where: { websiteId: params.id } });
      await prisma.agentActivityLog.deleteMany({ where: { websiteId: params.id } });
      await prisma.integrationCredential.deleteMany({ where: { websiteId: params.id } });
      await prisma.automationSchedule.deleteMany({ where: { websiteId: params.id } });
    } catch (cascadeError) {
      console.warn('Cascade deletion non-critical warning:', cascadeError);
    }

    return NextResponse.json({ success: true, message: 'Website removed successfully.' });
  } catch (error: any) {
    console.error('Error deleting website:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete website.' }, { status: 500 });
  }
}
