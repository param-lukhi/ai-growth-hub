import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateInitialGrowthPlan } from '@/lib/saas/agent-engine';

export const dynamic = 'force-dynamic';

// ─── Always return JSON helper ────────────────────────────────────────────────
function jsonError(message: string, status = 500) {
  return new NextResponse(
    JSON.stringify({ success: false, error: message }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

// ─── GET /api/saas/websites ───────────────────────────────────────────────────
export async function GET() {
  try {
    // Lazy seed check
    try {
      const { ensureDefaultWebsitesSeeded } = await import('@/lib/saas/seed-data');
      await ensureDefaultWebsitesSeeded();
    } catch { /* seed errors are non-fatal */ }

    const websites = await prisma.website.findMany({
      include: {
        agent: true,
        _count: {
          select: {
            articles: true,
            topics: true,
            activityLogs: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ success: true, websites });
  } catch (err: any) {
    console.error('[GET /api/saas/websites]', err);
    return jsonError(err?.message || 'Failed to fetch websites.');
  }
}

// ─── POST /api/saas/websites ──────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return jsonError('Invalid JSON body', 400);
    }

    const {
      name,
      domainUrl,
      niche,
      subNiche = '',
      targetCountry = 'India',
      targetLanguage = 'English',
      targetAudience = '',
      brandVoice = 'Clear, helpful, practical, trustworthy',
      contentStyle = 'Research-backed buying guides and verified product comparisons',
      primaryTopics = [],
      topicsToAvoid = [],
      monetization = ['AMAZON_AFFILIATE'],
      publishingFrequency = 'WEEKLY',
      approvalMode = 'MANUAL',
      cmsType = 'NATIVE',
      cmsConfig = null
    } = body;

    if (!name || !domainUrl || !niche) {
      return jsonError('Website Name, URL, and Niche are required.', 400);
    }

    const safeName = String(name).trim();
    const safeNiche = String(niche).trim();
    const safeCountry = String(targetCountry || 'India').trim();

    // ── Build a stable slug ────────────────────────────────────────────────
    const baseSlug = safeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let finalSlug = baseSlug;
    try {
      const existing = await prisma.website.findUnique({ where: { slug: baseSlug } });
      if (existing) finalSlug = `${baseSlug}-${Date.now()}`;
    } catch { /* slug collision check is non-fatal */ }

    // ── Create website record (flat, no nested ops to minimise crash surface) ──
    let website: any;
    try {
      website = await prisma.website.create({
        data: {
          ownerId: body.ownerId || body.userId || 'admin',
          name: safeName,
          slug: finalSlug,
          domainUrl: String(domainUrl).startsWith('http') ? String(domainUrl).trim() : `https://${String(domainUrl).trim()}`,
          niche: safeNiche,
          subNiche: subNiche ? String(subNiche).trim() : '',
          targetCountry: safeCountry,
          targetLanguage: String(targetLanguage || 'English').trim(),
          targetAudience: targetAudience || `Consumers shopping in ${safeNiche}`,
          brandVoice: brandVoice || 'Clear, helpful, practical, trustworthy',
          contentStyle: contentStyle || 'Research-backed buying guides and verified product comparisons',
          primaryTopics: Array.isArray(primaryTopics) ? JSON.stringify(primaryTopics) : String(primaryTopics || '[]'),
          topicsToAvoid: Array.isArray(topicsToAvoid) ? JSON.stringify(topicsToAvoid) : String(topicsToAvoid || '[]'),
          monetization: Array.isArray(monetization) ? JSON.stringify(monetization) : String(monetization || '["AMAZON_AFFILIATE"]'),
          publishingFrequency: String(publishingFrequency || 'WEEKLY'),
          approvalMode: String(approvalMode || 'MANUAL'),
          cmsType: String(cmsType || 'NATIVE'),
          cmsConfig: cmsConfig ? (typeof cmsConfig === 'string' ? cmsConfig : JSON.stringify(cmsConfig)) : null,
          status: 'ACTIVE',
          articlesCount: 0,
          trafficCount: 0,
          affiliateClicks: 0,
          lastAgentRun: new Date(),
        }
      });
    } catch (createErr: any) {
      console.error('[POST /api/saas/websites] website create error:', createErr);
      return jsonError(createErr?.message || 'Failed to create website record.', 500);
    }

    const websiteId = website.id;

    // ── Create agent record (separate, non-blocking) ───────────────────────
    try {
      await prisma.websiteAgent.create({
        data: {
          websiteId,
          agentName: `${safeName} Growth Agent`,
          role: `${safeNiche} content, SEO, and growth optimization agent`,
          tone: 'Authoritative, clear, and reader-first',
          systemPrompt: `You are the dedicated AI Growth Agent for ${safeName}. Research topics in the ${safeNiche} niche for ${safeCountry}. Deliver high-converting, research-backed content.`,
          memoryState: JSON.stringify({
            brandVoice: brandVoice || 'Clear, practical, trustworthy',
            coveredTopics: [],
            reviewedProducts: [],
            affiliateRules: ['Disclose affiliate links clearly', 'Verify specifications'],
            targetAudience: targetAudience || `Consumers shopping in ${safeNiche}`
          }),
          active: true
        }
      });
    } catch (agentErr) {
      console.warn('[POST /api/saas/websites] agent create warning:', agentErr);
      // Non-fatal — website already created
    }

    // ── Create agent in global agents list (non-blocking) ──────────────────
    try {
      await prisma.agent.create({
        data: {
          name: `${safeName} Growth Agent`,
          description: `${safeNiche} content, SEO, and growth optimization agent`,
          agentType: 'BLOG_WRITER',
          websiteId,
          status: 'ACTIVE',
          instructions: `Research topics in the ${safeNiche} niche for ${safeCountry}.`,
          tone: 'Authoritative, clear, and reader-first',
          memoryState: '{}',
          aiModel: 'gemini-2.5-flash',
          schedule: publishingFrequency || 'WEEKLY'
        }
      });
    } catch (agentErr2) {
      console.warn('[POST /api/saas/websites] global agent create warning:', agentErr2);
    }

    // ── Create automation rules (non-blocking) ─────────────────────────────
    try {
      for (const rule of [
        { ruleName: 'DAILY_TOPIC_DISCOVERY', frequency: 'DAILY', isEnabled: false },
        { ruleName: 'POST_PUBLISH_SOCIAL', frequency: 'ON_PUBLISH', isEnabled: true },
        { ruleName: 'WEEKLY_CONTENT_PLAN', frequency: 'WEEKLY', isEnabled: false }
      ]) {
        await prisma.automationSchedule.create({ data: { ...rule, websiteId } });
      }
    } catch (ruleErr) {
      console.warn('[POST /api/saas/websites] automation rules warning:', ruleErr);
    }

    // ── Create default integrations (non-blocking) ─────────────────────────
    try {
      for (const integration of [
        { provider: 'GOOGLE_SEARCH_CONSOLE', displayName: `GSC (${safeName})`, status: 'REQUIRES_CONNECTION' },
        { provider: 'AMAZON_ASSOCIATES', displayName: `Amazon Associates (${safeName})`, status: 'REQUIRES_CONNECTION' },
        { provider: 'GOOGLE_ANALYTICS', displayName: `Google Analytics 4 (${safeName})`, status: 'REQUIRES_CONNECTION' }
      ]) {
        await prisma.integrationCredential.create({ data: { ...integration, websiteId } });
      }
    } catch (integErr) {
      console.warn('[POST /api/saas/websites] integrations warning:', integErr);
    }

    // ── Activity log (non-blocking) ────────────────────────────────────────
    try {
      await prisma.agentActivityLog.create({
        data: {
          websiteId,
          agentName: `${safeName} Growth Agent`,
          actionType: 'TOPIC_DISCOVERY',
          message: `AI Agent initialized for ${safeNiche} in ${safeCountry}. Initial Growth Report generated.`,
          status: 'SUCCESS'
        }
      });
    } catch (logErr) {
      console.warn('[POST /api/saas/websites] activity log warning:', logErr);
    }

    // ── Generate growth plan & seed topics (non-blocking) ──────────────────
    let growthPlan: any = null;
    try {
      growthPlan = generateInitialGrowthPlan(website as any);
      if (growthPlan?.topics?.length > 0) {
        await prisma.topicOpportunity.createMany({
          data: growthPlan.topics.map((t: any) => ({
            websiteId,
            topic: t.topic || 'New Topic',
            primaryKeyword: t.primaryKeyword || 'keyword',
            secondaryKeywords: JSON.stringify(t.secondaryKeywords || []),
            searchIntent: t.searchIntent || 'Commercial Investigation',
            buyerIntent: t.buyerIntent || 'High',
            competitionEstimate: t.competitionEstimate || 'Medium',
            contentOpportunity: t.contentOpportunity || `High relevance for ${safeNiche}`,
            affiliatePotential: t.affiliatePotential || 'High',
            suggestedArticleType: t.suggestedArticleType || 'Buying Guide',
            suggestedTitle: t.suggestedTitle || t.topic || 'Article',
            priorityScore: t.priorityScore || 85,
            status: 'DISCOVERED'
          }))
        });
      }
    } catch (planErr) {
      console.warn('[POST /api/saas/websites] growth plan warning:', planErr);
      // Return default growth plan so wizard step 7 still works
      growthPlan = {
        summary: `Growth Agent initialized for ${safeName} in the ${safeNiche} niche.`,
        topics: [],
        seoOpportunities: [],
        affiliateOpportunities: []
      };
    }

    // ── Fetch fully populated website for response ─────────────────────────
    let fullWebsite = website;
    try {
      const fetched = await prisma.website.findUnique({
        where: { id: websiteId },
        include: { agent: true }
      });
      if (fetched) fullWebsite = fetched;
    } catch { /* fallback to create result */ }

    return new NextResponse(
      JSON.stringify({ success: true, website: fullWebsite, growthReport: growthPlan }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[POST /api/saas/websites] unhandled error:', err);
    return jsonError(err?.message || 'Failed to create website and AI agent.', 500);
  }
}
