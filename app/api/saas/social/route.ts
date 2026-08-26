import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateSocialPackages } from '@/lib/saas/agent-engine';

export const dynamic = 'force-dynamic';

// GET /api/saas/social?websiteId=xxx&platform=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('websiteId');
    const platform = searchParams.get('platform');

    if (!websiteId) {
      return NextResponse.json({ success: false, error: 'websiteId is required.' }, { status: 400 });
    }

    const where: any = { websiteId };
    if (platform && platform !== 'ALL') {
      where.platform = platform;
    }

    const packages = await prisma.socialPackage.findMany({
      where,
      include: {
        article: { select: { title: true, slug: true, featuredImage: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/saas/social - Generate social packages for an article
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { websiteId, articleId } = body;

    if (!websiteId || !articleId) {
      return NextResponse.json({ success: false, error: 'websiteId and articleId are required.' }, { status: 400 });
    }

    const website = await prisma.website.findUnique({ where: { id: websiteId } });
    const article = await prisma.contentArticle.findUnique({ where: { id: articleId } });

    if (!website || !article) {
      return NextResponse.json({ success: false, error: 'Website or Article not found.' }, { status: 404 });
    }

    const packages = generateSocialPackages(article as any, website as any);

    // Save or update social packages
    const createdPinterest = await prisma.socialPackage.create({
      data: {
        websiteId,
        articleId,
        platform: 'PINTEREST',
        title: packages.pinterest.title || '',
        bodyContent: packages.pinterest.bodyContent || '',
        tags: JSON.stringify(packages.pinterest.tags || []),
        cta: packages.pinterest.cta || '',
        status: 'READY'
      }
    });

    const createdYouTube = await prisma.socialPackage.create({
      data: {
        websiteId,
        articleId,
        platform: 'YOUTUBE_SHORTS',
        title: packages.youtube.title || '',
        hook: packages.youtube.hook || '',
        bodyContent: packages.youtube.bodyContent || '',
        sceneList: JSON.stringify(packages.youtube.sceneList || []),
        tags: JSON.stringify(packages.youtube.tags || []),
        cta: packages.youtube.cta || '',
        status: 'READY'
      }
    });

    const createdInstagram = await prisma.socialPackage.create({
      data: {
        websiteId,
        articleId,
        platform: 'INSTAGRAM_REELS',
        title: packages.instagram.title || '',
        hook: packages.instagram.hook || '',
        bodyContent: packages.instagram.bodyContent || '',
        tags: JSON.stringify(packages.instagram.tags || []),
        cta: packages.instagram.cta || '',
        status: 'READY'
      }
    });

    const createdMedium = await prisma.socialPackage.create({
      data: {
        websiteId,
        articleId,
        platform: 'MEDIUM',
        title: packages.medium.title || '',
        bodyContent: packages.medium.bodyContent || '',
        tags: JSON.stringify(packages.medium.tags || []),
        cta: packages.medium.cta || '',
        status: 'READY'
      }
    });

    // Log Activity
    await prisma.agentActivityLog.create({
      data: {
        websiteId,
        agentName: `${website.name} Growth Agent`,
        actionType: 'SOCIAL_GENERATION',
        message: `Generated multi-channel social campaign for "${article.title}" (Pinterest, YouTube Shorts, Instagram Reels, Medium).`,
        status: 'SUCCESS'
      }
    });

    return NextResponse.json({
      success: true,
      packages: {
        pinterest: createdPinterest,
        youtube: createdYouTube,
        instagram: createdInstagram,
        medium: createdMedium
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
