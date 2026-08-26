import {
  AffiliatePlatformType,
  AffiliatePlatformConfig,
  AffiliateAdapterResult,
  IAffiliateAdapter
} from '../types';

export abstract class BaseAffiliateAdapter implements IAffiliateAdapter {
  abstract platformType: AffiliatePlatformType;
  abstract platformName: string;

  abstract generateAffiliateUrl(rawUrl: string, config: AffiliatePlatformConfig): AffiliateAdapterResult;

  verifyProductUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  formatCta(platformName: string, customCta?: string): string {
    if (customCta && customCta.trim().length > 0) return customCta;
    return `Check Price on ${platformName}`;
  }

  protected notSupportedResult(message: string): AffiliateAdapterResult {
    return {
      success: false,
      isVerified: false,
      status: 'NOT_SUPPORTED',
      message
    };
  }

  protected linkRequiredResult(message: string): AffiliateAdapterResult {
    return {
      success: false,
      isVerified: false,
      status: 'AFFILIATE_LINK_REQUIRED',
      message
    };
  }
}
