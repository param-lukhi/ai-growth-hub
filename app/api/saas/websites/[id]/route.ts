import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    const updatedWebsite = await prisma.website.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(domainUrl && { domainUrl }),
        ...(niche && { niche }),
        ...(subNiche !== undefined && { subNiche }),
        ...(targetCountry && { targetCountry }),
        ...(targetLanguage && { targetLanguage }),
        ...(targetAudience !== undefined && { targetAudience }),
        ...(brandVoice !== undefined && { brandVoice }),
        ...(contentStyle !== undefined && { contentStyle }),
        ...(primaryTopics !== undefined && { primaryTopics: typeof primaryTopics === 'string' ? primaryTopics : JSON.stringify(primaryTopics) }),
        ...(topicsToAvoid !== undefined && { topicsToAvoid: typeof topicsToAvoid === 'string' ? topicsToAvoid : JSON.stringify(topicsToAvoid) }),
        ...(monetization !== undefined && { monetization: typeof monetization === 'string' ? monetization : JSON.stringify(monetization) }),
        ...(publishingFrequency && { publishingFrequency }),
        ...(approvalMode && { approvalMode }),
        ...(cmsType && { cmsType }),
        ...(cmsConfig !== undefined && { cmsConfig: typeof cmsConfig === 'string' ? cmsConfig : JSON.stringify(cmsConfig) }),
        ...(status && { status })
      },
      include: {
        agent: true
      }
    });

    return NextResponse.json({ success: true, website: updatedWebsite });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Prevent deletion of TechPulse primary website
    const target = await prisma.website.findUnique({ where: { id: params.id } });
    if (target?.slug === 'techpulse') {
      return NextResponse.json({ success: false, error: 'Cannot delete the primary TechPulse website.' }, { status: 400 });
    }

    await prisma.website.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: 'Website removed successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
