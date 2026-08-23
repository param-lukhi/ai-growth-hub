import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { validateArticleQuality } from '@/lib/saas/agent-engine';
import { generateCategoryAwareArticle } from '@/lib/saas/content-generator';
import { analyzeContentInput } from '@/lib/saas/input-analyzer';
import { buildArticleMediaPlan } from '@/lib/saas/media-engine';
import { checkDuplicateContent } from '@/lib/saas/duplicate-checker';

// GET /api/saas/content?websiteId=xxx&status=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    const status = searchParams.get('status');

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const where: any = { websiteId };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const articles = await prisma.contentArticle.findMany({
      where,
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        socialPackages: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/saas/content - Create Article Draft via Dynamic AI Content Engine or Direct Form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      websiteId,
      // If triggered via AI Engine generator:
      useAiEngine = false,
      inputParams,
      // If manual / direct parameters:
      title,
      slug,
      category,
      tags = [],
      author,
      featuredImage,
      introduction,
      content,
      pros = [],
      cons = [],
      faqs = [],
      conclusion,
      affiliateProducts = [],
      affiliateDisclosure,
      internalLinks = [],
      seoTitle,
      metaDescription,
      canonicalUrl,
      schemaJson,
      status = 'DRAFT'
    } = body;

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

    let finalArticleData: any;

    // PATH 1: AI Content Generation Engine
    if (useAiEngine && inputParams) {
      const analysis = analyzeContentInput({
        topic: inputParams.topic,
        productNames: inputParams.productNames,
        productUrl: inputParams.productUrl,
        imageUrls: inputParams.imageUrls,
        documentText: inputParams.documentText,
        customInstructions: inputParams.customInstructions,
        targetNiche: website.niche
      });

      // Duplicate check
      const duplicateCheck = await checkDuplicateContent(
        website.id,
        analysis.cleanedTitle,
        analysis.cleanedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        analysis.products.map(p => p.fullName),
        analysis.articleIntent
      );

      if (duplicateCheck.hasDuplicate && !inputParams.bypassDuplicate) {
        return NextResponse.json({
          success: false,
          error: duplicateCheck.reason,
          duplicateCheck
        }, { status: 409 });
      }

      const mediaPlan = buildArticleMediaPlan(
        analysis.cleanedTitle,
        analysis.products,
        inputParams.imageUrls || [],
        website.niche
      );

      const generated = generateCategoryAwareArticle(
        analysis,
        mediaPlan,
        website as any
      );

      finalArticleData = {
        title: generated.title,
        slug: generated.slug,
        category: generated.category,
        tags: generated.tags,
        author: generated.author,
        featuredImage: generated.featuredImage,
        introduction: generated.introduction,
        content: generated.content,
        pros: generated.pros,
        cons: generated.cons,
        faqs: generated.faqs,
        conclusion: generated.conclusion,
        affiliateProducts: generated.affiliateProducts,
        affiliateDisclosure: generated.affiliateDisclosure,
        internalLinks: generated.internalLinks,
        seoTitle: generated.seoTitle,
        metaDescription: generated.metaDescription,
        canonicalUrl: generated.canonicalUrl,
        schemaJson: generated.schemaJson,
        status: status || 'DRAFT'
      };
    } else {
      // PATH 2: Direct Form Parameters
      if (!title || !content) {
        return NextResponse.json({ success: false, error: 'title and content are required.' }, { status: 400 });
      }

      const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      finalArticleData = {
        title,
        slug: finalSlug,
        category: category || website.niche,
        tags,
        author: author || `${website.name} Editorial Team`,
        featuredImage: featuredImage || 'https://m.media-amazon.com/images/I/61aLy7kImQL._SL1500_.jpg',
        introduction,
        content,
        pros,
        cons,
        faqs,
        conclusion,
        affiliateProducts,
        affiliateDisclosure: affiliateDisclosure || 'This article may contain affiliate links. If you purchase through our links, we may earn a commission at no additional cost to you.',
        internalLinks,
        seoTitle: seoTitle || title,
        metaDescription: metaDescription || introduction?.slice(0, 155),
        canonicalUrl: canonicalUrl || `${website.domainUrl}/blog/${finalSlug}`,
        schemaJson: schemaJson || JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": title,
          "author": { "@type": "Organization", "name": website.name }
        }),
        status: status || 'DRAFT'
      };
    }

    // Ensure Unique Slug
    const existingSlug = await prisma.contentArticle.findFirst({
      where: { websiteId, slug: finalArticleData.slug }
    });
    if (existingSlug) {
      finalArticleData.slug = `${finalArticleData.slug}-${Date.now().toString().slice(-4)}`;
    }

    // Validate Quality
    const qcResult = validateArticleQuality(
      {
        title: finalArticleData.title,
        content: finalArticleData.content,
        metaDescription: finalArticleData.metaDescription,
        affiliateDisclosure: finalArticleData.affiliateDisclosure,
        schemaJson: finalArticleData.schemaJson,
        internalLinks: finalArticleData.internalLinks
      },
      website as any
    );

    const newArticle = await prisma.contentArticle.create({
      data: {
        websiteId,
        title: finalArticleData.title,
        slug: finalArticleData.slug,
        category: finalArticleData.category,
        tags: typeof finalArticleData.tags === 'string' ? finalArticleData.tags : JSON.stringify(finalArticleData.tags),
        author: finalArticleData.author,
        featuredImage: finalArticleData.featuredImage,
        introduction: finalArticleData.introduction,
        content: finalArticleData.content,
        pros: typeof finalArticleData.pros === 'string' ? finalArticleData.pros : JSON.stringify(finalArticleData.pros),
        cons: typeof finalArticleData.cons === 'string' ? finalArticleData.cons : JSON.stringify(finalArticleData.cons),
        faqs: typeof finalArticleData.faqs === 'string' ? finalArticleData.faqs : JSON.stringify(finalArticleData.faqs),
        conclusion: finalArticleData.conclusion,
        affiliateProducts: typeof finalArticleData.affiliateProducts === 'string'
          ? finalArticleData.affiliateProducts
          : JSON.stringify(finalArticleData.affiliateProducts),
        affiliateDisclosure: finalArticleData.affiliateDisclosure,
        internalLinks: typeof finalArticleData.internalLinks === 'string'
          ? finalArticleData.internalLinks
          : JSON.stringify(finalArticleData.internalLinks),
        seoTitle: finalArticleData.seoTitle,
        metaDescription: finalArticleData.metaDescription,
        canonicalUrl: finalArticleData.canonicalUrl,
        schemaJson: finalArticleData.schemaJson,
        qualityScore: qcResult.overallScore,
        qualityBreakdown: JSON.stringify(qcResult),
        status: finalArticleData.status
      }
    });

    // Create Initial Version
    await prisma.articleVersion.create({
      data: {
        articleId: newArticle.id,
        versionNumber: 1,
        title: newArticle.title,
        content: newArticle.content,
        metaDescription: newArticle.metaDescription,
        changeSummary: 'Initial research draft created by AI Content Engine'
      }
    });

    // Log Activity
    await prisma.agentActivityLog.create({
      data: {
        websiteId: website.id,
        agentName: website.agent?.agentName || `${website.name} Growth Agent`,
        actionType: 'DRAFT_GENERATED',
        message: `Generated deep article for "${finalArticleData.title}" (${qcResult.overallScore}/100 Quality Score).`,
        status: 'SUCCESS'
      }
    });

    return NextResponse.json({ success: true, article: newArticle });
  } catch (error: any) {
    console.error('Error in POST /api/saas/content:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
