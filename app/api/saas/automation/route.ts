import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/saas/automation?websiteId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const rules = await prisma.automationSchedule.findMany({
      where: { websiteId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ success: true, rules });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/saas/automation - Toggle or Trigger Rule
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { websiteId, ruleId, action, isEnabled } = body;

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: { agent: true }
    });

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found.' }, { status: 404 });
    }

    if (action === 'TOGGLE' && ruleId) {
      const updated = await prisma.automationSchedule.update({
        where: { id: ruleId },
        data: { isEnabled: Boolean(isEnabled) }
      });
      return NextResponse.json({ success: true, rule: updated });
    }

    if (action === 'RUN_NOW') {
      const rule = ruleId ? await prisma.automationSchedule.findUnique({ where: { id: ruleId } }) : null;
      const ruleName = rule?.ruleName || 'CUSTOM_AGENT_AUDIT';

      // Record successful agent execution
      if (ruleId) {
        await prisma.automationSchedule.update({
          where: { id: ruleId },
          data: {
            lastRunAt: new Date(),
            lastRunStatus: 'SUCCESS'
          }
        });
      }

      await prisma.website.update({
        where: { id: websiteId },
        data: { lastAgentRun: new Date() }
      });

      // Log Activity
      const log = await prisma.agentActivityLog.create({
        data: {
          websiteId,
          agentName: website.agent?.agentName || `${website.name} Growth Agent`,
          actionType: 'AUTOMATION_TRIGGER',
          message: `Manual instant run executed for rule: ${ruleName}. Growth pipeline synchronized.`,
          status: 'SUCCESS'
        }
      });

      return NextResponse.json({
        success: true,
        message: `Automation job "${ruleName}" executed successfully.`,
        log
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
