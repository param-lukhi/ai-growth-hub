import { BaseAffiliateAdapter } from './base-adapter';
import {
  AffiliatePlatformType,
  AffiliatePlatformConfig,
  AffiliateAdapterResult
} from '../types';

export class VCommissionAdapter extends BaseAffiliateAdapter {
  platformType: AffiliatePlatformType = 'VCOMMISSION';
  platformName = 'vCommission';

  generateAffiliateUrl(rawUrl: string, config: AffiliatePlatformConfig): AffiliateAdapterResult {
    if (!config.trackingId || config.trackingId.trim() === '') {
      return this.linkRequiredResult('vCommission Publisher ID / Campaign ID is required.');
    }

    if (!rawUrl || rawUrl.trim() === '') {
      return this.linkRequiredResult('Product URL is required for deep-link.');
    }

    const trimmedUrl = rawUrl.trim();
    if (!this.verifyProductUrl(trimmedUrl)) {
      return this.notSupportedResult('Invalid product URL format.');
    }

    const pubId = config.trackingId.trim();
    const encodedUrl = encodeURIComponent(trimmedUrl);

    // If custom deep link template provided, use it
    if (config.deepLinkTemplate && config.deepLinkTemplate.includes('{{URL}}')) {
      const templated = config.deepLinkTemplate
        .replace('{{URL}}', encodedUrl)
        .replace('{{PUB_ID}}', pubId);
      return {
        success: true,
        affiliateUrl: templated,
        isVerified: true,
        status: 'VERIFIED'
      };
    }

    // Standard vCommission redirect tracking format
    const affiliateUrl = `https://tracking.vcommission.com/aff_c?offer_id=${pubId}&url=${encodedUrl}`;

    return {
      success: true,
      affiliateUrl,
      isVerified: true,
      status: 'VERIFIED',
      message: `vCommission tracking link generated with offer/pub_id=${pubId}`
    };
  }
}
