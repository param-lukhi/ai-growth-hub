import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { analyzeContentInput } from '@/lib/saas/input-analyzer';
import { checkDuplicateContent } from '@/lib/saas/duplicate-checker';
import { buildArticleMediaPlan } from '@/lib/saas/media-engine';
import { getCategorySchema } from '@/lib/saas/category-engine';

// POST /api/saas/content/analyze - Pre-Generation Input Analysis & Duplicate Risk Assessment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      websiteId,
      topic,
      productNames = [],
      productUrl,
      imageUrls = [],
      documentText,
      customInstructions
    } = body;

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { id: websiteId }
    });

    if (!website) {
      return NextResponse.json({ success: false, error: 'Website not found.' }, { status: 404 });
    }

    // 1. Analyze Input
    const analysis = analyzeContentInput({
      topic,
      productNames,
      productUrl,
      imageUrls,
      documentText,
      customInstructions,
      targetNiche: website.niche
    });

    // 2. Duplicate Topic & Product Protection
    const duplicateCheck = await checkDuplicateContent(
      website.id,
      analysis.cleanedTitle,
      analysis.cleanedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      analysis.products.map(p => p.fullName),
      analysis.articleIntent
    );

    // 3. Build Exact Media Plan
    const mediaPlan = buildArticleMediaPlan(
      analysis.cleanedTitle,
      analysis.products,
      imageUrls,
      website.niche
    );

    // 4. Resolve Schema Details
    const schema = getCategorySchema(`${analysis.category} ${analysis.productType}`);

    const monList: string[] = typeof website.monetization === 'string'
      ? JSON.parse(website.monetization || '[]')
      : (website.monetization as any || []);
    const affiliateAvailable = monList.includes('AMAZON_AFFILIATE') || monList.includes('OTHER_AFFILIATE');

    return NextResponse.json({
      success: true,
      analysis,
      duplicateCheck,
      mediaPlan,
      schemaSummary: {
        category: schema.category,
        specFieldsCount: schema.specs.length,
        criticalSpecs: schema.specs.filter(s => s.importance === 'CRITICAL').map(s => s.name),
        irrelevantCriteriaBlocked: schema.irrelevantCriteria
      },
      affiliateAvailable
    });
  } catch (error: any) {
    console.error('Error analyzing content input:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
