import { BaseAffiliateAdapter } from './base-adapter';
import {
  AffiliatePlatformType,
  AffiliatePlatformConfig,
  AffiliateAdapterResult
} from '../types';

export class ImpactAdapter extends BaseAffiliateAdapter {
  platformType: AffiliatePlatformType = 'IMPACT';
  platformName = 'impact.com';

  generateAffiliateUrl(rawUrl: string, config: AffiliatePlatformConfig): AffiliateAdapterResult {
    if (!config.trackingId || config.trackingId.trim() === '') {
      return this.linkRequiredResult('Impact Media Partner ID / Campaign ID is required.');
    }

    if (!rawUrl || rawUrl.trim() === '') {
      return this.linkRequiredResult('Product URL is required for deep-link.');
    }

    const trimmedUrl = rawUrl.trim();
    if (!this.verifyProductUrl(trimmedUrl)) {
      return this.notSupportedResult('Invalid product URL format.');
    }

    const partnerId = config.trackingId.trim();
    const encodedUrl = encodeURIComponent(trimmedUrl);

    if (config.deepLinkTemplate && config.deepLinkTemplate.includes('{{URL}}')) {
      const templated = config.deepLinkTemplate
        .replace('{{URL}}', encodedUrl)
        .replace('{{PARTNER_ID}}', partnerId);
      return {
        success: true,
        affiliateUrl: templated,
        isVerified: true,
        status: 'VERIFIED'
      };
    }

    // Standard Impact campaign deep link format: ?subId1 or template redirect
    const affiliateUrl = `https://impact.com/redirect?partner=${partnerId}&u=${encodedUrl}`;

    return {
      success: true,
      affiliateUrl,
      isVerified: true,
      status: 'VERIFIED',
      message: `Impact tracking URL generated for partner ${partnerId}`
    };
  }
}
