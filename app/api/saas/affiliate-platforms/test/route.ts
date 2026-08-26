import { NextResponse } from 'next/server';
import { generatePlatformAffiliateLink } from '@/lib/affiliate/affiliate-engine';
import { AffiliatePlatformConfig } from '@/lib/affiliate/types';

// POST /api/saas/affiliate-platforms/test
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawUrl, platformConfig } = body;

    if (!rawUrl || !platformConfig) {
      return NextResponse.json({
        success: false,
        error: 'rawUrl and platformConfig are required.'
      }, { status: 400 });
    }

    const config: AffiliatePlatformConfig = {
      websiteId: platformConfig.websiteId || 'temp',
      platformName: platformConfig.platformName || 'Test Platform',
      platformType: platformConfig.platformType || 'AMAZON',
      country: platformConfig.country || 'India',
      trackingId: platformConfig.trackingId || '',
      credentialsJson: platformConfig.credentialsJson,
      deepLinkTemplate: platformConfig.deepLinkTemplate,
      priority: platformConfig.priority || 'PRIMARY',
      status: platformConfig.status || 'CONNECTED'
    };

    const link = generatePlatformAffiliateLink(rawUrl, config, platformConfig.productName || 'Test Product');

    return NextResponse.json({
      success: link.isVerified,
      link
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
