import prisma from '@/lib/db';
import {
  AffiliatePlatformType,
  AffiliatePlatformConfig,
  ProductAffiliateLink,
  MultiPlatformProductPricing,
  AffiliateAdapterResult,
  IAffiliateAdapter
} from './types';
import { AmazonAdapter } from './adapters/amazon-adapter';
import { FlipkartAdapter } from './adapters/flipkart-adapter';
import { CuelinksAdapter } from './adapters/cuelinks-adapter';
import { VCommissionAdapter } from './adapters/vcommission-adapter';
import { ImpactAdapter } from './adapters/impact-adapter';

// Adapter Registry
const adapters: Record<AffiliatePlatformType, IAffiliateAdapter> = {
  AMAZON: new AmazonAdapter(),
  FLIPKART: new FlipkartAdapter(),
  CUELINKS: new CuelinksAdapter(),
  VCOMMISSION: new VCommissionAdapter(),
  IMPACT: new ImpactAdapter(),
  CUSTOM: new AmazonAdapter() // fallback for custom tag injection
};

export function getAffiliateAdapter(platformType: AffiliatePlatformType): IAffiliateAdapter {
  return adapters[platformType] || adapters.AMAZON;
}

/**
 * Fetch all configured and active affiliate platforms for a specific website.
 * Enforces strict multi-tenant isolation.
 */
export async function getWebsiteAffiliatePlatforms(websiteId: string): Promise<AffiliatePlatformConfig[]> {
  const platforms = await prisma.websiteAffiliatePlatform.findMany({
    where: {
      websiteId,
      status: { not: 'DISABLED' }
    },
    orderBy: [
      { priority: 'asc' },
      { createdAt: 'asc' }
    ]
  });

  return platforms.map(p => ({
    id: p.id,
    websiteId: p.websiteId,
    platformName: p.platformName,
    platformType: p.platformType as AffiliatePlatformType,
    country: p.country,
    trackingId: p.trackingId,
    credentialsJson: p.credentialsJson ? JSON.parse(p.credentialsJson) : null,
    deepLinkTemplate: p.deepLinkTemplate,
    priority: p.priority as any,
    status: p.status as any
  }));
}

/**
 * Generate a verified affiliate link for a single product across a specific platform config.
 */
export function generatePlatformAffiliateLink(
  rawProductUrl: string,
  platformConfig: AffiliatePlatformConfig,
  productName: string = ''
): ProductAffiliateLink {
  const adapter = getAffiliateAdapter(platformConfig.platformType);
  const result: AffiliateAdapterResult = adapter.generateAffiliateUrl(rawProductUrl, platformConfig);

  const isVerified = result.success && !!result.affiliateUrl;
  const affiliateUrl = isVerified ? (result.affiliateUrl as string) : rawProductUrl;
  const ctaText = adapter.formatCta(platformConfig.platformName);

  return {
    platformName: platformConfig.platformName,
    platformType: platformConfig.platformType,
    productName,
    rawUrl: rawProductUrl,
    affiliateUrl,
    isVerified,
    verificationStatus: isVerified ? 'VERIFIED' : (result.status || 'AFFILIATE_LINK_REQUIRED'),
    lastVerifiedAt: new Date(),
    ctaText
  };
}

/**
 * Automatically map a product to all connected affiliate platforms for a website.
 * Prioritizes PRIMARY platform and adds verified SECONDARY platform buttons.
 */
export async function mapProductToAffiliatePlatforms(
  websiteId: string,
  product: {
    name: string;
    brand?: string;
    model?: string;
    rawUrl?: string;
    uploadedImages?: string[];
    price?: string;
    currency?: string;
  }
): Promise<MultiPlatformProductPricing> {
  const connectedPlatforms = await getWebsiteAffiliatePlatforms(websiteId);

  // If no database platform records exist yet, check website.monetization fallback
  if (connectedPlatforms.length === 0) {
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: { slug: true, targetCountry: true, monetization: true }
    });

    const defaultTag = website?.slug === 'techpulse' ? 'techpulse-20' : `${website?.slug || 'site'}-20`;
    const defaultCountry = website?.targetCountry || 'India';

    // Default primary Amazon platform
    connectedPlatforms.push({
      websiteId,
      platformName: defaultCountry === 'India' ? 'Amazon India' : 'Amazon',
      platformType: 'AMAZON',
      country: defaultCountry,
      trackingId: defaultTag,
      priority: 'PRIMARY',
      status: 'CONNECTED'
    });
  }

  const primaryConfig = connectedPlatforms.find(p => p.priority === 'PRIMARY') || connectedPlatforms[0];
  const generatedLinks: ProductAffiliateLink[] = [];

  for (const platform of connectedPlatforms) {
    if (!product.rawUrl && platform.platformType === 'AMAZON') {
      // Default canonical search or product lookup pattern
      const searchSlug = encodeURIComponent(`${product.brand || ''} ${product.name}`.trim());
      const host = platform.country === 'India' ? 'www.amazon.in' : 'www.amazon.com';
      const searchUrl = `https://${host}/s?k=${searchSlug}`;
      const link = generatePlatformAffiliateLink(searchUrl, platform, product.name);
      generatedLinks.push(link);
    } else if (product.rawUrl) {
      const link = generatePlatformAffiliateLink(product.rawUrl, platform, product.name);
      if (link.isVerified) {
        generatedLinks.push(link);
      }
    }
  }

  return {
    productName: product.name,
    brand: product.brand,
    model: product.model,
    image: product.uploadedImages?.[0],
    uploadedImages: product.uploadedImages || [],
    primaryPlatform: primaryConfig.platformType,
    links: generatedLinks
  };
}
