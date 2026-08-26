import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/saas/integrations?websiteId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const integrations = await prisma.integrationCredential.findMany({
      where: { websiteId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ success: true, integrations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/saas/integrations - Save or Connect integration credentials
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { websiteId, provider, displayName, configJson, credentialsJson, status = 'CONNECTED' } = body;

    if (!websiteId || !provider) {
      return NextResponse.json({ success: false, error: 'websiteId and provider are required.' }, { status: 400 });
    }

    const existing = await prisma.integrationCredential.findFirst({
      where: { websiteId, provider }
    });

    let integration;
    if (existing) {
      integration = await prisma.integrationCredential.update({
        where: { id: existing.id },
        data: {
          displayName: displayName || existing.displayName,
          status,
          configJson: typeof configJson === 'string' ? configJson : JSON.stringify(configJson || {}),
          credentialsJson: typeof credentialsJson === 'string' ? credentialsJson : JSON.stringify(credentialsJson || {})
        }
      });
    } else {
      integration = await prisma.integrationCredential.create({
        data: {
          websiteId,
          provider,
          displayName: displayName || provider,
          status,
          configJson: typeof configJson === 'string' ? configJson : JSON.stringify(configJson || {}),
          credentialsJson: typeof credentialsJson === 'string' ? credentialsJson : JSON.stringify(credentialsJson || {})
        }
      });
    }

    // Log Activity
    await prisma.agentActivityLog.create({
      data: {
        websiteId,
        agentName: 'System Integration Hub',
        actionType: 'INTEGRATION_UPDATE',
        message: `Updated integration settings for ${displayName || provider} (${status})`,
        status: 'SUCCESS'
      }
    });

    return NextResponse.json({ success: true, integration });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
