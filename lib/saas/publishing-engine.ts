import prisma from '@/lib/db';
import { ContentArticleData, WebsiteData } from './types';

export interface PublishResult {
  success: boolean;
  publishedUrl?: string;
  externalId?: string;
  error?: string;
  method: 'NATIVE' | 'WORDPRESS' | 'WEBHOOK' | 'CUSTOM';
}

/**
 * Universal Multi-CMS Publishing Engine
 * Routes publishing based on website.cmsType:
 * - NATIVE: Injects directly into TechPulse Blog database system
 * - WORDPRESS: Posts via WordPress REST API with Application Passwords
 * - WEBHOOK: Emits payload to custom CMS webhook
 */
export async function publishArticle(
  article: ContentArticleData,
  website: WebsiteData
): Promise<PublishResult> {
  try {
    // 1. First create a backup snapshot version before publishing
    await createSnapshotVersion(article.id, `Publishing version at ${new Date().toISOString()}`);

    // If website is TechPulse or NATIVE CMS
    if (website.cmsType === 'NATIVE' || website.slug === 'techpulse') {
      return await publishToNativeTechPulse(article, website);
    }

    // If website is WordPress
    if (website.cmsType === 'WORDPRESS') {
      return await publishToWordPress(article, website);
    }

    // If website is Webhook / Custom CMS
    if (website.cmsType === 'WEBHOOK') {
      return await publishToWebhook(article, website);
    }

    // Fallback: Simulate or record as published locally
    const fallbackUrl = `${website.domainUrl.replace(/\/$/, '')}/blog/${article.slug}`;
    await prisma.contentArticle.update({
      where: { id: article.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedUrl: fallbackUrl
      }
    });

    return {
      success: true,
      publishedUrl: fallbackUrl,
      method: 'CUSTOM'
    };
  } catch (error: any) {
    console.error('Publishing failed:', error);
    return {
      success: false,
      error: error?.message || 'Unknown publishing error occurred.',
      method: website.cmsType
    };
  }
}

/**
 * Publishes an article directly into the existing TechPulse Blog system
 */
async function publishToNativeTechPulse(
  article: ContentArticleData,
  website: WebsiteData
): Promise<PublishResult> {
  // Find or match category in existing categories
  let category = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { contains: article.category, mode: 'insensitive' } },
        { slug: { contains: article.category.toLowerCase().replace(/\s+/g, '-'), mode: 'insensitive' } }
      ]
    }
  });

  if (!category) {
    category = await prisma.category.findFirst();
  }

  if (!category) {
    // Create a fallback category if none exists
    category = await prisma.category.create({
      data: {
        name: article.category || 'Technology',
        slug: (article.category || 'technology').toLowerCase().replace(/\s+/g, '-'),
        description: 'Technology reviews and buying guides'
      }
    });
  }

  const tagsString = Array.isArray(article.tags) ? JSON.stringify(article.tags) : article.tags || '[]';
  const faqsString = article.faqs ? JSON.stringify(article.faqs) : null;
  const prosString = article.pros ? JSON.stringify(article.pros) : null;
  const consString = article.cons ? JSON.stringify(article.cons) : null;

  // Check if a Blog with this slug already exists
  const existingBlog = await prisma.blog.findUnique({
    where: { slug: article.slug }
  });

  let blogRecord;
  if (existingBlog) {
    blogRecord = await prisma.blog.update({
      where: { id: existingBlog.id },
      data: {
        title: article.title,
        metaTitle: article.seoTitle || article.title,
        metaDescription: article.metaDescription || article.introduction?.slice(0, 150),
        featuredImage: article.featuredImage || 'https://m.media-amazon.com/images/I/61aLy7kImQL._SL1500_.jpg',
        content: article.content,
        faqs: faqsString,
        pros: prosString,
        cons: consString,
        conclusion: article.conclusion,
        categoryId: category.id,
        tags: tagsString,
        status: 'PUBLISHED'
      }
    });
  } else {
    blogRecord = await prisma.blog.create({
      data: {
        title: article.title,
        slug: article.slug,
        metaTitle: article.seoTitle || article.title,
        metaDescription: article.metaDescription || article.introduction?.slice(0, 150),
        featuredImage: article.featuredImage || 'https://m.media-amazon.com/images/I/61aLy7kImQL._SL1500_.jpg',
        content: article.content,
        faqs: faqsString,
        pros: prosString,
        cons: consString,
        conclusion: article.conclusion,
        amazonUrl: 'https://amazon.in',
        affiliateUrl: '/api/affiliate-links/techpulse-direct',
        categoryId: category.id,
        tags: tagsString,
        status: 'PUBLISHED'
      }
    });
  }

  const publishedUrl = `${website.domainUrl.replace(/\/$/, '')}/blog/${article.slug}`;

  // Update SaaS ContentArticle record
  await prisma.contentArticle.update({
    where: { id: article.id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      publishedUrl,
      externalCmsId: blogRecord.id
    }
  });

  // Log activity
  await prisma.agentActivityLog.create({
    data: {
      websiteId: website.id,
      agentName: website.name + ' Growth Agent',
      actionType: 'PUBLISHING',
      message: `Successfully published "${article.title}" to TechPulse blog`,
      details: JSON.stringify({ url: publishedUrl, blogId: blogRecord.id }),
      status: 'SUCCESS'
    }
  });

  return {
    success: true,
    publishedUrl,
    externalId: blogRecord.id,
    method: 'NATIVE'
  };
}

/**
 * Publishes an article via WordPress REST API
 */
async function publishToWordPress(
  article: ContentArticleData,
  website: WebsiteData
): Promise<PublishResult> {
  const config = typeof website.cmsConfig === 'string' ? JSON.parse(website.cmsConfig || '{}') : (website.cmsConfig || {});
  
  if (!config.wpUrl || !config.username || !config.appPassword) {
    return {
      success: false,
      error: 'WordPress integration credentials missing. Please configure WordPress URL, Username, and Application Password in Integrations.',
      method: 'WORDPRESS'
    };
  }

  const wpEndpoint = `${config.wpUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`;
  const authHeader = 'Basic ' + Buffer.from(`${config.username}:${config.appPassword}`).toString('base64');

  const postPayload = {
    title: article.title,
    content: article.content,
    slug: article.slug,
    status: 'publish',
    excerpt: article.metaDescription || article.introduction?.slice(0, 150)
  };

  const response = await fetch(wpEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify(postPayload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WordPress REST API error (${response.status}): ${errorText}`);
  }

  const wpData = await response.json();
  const publishedUrl = wpData.link || `${website.domainUrl}/blog/${article.slug}`;

  await prisma.contentArticle.update({
    where: { id: article.id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      publishedUrl,
      externalCmsId: String(wpData.id)
    }
  });

  return {
    success: true,
    publishedUrl,
    externalId: String(wpData.id),
    method: 'WORDPRESS'
  };
}

/**
 * Publishes via Webhook
 */
async function publishToWebhook(
  article: ContentArticleData,
  website: WebsiteData
): Promise<PublishResult> {
  const config = typeof website.cmsConfig === 'string' ? JSON.parse(website.cmsConfig || '{}') : (website.cmsConfig || {});
  if (!config.webhookUrl) {
    return {
      success: false,
      error: 'Webhook URL not configured in CMS settings.',
      method: 'WEBHOOK'
    };
  }

  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Agent-Secret': config.secretKey || ''
    },
    body: JSON.stringify({
      event: 'ARTICLE_PUBLISHED',
      website: { id: website.id, name: website.name, domain: website.domainUrl },
      article
    })
  });

  if (!response.ok) {
    throw new Error(`Webhook target responded with status ${response.status}`);
  }

  const publishedUrl = `${website.domainUrl.replace(/\/$/, '')}/blog/${article.slug}`;
  await prisma.contentArticle.update({
    where: { id: article.id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      publishedUrl
    }
  });

  return {
    success: true,
    publishedUrl,
    method: 'WEBHOOK'
  };
}

/**
 * Create a Version Snapshot for instant rollback
 */
export async function createSnapshotVersion(
  articleId: string,
  summary: string = 'Automatic snapshot'
): Promise<void> {
  const article = await prisma.contentArticle.findUnique({
    where: { id: articleId },
    include: { versions: true }
  });

  if (!article) return;

  const nextVersionNum = (article.versions?.length || 0) + 1;

  await prisma.articleVersion.create({
    data: {
      articleId,
      versionNumber: nextVersionNum,
      title: article.title,
      content: article.content,
      metaDescription: article.metaDescription,
      changeSummary: summary
    }
  });
}

/**
 * Rollback article to a previous version
 */
export async function rollbackArticleVersion(
  articleId: string,
  versionId: string
): Promise<{ success: boolean; error?: string }> {
  const version = await prisma.articleVersion.findUnique({
    where: { id: versionId }
  });

  if (!version || version.articleId !== articleId) {
    return { success: false, error: 'Target version not found.' };
  }

  // Create snapshot of current state before rollback
  await createSnapshotVersion(articleId, `Pre-rollback snapshot before reverting to v${version.versionNumber}`);

  await prisma.contentArticle.update({
    where: { id: articleId },
    data: {
      title: version.title,
      content: version.content,
      metaDescription: version.metaDescription
    }
  });

  return { success: true };
}
