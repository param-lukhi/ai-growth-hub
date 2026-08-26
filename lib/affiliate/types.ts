export type AffiliatePlatformType =
  | 'AMAZON'
  | 'FLIPKART'
  | 'CUELINKS'
  | 'VCOMMISSION'
  | 'IMPACT'
  | 'CUSTOM';

export type PlatformPriority = 'PRIMARY' | 'SECONDARY' | 'TERTIARY';

export type PlatformStatus = 'CONNECTED' | 'REQUIRES_CREDENTIALS' | 'MANUAL_ONLY' | 'DISABLED';

export interface AffiliatePlatformConfig {
  id?: string;
  websiteId: string;
  platformName: string;
  platformType: AffiliatePlatformType;
  country: string;
  trackingId: string;
  credentialsJson?: {
    apiKey?: string;
    apiSecret?: string;
    associateTag?: string;
    partnerId?: string;
    subId?: string;
    campaignId?: string;
    endpoint?: string;
    [key: string]: any;
  } | string | null;
  deepLinkTemplate?: string | null;
  priority: PlatformPriority;
  status: PlatformStatus;
}

export interface ProductAffiliateLink {
  platformName: string;
  platformType: AffiliatePlatformType;
  productName: string;
  rawUrl: string;
  affiliateUrl: string;
  price?: string;
  currency?: string;
  isVerified: boolean;
  verificationStatus: 'VERIFIED' | 'AFFILIATE_LINK_REQUIRED' | 'NOT_SUPPORTED';
  lastVerifiedAt?: Date | string;
  ctaText: string;
}

export interface MultiPlatformProductPricing {
  productName: string;
  brand?: string;
  model?: string;
  image?: string;
  uploadedImages?: string[];
  primaryPlatform: AffiliatePlatformType;
  links: ProductAffiliateLink[];
}

export interface AffiliateAdapterResult {
  success: boolean;
  affiliateUrl?: string;
  productName?: string;
  price?: string;
  currency?: string;
  imageUrl?: string;
  isVerified: boolean;
  status: 'VERIFIED' | 'AFFILIATE_LINK_REQUIRED' | 'NOT_SUPPORTED';
  message?: string;
}

export interface IAffiliateAdapter {
  platformType: AffiliatePlatformType;
  platformName: string;
  generateAffiliateUrl(rawUrl: string, config: AffiliatePlatformConfig): AffiliateAdapterResult;
  verifyProductUrl(url: string): boolean;
  formatCta(platformName: string, customCta?: string): string;
}
