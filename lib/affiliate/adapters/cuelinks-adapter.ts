import { BaseAffiliateAdapter } from './base-adapter';
import {
  AffiliatePlatformType,
  AffiliatePlatformConfig,
  AffiliateAdapterResult
} from '../types';

export class CuelinksAdapter extends BaseAffiliateAdapter {
  platformType: AffiliatePlatformType = 'CUELINKS';
  platformName = 'Cuelinks';

  generateAffiliateUrl(rawUrl: string, config: AffiliatePlatformConfig): AffiliateAdapterResult {
    if (!config.trackingId || config.trackingId.trim() === '') {
      return this.linkRequiredResult('Cuelinks Campaign ID (cid) / Tracking ID is required.');
    }

    if (!rawUrl || rawUrl.trim() === '') {
      return this.linkRequiredResult('Target merchant product URL is required for Cuelinks deep-link.');
    }

    const trimmedUrl = rawUrl.trim();
    if (!this.verifyProductUrl(trimmedUrl)) {
      return this.notSupportedResult('Invalid merchant product URL format.');
    }

    const cid = config.trackingId.trim();
    const encodedUrl = encodeURIComponent(trimmedUrl);
    const subId = typeof config.credentialsJson === 'object' && config.credentialsJson?.subId
      ? encodeURIComponent(config.credentialsJson.subId)
      : '';

    let deepLink = `https://linksredirect.com/?cid=${cid}&url=${encodedUrl}`;
    if (subId) {
      deepLink += `&subid=${subId}`;
    }

    return {
      success: true,
      affiliateUrl: deepLink,
      isVerified: true,
      status: 'VERIFIED',
      message: `Cuelinks automated redirect created with cid=${cid}`
    };
  }
}
