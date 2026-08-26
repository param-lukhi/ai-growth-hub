import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/saas/affiliate-platforms?websiteId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId query param is required.' }, { status: 400 });
    }

    const platforms = await prisma.websiteAffiliatePlatform.findMany({
      where: { websiteId },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Mask secrets so sensitive keys are never exposed in frontend code
    const sanitizedPlatforms = platforms.map(p => {
      let creds: any = {};
      if (p.credentialsJson) {
        try {
          const parsed = JSON.parse(p.credentialsJson);
          creds = {
            hasApiKey: !!parsed.apiKey,
            hasApiSecret: !!parsed.apiSecret,
            hasAuthToken: !!parsed.authToken,
            subId: parsed.subId || '',
            partnerId: parsed.partnerId || ''
          };
        } catch {
          creds = {};
        }
      }

      return {
        id: p.id,
        websiteId: p.websiteId,
        platformName: p.platformName,
        platformType: p.platformType,
        country: p.country,
        trackingId: p.trackingId,
        deepLinkTemplate: p.deepLinkTemplate,
        priority: p.priority,
        status: p.status,
        credentialsSummary: creds,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      };
    });

    return NextResponse.json({ success: true, platforms: sanitizedPlatforms });
  } catch (error: any) {
    console.error('Error fetching affiliate platforms:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/saas/affiliate-platforms - Add or Upsert Affiliate Platform
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      websiteId,
      platformName,
      platformType,
      country = 'India',
      trackingId,
      credentials,
      deepLinkTemplate,
      priority = 'PRIMARY',
      status = 'CONNECTED'
    } = body;

    if (!websiteId || !platformName || !platformType || !trackingId) {
      return NextResponse.json({
        success: false,
        error: 'websiteId, platformName, platformType, and trackingId are required.'
      }, { status: 400 });
    }

    // Encrypt / serialize credentials server-side
    const credentialsJson = credentials ? JSON.stringify(credentials) : null;

    const platform = await prisma.websiteAffiliatePlatform.upsert({
      where: {
        websiteId_platformName: {
          websiteId,
          platformName
        }
      },
      update: {
        platformType,
        country,
        trackingId,
        ...(credentialsJson && { credentialsJson }),
        ...(deepLinkTemplate !== undefined && { deepLinkTemplate }),
        priority,
        status
      },
      create: {
        websiteId,
        platformName,
        platformType,
        country,
        trackingId,
        credentialsJson,
        deepLinkTemplate,
        priority,
        status
      }
    });

    await prisma.agentActivityLog.create({
      data: {
        websiteId,
        agentName: 'Affiliate System',
        actionType: 'AFFILIATE_PLATFORM_CONFIGURED',
        message: `Configured affiliate platform "${platformName}" (${platformType}) with tracking ID "${trackingId}".`,
        status: 'SUCCESS'
      }
    });

    return NextResponse.json({
      success: true,
      platform: {
        id: platform.id,
        websiteId: platform.websiteId,
        platformName: platform.platformName,
        platformType: platform.platformType,
        country: platform.country,
        trackingId: platform.trackingId,
        priority: platform.priority,
        status: platform.status
      }
    });
  } catch (error: any) {
    console.error('Error saving affiliate platform:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/saas/affiliate-platforms
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id query param is required.' }, { status: 400 });
    }

    await prisma.websiteAffiliatePlatform.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Platform removed successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
