import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { validateArticleQuality, generateSocialPackages } from '@/lib/saas/agent-engine';
import { publishArticle, createSnapshotVersion } from '@/lib/saas/publishing-engine';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.contentArticle.findUnique({
      where: { id: params.id },
      include: {
        website: { include: { agent: true } },
        versions: { orderBy: { versionNumber: 'desc' } },
        socialPackages: true
      }
    });

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, article });
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
    const { action, ...updateData } = body;

    const currentArticle = await prisma.contentArticle.findUnique({
      where: { id: params.id },
      include: {
        website: { include: { agent: true } },
        versions: true
      }
    });

    if (!currentArticle) {
      return NextResponse.json({ success: false, error: 'Article not found.' }, { status: 404 });
    }

    const website = currentArticle.website;

    // Action 1: PUBLISH
    if (action === 'PUBLISH') {
      const publishResult = await publishArticle(currentArticle as any, website as any);

      if (!publishResult.success) {
        return NextResponse.json({ success: false, error: publishResult.error }, { status: 500 });
      }

      // Check if auto social generation is enabled
      const socialPkg = generateSocialPackages(currentArticle as any, website as any);
      await prisma.socialPackage.createMany({
        data: [
          {
            websiteId: website.id,
            articleId: currentArticle.id,
            platform: 'PINTEREST',
            title: socialPkg.pinterest.title || '',
            bodyContent: socialPkg.pinterest.bodyContent || '',
            tags: JSON.stringify(socialPkg.pinterest.tags || []),
            cta: socialPkg.pinterest.cta || '',
            status: 'READY'
          },
          {
            websiteId: website.id,
            articleId: currentArticle.id,
            platform: 'YOUTUBE_SHORTS',
            title: socialPkg.youtube.title || '',
            hook: socialPkg.youtube.hook || '',
            bodyContent: socialPkg.youtube.bodyContent || '',
            sceneList: JSON.stringify(socialPkg.youtube.sceneList || []),
            tags: JSON.stringify(socialPkg.youtube.tags || []),
            cta: socialPkg.youtube.cta || '',
            status: 'READY'
          },
          {
            websiteId: website.id,
            articleId: currentArticle.id,
            platform: 'INSTAGRAM_REELS',
            title: socialPkg.instagram.title || '',
            hook: socialPkg.instagram.hook || '',
            bodyContent: socialPkg.instagram.bodyContent || '',
            tags: JSON.stringify(socialPkg.instagram.tags || []),
            cta: socialPkg.instagram.cta || '',
            status: 'READY'
          },
          {
            websiteId: website.id,
            articleId: currentArticle.id,
            platform: 'MEDIUM',
            title: socialPkg.medium.title || '',
            bodyContent: socialPkg.medium.bodyContent || '',
            tags: JSON.stringify(socialPkg.medium.tags || []),
            cta: socialPkg.medium.cta || '',
            status: 'READY'
          }
        ]
      });

      const refreshed = await prisma.contentArticle.findUnique({
        where: { id: params.id },
        include: { versions: true, socialPackages: true }
      });

      return NextResponse.json({
        success: true,
        message: 'Article published successfully.',
        publishedUrl: publishResult.publishedUrl,
        article: refreshed
      });
    }

    // Action 2: APPROVE
    if (action === 'APPROVE') {
      const updated = await prisma.contentArticle.update({
        where: { id: params.id },
        data: { status: 'APPROVED' }
      });
      return NextResponse.json({ success: true, article: updated });
    }

    // Action 3: REJECT
    if (action === 'REJECT') {
      const updated = await prisma.contentArticle.update({
        where: { id: params.id },
        data: { status: 'REJECTED' }
      });
      return NextResponse.json({ success: true, article: updated });
    }

    // Action 4: SCHEDULE
    if (action === 'SCHEDULE') {
      const { scheduledFor } = body;
      const updated = await prisma.contentArticle.update({
        where: { id: params.id },
        data: {
          status: 'SCHEDULED',
          scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(Date.now() + 86400000 * 2)
        }
      });
      return NextResponse.json({ success: true, article: updated });
    }

    // Regular Update / Edit draft
    const updatedContent = updateData.content !== undefined ? updateData.content : currentArticle.content;
    const updatedTitle = updateData.title !== undefined ? updateData.title : currentArticle.title;

    // Create snapshot if content changed significantly
    if (updateData.content && updateData.content !== currentArticle.content) {
      await createSnapshotVersion(params.id, updateData.changeSummary || 'Content edited by user');
    }

    // Recalculate Quality Score
    const qcResult = validateArticleQuality(
      {
        ...currentArticle,
        ...updateData,
        content: updatedContent,
        title: updatedTitle
      } as any,
      website as any
    );

    const updated = await prisma.contentArticle.update({
      where: { id: params.id },
      data: {
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.slug && { slug: updateData.slug }),
        ...(updateData.category && { category: updateData.category }),
        ...(updateData.tags && { tags: typeof updateData.tags === 'string' ? updateData.tags : JSON.stringify(updateData.tags) }),
        ...(updateData.author && { author: updateData.author }),
        ...(updateData.featuredImage !== undefined && { featuredImage: updateData.featuredImage }),
        ...(updateData.introduction !== undefined && { introduction: updateData.introduction }),
        ...(updateData.content !== undefined && { content: updateData.content }),
        ...(updateData.pros !== undefined && { pros: typeof updateData.pros === 'string' ? updateData.pros : JSON.stringify(updateData.pros) }),
        ...(updateData.cons !== undefined && { cons: typeof updateData.cons === 'string' ? updateData.cons : JSON.stringify(updateData.cons) }),
        ...(updateData.faqs !== undefined && { faqs: typeof updateData.faqs === 'string' ? updateData.faqs : JSON.stringify(updateData.faqs) }),
        ...(updateData.conclusion !== undefined && { conclusion: updateData.conclusion }),
        ...(updateData.affiliateDisclosure !== undefined && { affiliateDisclosure: updateData.affiliateDisclosure }),
        ...(updateData.seoTitle !== undefined && { seoTitle: updateData.seoTitle }),
        ...(updateData.metaDescription !== undefined && { metaDescription: updateData.metaDescription }),
        ...(updateData.canonicalUrl !== undefined && { canonicalUrl: updateData.canonicalUrl }),
        ...(updateData.schemaJson !== undefined && { schemaJson: updateData.schemaJson }),
        ...(updateData.status && { status: updateData.status }),
        qualityScore: qcResult.overallScore,
        qualityBreakdown: JSON.stringify(qcResult)
      },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        socialPackages: true
      }
    });

    return NextResponse.json({ success: true, article: updated });
  } catch (error: any) {
    console.error('Error updating article:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contentArticle.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true, message: 'Article deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
