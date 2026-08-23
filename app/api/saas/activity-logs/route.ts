import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/saas/activity-logs?websiteId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const logs = await prisma.agentActivityLog.findMany({
      where: { websiteId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
